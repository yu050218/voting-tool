@echo off
title Universal Vote Tool
cd /d "%~dp0"

echo Starting Universal Vote Tool in preview mode...
echo Project folder: %cd%
echo.

if not exist node_modules (
  echo Installing dependencies. Please wait...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo.
echo Building production files...
call npm run build
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

echo.
echo Browser URL:
echo http://127.0.0.1:4173/
echo.
start "" "http://127.0.0.1:4173/"
call npm run preview
pause
