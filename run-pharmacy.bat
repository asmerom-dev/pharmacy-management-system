@echo off
title Pharmacy Management System - Launcher
echo ========================================================
echo   Starting Pharmacy Management System (Backend + Frontend)
echo ========================================================
echo.

echo [1/3] Starting Backend Server (Port 5000)...
start "Pharmacy Backend (Port 5000)" cmd /k "cd /d C:\Users\asmer\pharmacy-management-system\backend && node server.js"

echo Waiting 3 seconds for Backend to initialize...
timeout /t 3 /nobreak > nul

echo [2/3] Starting Frontend Server (Port 3000)...
start "Pharmacy Frontend (Port 3000)" cmd /k "cd /d C:\Users\asmer\pharmacy-management-system\frontend && npm.cmd run dev"

echo Waiting 4 seconds for Vite to launch...
timeout /t 4 /nobreak > nul

echo [3/3] Opening Chrome at http://localhost:3000...
start http://localhost:3000

echo.
echo ========================================================
echo   Pharmacy Management System is now RUNNING!
echo   Keep the two opened command windows running.
echo ========================================================
