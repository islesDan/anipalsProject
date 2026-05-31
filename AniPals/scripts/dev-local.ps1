$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host "Starting AniPals backend on http://localhost:8080"
Start-Process powershell -WindowStyle Hidden -WorkingDirectory $backend -ArgumentList "-NoExit", "-Command", ".\mvnw.cmd spring-boot:run"

Write-Host "Starting AniPals frontend with Vite hot reload on http://localhost:5173"
Start-Process powershell -WindowStyle Hidden -WorkingDirectory $frontend -ArgumentList "-NoExit", "-Command", "npm.cmd run dev:itch"

Write-Host "Use http://localhost:5173 for fast testing instead of repeatedly logging into Itch.io."
