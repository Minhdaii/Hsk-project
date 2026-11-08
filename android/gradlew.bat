@echo off
setlocal
set "GRADLE_VERSION=8.13"
set "GRADLE_ROOT=%USERPROFILE%\.gradle\wrapper\dists\gradle-%GRADLE_VERSION%-bin\chaina"
set "GRADLE_HOME=%GRADLE_ROOT%\gradle-%GRADLE_VERSION%"

if exist "%GRADLE_HOME%\bin\gradle.bat" goto runGradle
if not exist "%GRADLE_ROOT%" mkdir "%GRADLE_ROOT%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $root=Join-Path $env:USERPROFILE '.gradle\wrapper\dists\gradle-8.13-bin\chaina'; $zip=Join-Path $root 'gradle-8.13-bin.zip'; Invoke-WebRequest -Uri 'https://services.gradle.org/distributions/gradle-8.13-bin.zip' -OutFile $zip; Expand-Archive -LiteralPath $zip -DestinationPath $root -Force; Remove-Item -LiteralPath $zip -Force"
if errorlevel 1 exit /b %errorlevel%

:runGradle
call "%GRADLE_HOME%\bin\gradle.bat" %*
exit /b %errorlevel%
