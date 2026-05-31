$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"

Push-Location $frontend
try {
    npm.cmd run build:itch
    Write-Host "Itch build ready in frontend\itch-singlefile and frontend\anipals-itchio-singlefile.zip"
} finally {
    Pop-Location
}
