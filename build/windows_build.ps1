#!/usr/bin/env powershell

# GAMA VOZ Build Script (PyInstaller)
# Compila Flask + React em single .exe windows
# Usage: powershell .\build\windows_build.ps1

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$BuildDir = Join-Path $ProjectRoot "build"
$DistDir = Join-Path $BuildDir "dist"
$SpecFile = Join-Path $BuildDir "GAMA_VOZ.spec"

Write-Host "[*] Building GAMA VOZ..." -ForegroundColor Cyan
Write-Host "    Project root: $ProjectRoot" -ForegroundColor Gray

# Step 1: Ensure frontend is built
Write-Host "[1] Building frontend..." -ForegroundColor Yellow
Push-Location $FrontendDir
try {
    if (Test-Path "node_modules") {
        Write-Host "    node_modules found, skipping npm install" -ForegroundColor Gray
    } else {
        Write-Host "    Installing npm dependencies..." -ForegroundColor Gray
        npm install
    }
    Write-Host "    Running npm run build..." -ForegroundColor Gray
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed"
    }
    Write-Host "    [OK] Frontend build complete" -ForegroundColor Green
} finally {
    Pop-Location
}

# Step 2: Check PyInstaller installed
Write-Host "[2] Checking PyInstaller..." -ForegroundColor Yellow
try {
    python -m pyinstaller --version | Out-Null
    Write-Host "    [OK] PyInstaller already installed" -ForegroundColor Green
} catch {
    Write-Host "    Installing PyInstaller..." -ForegroundColor Gray
    python -m pip install -q pyinstaller
    Write-Host "    [OK] PyInstaller installed" -ForegroundColor Green
}

# Step 3: Clean previous build
Write-Host "[3] Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path $DistDir) {
    Remove-Item -Recurse -Force $DistDir
    Write-Host "    [OK] Cleaned dist directory" -ForegroundColor Green
}

# Step 4: Create PyInstaller spec if not exists
Write-Host "[4] Preparing PyInstaller configuration..." -ForegroundColor Yellow
Push-Location $BackendDir
try {
    # Generate .spec file from app.py with all necessary hooks
    python -m pyinstaller `
        --onefile `
        --windowed `
        --add-data "$FrontendDir/dist:frontend/dist" `
        --hidden-import=flask `
        --hidden-import=flask_cors `
        --hidden-import=kokoro `
        --hidden-import=groq `
        --hidden-import=numpy `
        --hidden-import=scipy `
        --hidden-import=torch `
        --hidden-import=PyJWT `
        --hidden-import=sqlalchemy `
        --collect-all=kokoro `
        --name=GAMA_VOZ `
        --distpath=$DistDir `
        --buildpath=$BuildDir/build `
        --specpath=$BuildDir `
        app.py 2>&1 | Tee-Object -Variable BuildOutput

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] PyInstaller build failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "Build output:" -ForegroundColor Gray
        Write-Host $BuildOutput
        throw "PyInstaller compilation failed"
    }
    Write-Host "    [OK] PyInstaller build complete" -ForegroundColor Green
} finally {
    Pop-Location
}

# Step 5: Verify .exe created
Write-Host "[5] Verifying output..." -ForegroundColor Yellow
$ExePath = Join-Path $DistDir "GAMA_VOZ.exe"

if (Test-Path $ExePath) {
    $SizeMB = [Math]::Round((Get-Item $ExePath).Length / 1MB, 2)

    Write-Host "[OK] Build successful!" -ForegroundColor Green
    Write-Host "     Output: $ExePath" -ForegroundColor Green
    Write-Host "     Size: $SizeMB MB" -ForegroundColor Cyan

    # Verify size is acceptable (<200MB per AC)
    if ($SizeMB -gt 200) {
        Write-Host "[!] Warning: .exe exceeds 200MB target (AC #1)" -ForegroundColor Yellow
        Write-Host "    Consider stripping or optimizing modules" -ForegroundColor Gray
    } else {
        Write-Host "[OK] Size is within target (<200MB)" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "[NEXT] To run:" -ForegroundColor Cyan
    Write-Host "       $ExePath" -ForegroundColor White
    Write-Host ""
    Write-Host "[URL] Access at: http://localhost:8000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[STEPS] Next:" -ForegroundColor Cyan
    Write-Host "        1. Test locally: .\build\dist\GAMA_VOZ.exe" -ForegroundColor White
    Write-Host "        2. Test on clean VM (no Python installed)" -ForegroundColor White
    Write-Host "        3. Verify Flask starts on localhost:8000" -ForegroundColor White
} else {
    Write-Host "[ERROR] Build failed - executable not found" -ForegroundColor Red
    Write-Host "        Expected: $ExePath" -ForegroundColor Gray
    exit 1
}
