# Backend tunnel startup script.
# Starts backend on the requested port and then opens a localhost.run public URL.

param(
    [int]$Port = 5000
)

$ErrorActionPreference = 'Stop'
$scriptDir = $PSScriptRoot

function Wait-BackendHealthy {
    param(
        [int]$HealthPort,
        [int]$MaxAttempts = 8
    )

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            $statusCode = (Invoke-WebRequest -Uri "http://localhost:$HealthPort/api/health" -TimeoutSec 5 -UseBasicParsing).StatusCode
            if ($statusCode -eq 200) {
                return $true
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    }

    return $false
}

# Free requested backend port if already in use.
$conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Output "[server] freed port $Port"
    Start-Sleep -Seconds 1
}

Write-Output "[server] starting backend on port $Port"
$env:HOST = '0.0.0.0'
$env:PORT = "$Port"
$backendProcess = Start-Process -FilePath 'node' -ArgumentList 'index.js' -WorkingDirectory $scriptDir -PassThru -NoNewWindow

if (-not (Wait-BackendHealthy -HealthPort $Port)) {
    Write-Output "[server] backend health check failed"
    if ($backendProcess) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    exit 1
}

Write-Output "[server] backend health check passed"
Write-Output "[tunnel] opening public tunnel and writing server/.tunnel-info.json..."

$tunnelScript = Join-Path $scriptDir 'tunnel.js'
if (-not (Test-Path $tunnelScript)) {
    Write-Output "[tunnel] tunnel bootstrap script not found at $tunnelScript"
    exit 1
}

& node $tunnelScript
