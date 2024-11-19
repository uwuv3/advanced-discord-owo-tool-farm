@echo off
cls

echo Installing dependencies...
call npm i
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies.
    exit /b 1
)

echo Starting Tool...
call npm start
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to start the tool. Exiting...
    exit /b 1
)

pause