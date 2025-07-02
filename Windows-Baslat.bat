@echo off
title TipScribe Development Server
color 0A

echo.
echo ============================================
echo  TipScribe - Turkiye Tibbi Sekreter Platform
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not available!
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo [INFO] npm version:
npm --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Check if .env exists
if not exist ".env" (
    echo [INFO] Creating .env file from template...
    copy ".env.example" ".env"
    echo [WARNING] Please edit .env file and add your API keys!
    echo Press any key to continue after editing .env...
    pause
)

echo [INFO] Starting TipScribe development server...
echo [INFO] Server will be available at: http://localhost:5000
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Set environment variables for Windows
set NODE_ENV=development
set PORT=5000

REM Start the development server
npx tsx server/index.ts

REM If we reach here, server stopped
echo.
echo [INFO] Server stopped.
pause