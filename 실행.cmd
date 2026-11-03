@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js LTS from https://nodejs.org first.
  pause
  exit /b 1
)
if not exist node_modules\express (
  call npm install --omit=dev --cache .tools\npm-cache
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
powershell -NoProfile -Command "$root = Get-Location; $online = $false; try { $s = Invoke-RestMethod 'http://127.0.0.1:4310/api/status' -TimeoutSec 2; $online = $s.ffmpeg } catch {}; if (!$online) { Start-Process node -ArgumentList 'server.mjs' -WorkingDirectory $root -WindowStyle Hidden }; for ($i=0; $i -lt 30; $i++) { try { $s = Invoke-RestMethod 'http://127.0.0.1:4310/api/status' -TimeoutSec 1; if ($s.ffmpeg) { Start-Process 'http://127.0.0.1:4310'; exit 0 } } catch {}; Start-Sleep -Milliseconds 500 }; Write-Host 'Server startup failed. Run npm start to inspect the error.'; exit 1"
if errorlevel 1 pause
