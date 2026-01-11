# Worker 시작 스크립트
Write-Host "🔧 Starting AI Analysis Worker..." -ForegroundColor Green

# 환경 변수 확인
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    exit 1
}

# Redis 확인
$redis = docker ps --filter "name=aimen-redis" --format "{{.Names}}"
if (-not $redis) {
    Write-Host "❌ Redis is not running! Start it first." -ForegroundColor Red
    exit 1
}

# Worker 시작
Write-Host "▶️  Starting Worker Process..." -ForegroundColor Green
npm run worker
