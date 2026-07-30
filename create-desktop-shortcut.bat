@echo off
REM Create Desktop Shortcut for Google Sheets Sorting Helper Project
REM This batch file creates a shortcut on the desktop to access the project folder

setlocal enabledelayedexpansion

REM Get the current directory (project root)
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

REM Define desktop path
set "DESKTOP=%USERPROFILE%\Desktop"

REM Define shortcut path
set "SHORTCUT_PATH=%DESKTOP%\Google Sheets Sorting Helper.lnk"

REM Create the shortcut using PowerShell (more reliable than VBS)
powershell -Command ^
$WshShell = New-Object -ComObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); ^
$Shortcut.TargetPath = '%PROJECT_DIR%'; ^
$Shortcut.WorkingDirectory = '%PROJECT_DIR%'; ^
$Shortcut.Description = 'Google Sheets Sorting Helper - Project Folder'; ^
$Shortcut.IconLocation = '%PROJECT_DIR%\chrome-extension\icons\icon-48.png,0'; ^
$Shortcut.Save()

if %ERRORLEVEL% == 0 (
    echo.
    echo ============================================
    echo Desktop Shortcut Created Successfully!
    echo ============================================
    echo.
    echo Shortcut: %SHORTCUT_PATH%
    echo Target: %PROJECT_DIR%
    echo.
    echo You can now access the project from your desktop!
    echo.
    pause
) else (
    echo.
    echo Error: Failed to create shortcut
    echo Please ensure you have the necessary permissions
    echo.
    pause
    exit /b 1
)