# ================================================================
# Script para cargar variables de entorno y probar el backend
# ================================================================
# Uso: .\test_backend.ps1

Write-Host "`n🚀 TaskPro - Test del Backend Local`n" -ForegroundColor Cyan

# Paso 1: Cargar variables de entorno
Write-Host "📋 Paso 1: Cargando variables de entorno..." -ForegroundColor Yellow

# Usa un driver SINCRONO para SQLAlchemy ORM actual (evita MissingGreenlet)
# Puedes alternar a async más adelante migrando el ORM a AsyncSession.
$env:DATABASE_URL="postgresql+psycopg2://postgres:root@localhost:5432/gaplyTester"
$env:GOOGLE_API_KEY="AIzaSyAB3U741RlwS6riGzQBr2CJwSlXTvoCB9k"
$env:GOOGLE_GENAI_USE_VERTEXAI="false"
$env:GOOGLE_CLOUD_PROJECT="primeval-falcon-474622-h1"
$env:GOOGLE_CLOUD_LOCATION="us-central1"

Write-Host "✓ DATABASE_URL configurada" -ForegroundColor Green
Write-Host "✓ GOOGLE_API_KEY configurada" -ForegroundColor Green

# Paso 2: Verificar entorno virtual
Write-Host "`n📦 Paso 2: Verificando entorno virtual..." -ForegroundColor Yellow

if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "⚠️  No se encontró el entorno virtual. Creándolo..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✓ Entorno virtual creado" -ForegroundColor Green
}

# Activar entorno virtual
Write-Host "Activando entorno virtual..." -ForegroundColor White
& .\venv\Scripts\Activate.ps1

# Paso 3: Instalar dependencias
Write-Host "`n📦 Paso 3: Verificando dependencias..." -ForegroundColor Yellow
pip install -q -r requirements.txt
Write-Host "✓ Dependencias instaladas" -ForegroundColor Green

# Paso 4: Mostrar configuración
Write-Host "`n🔧 Paso 4: Configuración actual:" -ForegroundColor Yellow
Write-Host "  DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Cyan
Write-Host "  GOOGLE_API_KEY: $($env:GOOGLE_API_KEY.Substring(0,10))..." -ForegroundColor Cyan
Write-Host "  GOOGLE_GENAI_USE_VERTEXAI: $env:GOOGLE_GENAI_USE_VERTEXAI" -ForegroundColor Cyan

# Paso 5: Iniciar servidor
Write-Host "`n🚀 Paso 5: Iniciando servidor FastAPI..." -ForegroundColor Yellow
Write-Host "Presiona Ctrl+C para detener el servidor`n" -ForegroundColor White

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
