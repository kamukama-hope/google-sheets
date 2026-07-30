@echo off
REM Alternative: Run website using Node.js (if Python doesn't work)

echo.
echo ====================================================
echo   Google Sheets Sorting Helper - Node.js Server
echo ====================================================
echo.

cd web

echo Checking for http-server...
echo.

REM Try to run http-server
npx http-server

echo.
echo If you see an error above, you may need to install Node.js:
echo https://nodejs.org/
echo.

pause