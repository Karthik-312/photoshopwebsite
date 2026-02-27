# Build script - stops any running Java (Spring Boot) first to avoid file locks
$javaProcs = Get-Process -Name java -ErrorAction SilentlyContinue
if ($javaProcs) {
    Write-Host "Stopping Java processes to release file locks..."
    $javaProcs | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}
.\gradlew.bat clean build
