param(
  [int]$Port = 5000
)

$ErrorActionPreference = 'SilentlyContinue'
$scriptDir = $PSScriptRoot

# Free backend port if an old process is still listening.
$conn = Get-NetTCPConnection -LocalPort $Port -State Listen | Select-Object -First 1
if ($conn) {
  Stop-Process -Id $conn.OwningProcess -Force
  Start-Sleep -Seconds 1
}

$env:HOST = '0.0.0.0'
$env:PORT = "$Port"

Write-Host "[server] starting on http://0.0.0.0:$Port" -ForegroundColor Green
Push-Location $scriptDir
try {
  node index.js
} finally {
  Pop-Location
}
