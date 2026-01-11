# Video API 시작 스크립트
Write-Host "🚀 Starting Video API Server..." -ForegroundColor Green

# 환경 변수 확인
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with required variables" -ForegroundColor Yellow
    exit 1
}

# Redis 확인
Write-Host "📍 Checking Redis..." -ForegroundColor Cyan
$redis = docker ps --filter "name=aimen-redis" --format "{{.Names}}"
if (-not $redis) {
    Write-Host "⚠️  Redis not running. Starting..." -ForegroundColor Yellow
    docker start aimen-redis
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to start Redis" -ForegroundColor Red
        exit 1
    }
    Start-Sleep -Seconds 2
}
Write-Host "✅ Redis running" -ForegroundColor Green

# Node modules 확인
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# 포트 3001 확인 및 정리
Write-Host "🔍 Checking port 3001..." -ForegroundColor Cyan
$port3001 = netstat -ano | Select-String ":3001"
if ($port3001) {
    Write-Host "⚠️  Port 3001 is in use. Attempting to free..." -ForegroundColor Yellow
    $pid = ($port3001 -split '\s+')[-1]
    taskkill /F /PID $pid 2>$null
    Start-Sleep -Seconds 1
}

# 서버 시작
Write-Host "▶️  Starting Video API Server on port 3001..." -ForegroundColor Green
npm start
