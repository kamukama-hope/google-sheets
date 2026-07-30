@echo off
REM Simple batch file to run the website locally

echo.
echo ====================================================
echo    Google Sheets Sorting Helper - Web Server
echo ====================================================
echo.

cd web

echo Starting web server...
echo.
echo The website will be available at:
echo.
echo    http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ====================================================
echo.

python -m http.server 8000

pause