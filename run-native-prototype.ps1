$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$androidSdkRoot = if ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } elseif ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { $null }
$adbFromSdk = if ($androidSdkRoot) { Join-Path $androidSdkRoot "platform-tools\adb.exe" } else { $null }
$adbFromPath = (Get-Command adb -ErrorAction SilentlyContinue)?.Source
$adb = if ($adbFromPath) { $adbFromPath } elseif ($adbFromSdk) { $adbFromSdk } else { $null }

$javaHome = if ($env:JAVA_HOME) { $env:JAVA_HOME } else { $null }
$androidStudioJbr = "C:\Program Files\Android\Android Studio\jbr"
if (-not $javaHome -and (Test-Path $androidStudioJbr)) {
  $javaHome = $androidStudioJbr
}
$apkPath = Join-Path $root "mobile\android\app\build\outputs\apk\release\app-release.apk"

Write-Host "Starting SafeHer native prototype..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\admin'; npm run dev -- --host 0.0.0.0 --port 5173"
Start-Sleep -Seconds 2

if (-not $adb -or -not (Test-Path $adb)) {
  throw "adb not found. Install Android platform-tools and ensure adb is in PATH or ANDROID_SDK_ROOT is set."
}

if (-not (Test-Path $apkPath)) {
  Write-Host "Release APK not found. Building it now..." -ForegroundColor Yellow
  $buildCmd = if ($javaHome) {
    "`$env:JAVA_HOME='$javaHome'; `$env:Path='$javaHome\bin;' + `$env:Path; cd '$root\mobile\android'; .\gradlew.bat assembleRelease"
  } else {
    "cd '$root\mobile\android'; .\gradlew.bat assembleRelease"
  }
  Start-Process powershell -Wait -ArgumentList "-NoExit", "-Command", $buildCmd
}

& $adb devices
& $adb install -r $apkPath | Out-Host
& $adb shell monkey -p com.safeher.app -c android.intent.category.LAUNCHER 1 | Out-Null

Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Admin:   http://127.0.0.1:5173" -ForegroundColor Green
Write-Host "APK:     $apkPath" -ForegroundColor Green
Write-Host "Demo user: demo@safeher.app / password123" -ForegroundColor Green
Write-Host "Admin:     admin@safeher.app / admin123" -ForegroundColor Green
