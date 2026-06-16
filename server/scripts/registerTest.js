#!/usr/bin/env node
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function main() {
  const tunnelInfoPath = path.join(__dirname, '..', '.tunnel-info.json');
  let apiBase = process.env.TEST_API_BASE || process.env.MONGO_TEST_API_BASE;
  if (!apiBase && fs.existsSync(tunnelInfoPath)) {
    try {
      const payload = JSON.parse(fs.readFileSync(tunnelInfoPath, 'utf8'));
      apiBase = payload.apiBase || payload.tunnelUrl && `${payload.tunnelUrl}/api`;
    } catch (e) {}
  }
  if (!apiBase) apiBase = 'https://8a03169d0eab8b.lhr.life/api';

  const url = `${apiBase.replace(/\/+$/,'')}/auth/register`;
  const body = { name: 'TestNode', phone: '7000098887', password: 'user123' };

  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), timeout: 15000 });
    const text = await res.text();
    console.log('URL:', url);
    console.log('STATUS:', res.status);
    console.log('BODY:', text);
    process.exit(res.ok ? 0 : 1);
  } catch (err) {
    console.error('REQUEST ERROR:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

main();
