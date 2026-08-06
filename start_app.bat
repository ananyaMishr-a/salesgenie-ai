@echo off
echo ==================================================
echo        Starting SalesGenie AI Services
echo ==================================================

echo.
echo Starting Backend (FastAPI)...
start "SalesGenie Backend" cmd /k "cd backend && set PYTHONIOENCODING=utf-8 && venv\Scripts\activate && uvicorn app.main:app --reload"

echo Starting Frontend (React/Vite)...
start "SalesGenie Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are spinning up in separate windows!
echo You can now close this launcher window.
echo ==================================================
timeout /t 5 >nul
