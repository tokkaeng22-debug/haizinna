$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Set-Location (Split-Path $PSScriptRoot -Parent)
$env:UV_CACHE_DIR = Join-Path (Get-Location) '.tools/uv-cache'
$env:UV_PYTHON_INSTALL_DIR = Join-Path (Get-Location) '.tools/python'
New-Item -ItemType Directory -Force '.tools' | Out-Null
if (!(Test-Path '.tools/uv/uv.exe')) {
    Write-Host 'Downloading the free Python environment manager...'
    Invoke-WebRequest 'https://github.com/astral-sh/uv/releases/latest/download/uv-x86_64-pc-windows-msvc.zip' -OutFile '.tools/uv.zip'
    Expand-Archive -LiteralPath '.tools/uv.zip' -DestinationPath '.tools/uv' -Force
}
$uv = (Get-ChildItem '.tools/uv' -Filter 'uv.exe' -Recurse | Select-Object -First 1).FullName
if (!(Test-Path '.venv/Scripts/python.exe')) {
    $pythonVersion = '3.11'
    $bundledPython = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
    if (Test-Path $bundledPython) { $pythonVersion = $bundledPython }
    & $uv venv --python $pythonVersion .venv
    if ($LASTEXITCODE -ne 0) { throw 'Python environment setup failed.' }
}
& $uv pip install --python '.venv/Scripts/python.exe' 'torch==2.5.1+cpu' 'torchaudio==2.5.1+cpu' --index-url 'https://download.pytorch.org/whl/cpu'
if ($LASTEXITCODE -ne 0) { throw 'PyTorch installation failed.' }
& $uv pip install --python '.venv/Scripts/python.exe' 'numpy<2' 'demucs==4.0.1' 'soundfile>=0.12' 'faster-whisper==1.2.1' 'av==15.1.0'
if ($LASTEXITCODE -ne 0) { throw 'Demucs installation failed.' }
$separateFile = '.venv/Lib/site-packages/demucs/separate.py'
if (Test-Path $separateFile) {
    $source = [IO.File]::ReadAllText((Resolve-Path $separateFile))
    $originalLine = 'wav = load_track(track, model.audio_channels, model.samplerate)'
    if (!$source.Contains($originalLine + '.clone()')) {
        $source = $source.Replace($originalLine, $originalLine + '.clone()')
        [IO.File]::WriteAllText((Resolve-Path $separateFile), $source)
    }
}
Write-Host 'AI engine ready. Voice separation and subtitle models download on first use. No paid API required.' -ForegroundColor Green
