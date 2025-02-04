@echo off
cls

echo Installing dependencies...
call npm i
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

echo Starting Tool...
call npx npm start
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to start the tool. Exiting...
    pause
    exit /b 1
)

pause