@echo off
echo ========================================================
echo   SalesGenie AI - AI Sales Assistant Platform Launcher
echo ========================================================
echo.
echo Starting Python FastAPI Backend Server on port 8000...
start "SalesGenie Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 3 >nul

echo Starting React Vite Frontend Server on port 5173...
start "SalesGenie Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 >nul

echo.
echo Opening SalesGenie AI in your web browser...
start http://localhost:5173/

echo.
echo ========================================================
echo   SalesGenie AI is now running live!
echo   Frontend: http://localhost:5173/
echo   Backend API: http://127.0.0.1:8000/docs
echo ========================================================
