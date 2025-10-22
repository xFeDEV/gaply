# 🚀 Comandos Rápidos - TaskPro

## Docker

### Iniciar todos los servicios
```powershell
docker-compose -f docker-compose.local.yml up -d
```

### Iniciar con rebuild
```powershell
docker-compose -f docker-compose.local.yml up --build
```

### Ver logs en tiempo real
```powershell
docker-compose -f docker-compose.local.yml logs -f
docker-compose -f docker-compose.local.yml logs -f backend
docker-compose -f docker-compose.local.yml logs -f postgres
```

### Detener servicios
```powershell
docker-compose -f docker-compose.local.yml down
```

### Detener y eliminar volúmenes (⚠️ borra datos)
```powershell
docker-compose -f docker-compose.local.yml down -v
```

### Ver contenedores corriendo
```powershell
docker ps
docker-compose -f docker-compose.local.yml ps
```

---

## Base de Datos

### Conectar a PostgreSQL
```powershell
docker exec -it gaply-postgres-1 psql -U taskpro_user -d taskpro_db
```

### Ejecutar script SQL
```powershell
docker exec -i gaply-postgres-1 psql -U taskpro_user -d taskpro_db < backend/datos_ejemplo.sql
```

### Backup de la base de datos
```powershell
docker exec gaply-postgres-1 pg_dump -U taskpro_user taskpro_db > backup.sql
```

### Restaurar backup
```powershell
docker exec -i gaply-postgres-1 psql -U taskpro_user -d taskpro_db < backup.sql
```

### Comandos SQL útiles (dentro de psql)
```sql
-- Listar todas las tablas
\dt public.*

-- Ver estructura de una tabla
\d public.solicitudes

-- Contar registros
SELECT COUNT(*) FROM public.oficios;

-- Ver últimas solicitudes
SELECT * FROM public.solicitudes ORDER BY fecha_creacion DESC LIMIT 10;

-- Salir
\q
```

---

## API Testing

### Health Check
```powershell
curl http://localhost:8000/health
```

### Analizar Solicitud (Agente Analista)
```powershell
curl -X POST http://localhost:8000/solicitudes/analizar `
  -H "Content-Type: application/json" `
  -d '{"texto_usuario": "Necesito un plomero urgente, se me rompió un caño"}'
```

### Crear Solicitud (Agente Estructurador)
```powershell
curl -X POST http://localhost:8000/solicitudes/crear `
  -H "Content-Type: application/json" `
  -d '{"texto_usuario": "Mi nevera no enfría, necesito técnico hoy"}'
```

### Usando Invoke-RestMethod (PowerShell nativo)
```powershell
$body = @{
    texto_usuario = "Necesito un electricista urgente"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/solicitudes/analizar" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

---

## Desarrollo Local (sin Docker)

### Backend

```powershell
# Navegar al backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables
$env:DATABASE_URL="postgresql://taskpro_user:taskpro_pass@localhost:5432/taskpro_db"
$env:GOOGLE_API_KEY="tu-api-key"

# Ejecutar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### MCP Server

```powershell
# Navegar al servidor MCP
cd mcp_server

# Instalar en modo desarrollo
pip install -e .

# Configurar URL del backend
$env:BACKEND_URL="http://localhost:8000"

# Ejecutar servidor (espera stdin)
python server.py
```

---

## Git

### Estado actual
```powershell
git status
git branch
```

### Crear commit
```powershell
git add .
git commit -m "Implementación de arquitectura A2A con MCP"
```

### Push al repositorio
```powershell
git push origin Pr-MCP
```

### Ver cambios
```powershell
git diff
git log --oneline -10
```

---

## Debugging

### Entrar al contenedor del backend
```powershell
docker exec -it gaply-backend-1 /bin/bash
```

### Ejecutar Python interactivo dentro del contenedor
```powershell
docker exec -it gaply-backend-1 python
```

```python
# Dentro del intérprete Python
import os
print(os.getenv("DATABASE_URL"))
print(os.getenv("GOOGLE_API_KEY"))
```

### Ver variables de entorno del contenedor
```powershell
docker exec gaply-backend-1 env
```

### Reiniciar solo el backend
```powershell
docker-compose -f docker-compose.local.yml restart backend
```

---

## Limpieza

### Eliminar contenedores detenidos
```powershell
docker container prune
```

### Eliminar imágenes sin usar
```powershell
docker image prune -a
```

### Eliminar volúmenes sin usar
```powershell
docker volume prune
```

### Limpieza completa (⚠️ cuidado)
```powershell
docker system prune -a --volumes
```

---

## Troubleshooting

### Ver puertos en uso
```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :5432
```

### Matar proceso en puerto específico
```powershell
# Identificar PID
netstat -ano | findstr :8000

# Matar proceso (reemplaza PID)
taskkill /PID <PID> /F
```

### Verificar conectividad a PostgreSQL
```powershell
Test-NetConnection -ComputerName localhost -Port 5432
```

### Ver uso de recursos de Docker
```powershell
docker stats
```

---

## Testing Rápido

### Script de prueba completo
```powershell
# 1. Health check
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
curl http://localhost:8000/health

# 2. Analizar solicitud
Write-Host "`n2. Testing analyze endpoint..." -ForegroundColor Yellow
$analizar = @{
    texto_usuario = "plomero urgente, caño roto en cocina"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:8000/solicitudes/analizar" `
  -Method Post -ContentType "application/json" -Body $analizar
$result | ConvertTo-Json -Depth 5

# 3. Crear solicitud
Write-Host "`n3. Testing create endpoint..." -ForegroundColor Yellow
$crear = @{
    texto_usuario = "necesito electricista hoy, se fue la luz"
} | ConvertTo-Json

$result2 = Invoke-RestMethod -Uri "http://localhost:8000/solicitudes/crear" `
  -Method Post -ContentType "application/json" -Body $crear
$result2 | ConvertTo-Json

Write-Host "`nAll tests completed!" -ForegroundColor Green
```

---

## Documentación

### Abrir Swagger UI
```powershell
Start-Process "http://localhost:8000/docs"
```

### Abrir ReDoc
```powershell
Start-Process "http://localhost:8000/redoc"
```

---

## Shortcuts del Script Interactivo

En lugar de escribir comandos, usa:
```powershell
.\start.ps1
```

Opciones disponibles:
1. 🚀 Iniciar servicios
2. 🛑 Detener servicios
3. 📊 Ver logs
4. 🔍 Ver estado
5. 🗄️ Cargar datos
6. 🧪 Probar análisis
7. 📚 Abrir docs
8. 🧹 Rebuild completo

---

## Atajos de Teclado Útiles

### En psql
- `\q` - Salir
- `\dt` - Listar tablas
- `\d tabla` - Ver estructura
- `\x` - Toggle expanded display
- Ctrl+C - Cancelar query

### En Docker logs
- Ctrl+C - Salir de logs
- `docker-compose logs -f --tail=50` - Últimas 50 líneas

### En PowerShell
- Tab - Autocompletar
- Ctrl+C - Cancelar comando
- Ctrl+R - Buscar en historial
- F7 - Ver historial de comandos

---

**💡 Tip:** Guarda este archivo en favoritos para acceso rápido a comandos comunes.
