const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const https = require('https');
const http = require('http');

const PORT = Number(process.env.PORT || 5000);
const TUNNEL_INFO_PATH = path.join(__dirname, '.tunnel-info.json');
const SSH_COMMAND = 'ssh';
const SSH_ARGS = [
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'ServerAliveInterval=30',
  '-R', `80:127.0.0.1:${PORT}`,
  'nokey@localhost.run',
];

let localtunnelInstance = null;

async function connectViaLocaltunnel() {
  try {
    // Lazy require to avoid loading unless needed
    const localtunnel = require('localtunnel');
    console.log('[tunnel] attempting localtunnel fallback...');
    const lt = await localtunnel({ port: PORT });
    localtunnelInstance = lt;
    const url = lt.url.replace(/\/$/, '');
    console.log('[tunnel] localtunnel URL =', url);
    writeTunnelInfo(url, true);

    // wait until closed
    await new Promise((resolve) => {
      lt.on('close', resolve);
    });
  } catch (e) {
    console.error('[tunnel] localtunnel fallback failed:', e?.message || e);
    throw e;
  } finally {
    try {
      localtunnelInstance = null;
    } catch {}
  }
}

function writeTunnelInfo(tunnelUrl, healthy, extra = {}) {
  const payload = Object.assign({
    tunnelUrl,
    apiBase: `${tunnelUrl}/api`,
    port: PORT,
    updatedAt: new Date().toISOString(),
    healthy: typeof healthy === 'undefined' ? null : !!healthy,
  }, extra || {});

  try {
    fs.writeFileSync(TUNNEL_INFO_PATH, JSON.stringify(payload, null, 2), 'utf8');
  } catch (e) {
    console.error('[tunnel] failed to write tunnel info file:', e && e.message);
  }
}

function clearTunnelInfo() {
  try {
    if (fs.existsSync(TUNNEL_INFO_PATH)) {
      fs.unlinkSync(TUNNEL_INFO_PATH);
    }
  } catch {
    // noop
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let shuttingDown = false;
let activeSshProcess = null;

function requestHealth(healthUrl, headers = {}) {
  return new Promise((resolve) => {
    const parsed = new URL(healthUrl);
    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.request(
      {
        method: 'GET',
        hostname: parsed.hostname,
        path: parsed.pathname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        timeout: 7000,
        headers,
      },
      (res) => {
        resolve(res.statusCode === 200);
      }
    );

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function waitForPublicHealth(tunnelUrl, attempts = 8) {
  const healthUrl = `${tunnelUrl}/api/health`;
  const headers = {};

  if (tunnelUrl.includes('.loca.lt')) {
    headers['bypass-tunnel-reminder'] = 'true';
  }

  for (let i = 0; i < attempts; i += 1) {
    const ok = await requestHealth(healthUrl, headers);
    if (ok) {
      return true;
    }
    await wait(1000);
  }

  return false;
}

function extractTunnelUrl(text) {
  if (!text) return null;

  const tunneledLine = text.match(/tunneled with tls termination,\s*(https:\/\/[a-z0-9.-]+)/i);
  if (tunneledLine?.[1]) {
    return tunneledLine[1];
  }

  return null;
}

async function connectTunnelOnce() {
  clearTunnelInfo();
  const child = spawn(SSH_COMMAND, SSH_ARGS, {
    cwd: __dirname,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  activeSshProcess = child;

  const tunnelUrl = await new Promise((resolve, reject) => {
    let settled = false;
    let outputBuffer = '';
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        child.kill();
      } catch {
        // noop
      }
      reject(new Error('Timed out while waiting for localhost.run URL.'));
    }, 30000);

    const settleError = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error);
    };

    const onOutput = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);

      outputBuffer += text;
      const lines = outputBuffer.split(/\r?\n/);
      outputBuffer = lines.pop() || '';

      for (const line of lines) {
        const maybeUrl = extractTunnelUrl(line);
        if (maybeUrl && !settled) {
          settled = true;
          clearTimeout(timeout);
          resolve(maybeUrl);
          break;
        }
      }
    };

    child.stdout.on('data', onOutput);
    child.stderr.on('data', onOutput);

    child.once('error', (error) => {
      activeSshProcess = null;
      settleError(error);
    });

    child.once('exit', (code, signal) => {
      if (activeSshProcess === child) {
        activeSshProcess = null;
      }

      if (!settled) {
        settleError(new Error(`localhost.run tunnel exited before URL (code=${code}, signal=${signal || 'none'})`));
      }
    });
  });

  console.log(`TUNNEL_URL=${tunnelUrl}`);
  console.log(`API_BASE=${tunnelUrl}/api`);

  // Wait briefly for the public-facing health endpoint to become reachable
  // before writing the tunnel metadata. This avoids races where clients
  // read the metadata but the public tunnel hasn't started routing yet.
  const publicHealthy = await waitForPublicHealth(tunnelUrl, 12);
  writeTunnelInfo(tunnelUrl, publicHealthy);
  console.log(`PUBLIC_HEALTH=${publicHealthy ? 'ok' : 'unhealthy'}`);

  // Start a lightweight monitor that will kill the tunnel process if the
  // public health endpoint becomes consistently unreachable while the
  // tunnel process is running. This helps trigger a reconnect rather than
  // leaving an unhealthy tunnel open indefinitely.
  const monitorId = startPublicHealthMonitor(tunnelUrl, child);

  await new Promise((resolve) => {
    child.once('exit', () => {
      if (activeSshProcess === child) {
        activeSshProcess = null;
      }
      try { clearTunnelInfo(); } catch {}
      try { clearInterval(monitorId); } catch {}
      resolve();
    });
  });
}

function startPublicHealthMonitor(tunnelUrl, child) {
  let consecutiveFailures = 0;
  const headers = {};
  if (tunnelUrl.includes('.loca.lt')) headers['bypass-tunnel-reminder'] = 'true';

  const id = setInterval(async () => {
    try {
      const ok = await requestHealth(`${tunnelUrl}/api/health`, headers);
      if (!ok) {
        consecutiveFailures += 1;
        console.warn(`[tunnel] public health check failed (${consecutiveFailures}) for ${tunnelUrl}`);
        if (consecutiveFailures >= 3) {
          console.error('[tunnel] public health failing consistently — terminating tunnel to force reconnect');
          try { child.kill(); } catch (e) { /* noop */ }
        }
      } else {
        // healthy, reset failure counter
        consecutiveFailures = 0;
      }
    } catch (e) {
      consecutiveFailures += 1;
    }
  }, 10000);

  child.once('exit', () => clearInterval(id));
  return id;
}

async function startTunnelLoop() {
  let backoffMs = 3000;
  const maxBackoff = 60000;
  while (!shuttingDown) {
    const attemptStart = Date.now();
    try {
      await connectTunnelOnce();

      const duration = Date.now() - attemptStart;
      // If connection lived for >60s, consider it stable and reset backoff
      if (duration > 60000) backoffMs = 3000;

      if (!shuttingDown) {
        const jitter = Math.floor(Math.random() * 1000);
        console.log(`Tunnel closed. Reconnecting in ${Math.round(backoffMs / 1000)}s...`);
        await wait(backoffMs + jitter);
        backoffMs = Math.min(maxBackoff, Math.floor(backoffMs * 1.8));
      }
    } catch (error) {
      clearTunnelInfo();
      if (!shuttingDown) {
        console.error('Failed to start SSH tunnel:', error?.message || error);
        console.log('[tunnel] falling back to localtunnel...');
        try {
          const ltStart = Date.now();
          await connectViaLocaltunnel();
          const duration = Date.now() - ltStart;
          if (duration > 60000) backoffMs = 3000;
          if (!shuttingDown) {
            const jitter = Math.floor(Math.random() * 1000);
            console.log(`localtunnel closed. Reconnecting in ${Math.round(backoffMs / 1000)}s...`);
            await wait(backoffMs + jitter);
            backoffMs = Math.min(maxBackoff, Math.floor(backoffMs * 1.8));
          }
        } catch (err) {
          console.error('[tunnel] fallback also failed:', err?.message || err);
          const jitter = Math.floor(Math.random() * 1000);
          console.log(`Retrying tunnel in ${Math.round(backoffMs / 1000)}s...`);
          await wait(backoffMs + jitter);
          backoffMs = Math.min(maxBackoff, Math.floor(backoffMs * 1.8));
        }
      }
    }
  }
}

process.on('SIGINT', async () => {
  shuttingDown = true;
  try {
    if (activeSshProcess) {
      activeSshProcess.kill();
    }
    if (localtunnelInstance && typeof localtunnelInstance.close === 'function') {
      try { localtunnelInstance.close(); } catch {}
    }
  } catch {
    // noop
  }
  clearTunnelInfo();
  process.exit(0);
});

startTunnelLoop();
