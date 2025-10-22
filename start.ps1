# =====================================================
# TaskPro - Script de Inicio Rápido (Windows PowerShell)
# =====================================================
# Este script facilita el inicio y gestión del proyecto TaskPro

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TaskPro - Inicio Rápido" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Función para mostrar el menú
function Show-Menu {
    Write-Host "Selecciona una opción:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 🚀 Iniciar todos los servicios (Docker)" -ForegroundColor Green
    Write-Host "2. 🛑 Detener todos los servicios" -ForegroundColor Red
    Write-Host "3. 📊 Ver logs del backend" -ForegroundColor Blue
    Write-Host "4. 🔍 Ver estado de los contenedores" -ForegroundColor Magenta
    Write-Host "5. 🗄️  Cargar datos de ejemplo en BD" -ForegroundColor Cyan
    Write-Host "6. 🧪 Probar endpoint de análisis" -ForegroundColor Yellow
    Write-Host "7. 📚 Ver documentación interactiva (Swagger)" -ForegroundColor White
    Write-Host "8. 🧹 Limpiar volúmenes y rebuild" -ForegroundColor DarkYellow
    Write-Host "9. ❌ Salir" -ForegroundColor Gray
    Write-Host ""
}

# Bucle principal
do {
    Show-Menu
    $option = Read-Host "Ingresa el número de opción"
    
    switch ($option) {
        '1' {
            Write-Host "`n🚀 Iniciando servicios con Docker Compose..." -ForegroundColor Green
            docker-compose -f docker-compose.local.yml up --build -d
            Write-Host "`n✅ Servicios iniciados correctamente!" -ForegroundColor Green
            Write-Host "   - Backend API: http://localhost:8000" -ForegroundColor White
            Write-Host "   - Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
            Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor White
            Start-Sleep -Seconds 2
        }
        '2' {
            Write-Host "`n🛑 Deteniendo servicios..." -ForegroundColor Red
            docker-compose -f docker-compose.local.yml down
            Write-Host "✅ Servicios detenidos" -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
        '3' {
            Write-Host "`n📊 Mostrando logs del backend (Ctrl+C para salir)..." -ForegroundColor Blue
            docker-compose -f docker-compose.local.yml logs -f backend
        }
        '4' {
            Write-Host "`n🔍 Estado de los contenedores:" -ForegroundColor Magenta
            docker-compose -f docker-compose.local.yml ps
            Start-Sleep -Seconds 3
        }
        '5' {
            Write-Host "`n🗄️  Cargando datos de ejemplo..." -ForegroundColor Cyan
            Write-Host "Ejecutando script SQL en PostgreSQL..." -ForegroundColor White
            
            # Ejecutar el script SQL dentro del contenedor de PostgreSQL
            docker exec -i gaply-postgres-1 psql -U taskpro_user -d taskpro_db < backend/datos_ejemplo.sql
            
            Write-Host "✅ Datos cargados correctamente!" -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
        '6' {
            Write-Host "`n🧪 Probando endpoint de análisis..." -ForegroundColor Yellow
            Write-Host "Enviando solicitud de prueba..." -ForegroundColor White
            
            $body = @{
                texto_usuario = "Necesito un plomero urgente, se me rompió un caño en la cocina y está saliendo agua"
            } | ConvertTo-Json
            
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:8000/solicitudes/analizar" `
                    -Method Post `
                    -ContentType "application/json" `
                    -Body $body
                
                Write-Host "`n✅ Respuesta del Agente Analista:" -ForegroundColor Green
                Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
                $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Cyan
                Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
            } catch {
                Write-Host "❌ Error al conectar con el backend. ¿Está corriendo?" -ForegroundColor Red
                Write-Host $_.Exception.Message -ForegroundColor DarkRed
            }
            
            Start-Sleep -Seconds 3
        }
        '7' {
            Write-Host "`n📚 Abriendo documentación interactiva en el navegador..." -ForegroundColor White
            Start-Process "http://localhost:8000/docs"
            Start-Sleep -Seconds 2
        }
        '8' {
            Write-Host "`n🧹 Limpiando volúmenes y reconstruyendo..." -ForegroundColor DarkYellow
            Write-Host "⚠️  ADVERTENCIA: Esto eliminará todos los datos de la base de datos." -ForegroundColor Red
            $confirm = Read-Host "¿Estás seguro? (s/n)"
            
            if ($confirm -eq 's' -or $confirm -eq 'S') {
                docker-compose -f docker-compose.local.yml down -v
                docker-compose -f docker-compose.local.yml up --build -d
                Write-Host "✅ Rebuild completo exitoso!" -ForegroundColor Green
            } else {
                Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
            }
            
            Start-Sleep -Seconds 2
        }
        '9' {
            Write-Host "`n👋 ¡Hasta pronto!" -ForegroundColor Cyan
            break
        }
        default {
            Write-Host "`n❌ Opción inválida. Intenta nuevamente." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
    
    Write-Host "`n"
    
} while ($option -ne '9')

Write-Host "========================================`n" -ForegroundColor Cyan
