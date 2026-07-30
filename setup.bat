@echo off
echo Setting up Google Sheets Sorting Helper...
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies. Please try manually with: npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo.
echo Step 2: Setting up Chrome Extension...
cd chrome-extension
call npm install
if %errorlevel% neq 0 (
    echo Warning: Chrome extension dependencies failed to install
)
cd ..

echo.
echo Step 3: Creating shared resources...
if not exist "chrome-extension\shared" mkdir "chrome-extension\shared"
copy "shared\*" "chrome-extension\shared\" >nul 2>&1

echo.
echo Setup completed!
echo.
echo Next steps:
echo 1. Install Google Apps Script CLI: npm install -g @google/clasp
echo 2. Login to Google: clasp login
echo 3. See docs/SETUP.md for detailed instructions
echo.
pause