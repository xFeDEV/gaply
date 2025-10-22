# ✅ Checklist de Instalación y Verificación - TaskPro

## Pre-requisitos

- [ ] Docker Desktop instalado y corriendo
- [ ] Python 3.10+ instalado (para desarrollo local)
- [ ] PowerShell disponible (Windows)
- [ ] Credenciales de Google Gemini configuradas

---

## Paso 1: Verificar Docker

```powershell
docker --version
docker-compose --version
```

**Esperado:** Versiones recientes (Docker 20+, Compose 2+)

---

## Paso 2: Configurar Variables de Entorno

Edita `docker-compose.local.yml` y asegúrate de tener:

```yaml
environment:
  DATABASE_URL: postgresql://taskpro_user:taskpro_pass@postgres:5432/taskpro_db
  
  # Opción 1: API Key (más simple)
  GOOGLE_API_KEY: "TU_API_KEY_AQUI"
  
  # Opción 2: Vertex AI (producción)
  GOOGLE_GENAI_USE_VERTEXAI: "false"
  GOOGLE_CLOUD_PROJECT: "tu-proyecto"
  GOOGLE_CLOUD_LOCATION: "us-central1"
```

### ¿Cómo obtener una API Key de Gemini?

1. Ve a: https://aistudio.google.com/apikey
2. Crea un proyecto (o usa uno existente)
3. Genera una API Key
4. Cópiala y pégala en `GOOGLE_API_KEY`

---

## Paso 3: Iniciar el Proyecto

```powershell
# Método 1: Usando el script interactivo
.\start.ps1
# Selecciona opción 1

# Método 2: Comando directo
docker-compose -f docker-compose.local.yml up --build
```

**Esperado:**
```
✅ postgres    | database system is ready to accept connections
✅ backend     | INFO:     Application startup complete
✅ backend     | INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Paso 4: Verificar Servicios

### 4.1 Health Check

```powershell
curl http://localhost:8000/health
```

**Esperado:**
```json
{"status":"ok","service":"TaskPro Backend"}
```

### 4.2 Documentación Swagger

Abre en el navegador:
```
http://localhost:8000/docs
```

**Esperado:**
- Interfaz interactiva de FastAPI
- 3 endpoints visibles:
  - GET /
  - GET /health
  - POST /solicitudes/analizar
  - POST /solicitudes/crear

### 4.3 PostgreSQL

```powershell
docker exec -it gaply-postgres-1 psql -U taskpro_user -d taskpro_db
```

Dentro de psql:
```sql
\dt public.*
```

**Esperado:** Lista de 13 tablas (ciudades, barrios, oficios, etc.)

Salir con `\q`

---

## Paso 5: Cargar Datos de Ejemplo

```powershell
docker exec -i gaply-postgres-1 psql -U taskpro_user -d taskpro_db < backend/datos_ejemplo.sql
```

**Esperado:**
```
INSERT 0 5    (ciudades)
INSERT 0 14   (barrios)
INSERT 0 25   (oficios)
INSERT 0 17   (tarifas_mercado)
INSERT 0 10   (solicitantes)
```

---

## Paso 6: Probar Agente Analista

```powershell
curl -X POST http://localhost:8000/solicitudes/analizar `
  -H "Content-Type: application/json" `
  -d '{"texto_usuario": "Necesito un plomero urgente, se me rompió un caño en la cocina"}'
```

**Esperado:**
```json
{
  "texto_usuario_original": "Necesito un plomero urgente...",
  "id_oficio_sugerido": 1,
  "nombre_oficio_sugerido": "Plomero",
  "urgencia_inferida": "alta",
  "descripcion_normalizada": "Reparación urgente de caño roto en cocina",
  "precio_mercado_estimado": 80000.0,
  "explicacion": "Se detectó necesidad de servicio de plomería...",
  "senales_alerta": [],
  "necesita_aclaraciones": false,
  "preguntas_aclaratorias": [],
  "confianza": 0.95
}
```

---

## Paso 7: Probar Agente Estructurador

```powershell
curl -X POST http://localhost:8000/solicitudes/crear `
  -H "Content-Type: application/json" `
  -d '{"texto_usuario": "Mi nevera no enfría, necesito técnico hoy"}'
```

**Esperado:**
```json
{
  "id_solicitud": 1,
  "id_solicitante": 0,
  "id_oficio": 5,
  "descripcion_usuario": "Reparación de nevera que no enfría",
  "urgencia": "alta",
  "estado": "pendiente",
  "fecha_creacion": "2025-10-22T15:30:00",
  ...
}
```

---

## Paso 8: Configurar Servidor MCP (Opcional)

### 8.1 Instalar dependencias

```powershell
cd mcp_server
pip install -e .
```

### 8.2 Configurar Claude Desktop

Sigue la guía en: `mcp_server/SETUP_CLAUDE.md`

Archivo de configuración:
```
%APPDATA%\Claude\claude_desktop_config.json
```

### 8.3 Verificar en Claude

1. Abre Claude Desktop
2. Busca el ícono 🔨 (herramientas)
3. Deberías ver "taskpro" listado
4. Prueba: "Analiza esta solicitud: necesito un electricista urgente"

---

## Troubleshooting

### ❌ Error: "port is already allocated"

**Causa:** Puerto 8000 o 5432 ya está en uso

**Solución:**
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :8000

# Detener servicios anteriores
docker-compose -f docker-compose.local.yml down
```

### ❌ Error: "No hay oficios disponibles"

**Causa:** La tabla `oficios` está vacía

**Solución:**
```powershell
docker exec -i gaply-postgres-1 psql -U taskpro_user -d taskpro_db < backend/datos_ejemplo.sql
```

### ❌ Error: "Error al llamar a Gemini"

**Causa:** API Key inválida o límite excedido

**Solución:**
1. Verifica tu API Key en Google AI Studio
2. Revisa límites de rate limit
3. Asegúrate de que `GOOGLE_API_KEY` esté configurada correctamente

### ❌ Error: "Unable to import 'fastapi'"

**Causa:** Dependencias no instaladas (solo en desarrollo local)

**Solución:**
```powershell
cd backend
pip install -r requirements.txt
```

**Nota:** En Docker, las dependencias se instalan automáticamente.

### ❌ Backend no inicia

**Logs completos:**
```powershell
docker-compose -f docker-compose.local.yml logs backend
```

Busca mensajes de error específicos.

---

## Verificación Final

### ✅ Checklist Completo

- [ ] Docker corriendo
- [ ] Backend responde en http://localhost:8000
- [ ] PostgreSQL accesible
- [ ] Datos de ejemplo cargados
- [ ] Endpoint `/solicitudes/analizar` funciona
- [ ] Endpoint `/solicitudes/crear` funciona
- [ ] Servidor MCP configurado (opcional)
- [ ] Claude Desktop conectado (opcional)

---

## Próximos Pasos

### Desarrollo

1. **Explorar código:**
   - `backend/app/main.py` - Endpoints
   - `backend/app/llm_service.py` - Lógica de agentes
   - `backend/app/database.py` - Modelos SQLAlchemy

2. **Modificar prompts:**
   - Edita las `system_instruction` en `llm_service.py`
   - Ajusta detección de urgencia
   - Personaliza explicaciones

3. **Agregar más oficios:**
   - Inserta en tabla `oficios`
   - Actualiza `tarifas_mercado`

### Testing

1. **Casos de prueba:**
   - Solicitudes ambiguas
   - Múltiples oficios posibles
   - Urgencia no explícita

2. **Evaluación de precisión:**
   - Crear dataset de prueba
   - Medir % de clasificación correcta
   - Ajustar temperature del modelo

### Producción

1. **Seguridad:**
   - Implementar autenticación JWT
   - Validar inputs (XSS, injection)
   - Rate limiting

2. **Escalabilidad:**
   - Implementar caché (Redis)
   - Queue de procesamiento (Celery)
   - Load balancer

---

## Recursos Útiles

- **Documentación principal:** `README.md`
- **Resumen ejecutivo:** `RESUMEN_PROYECTO.md`
- **Setup MCP:** `mcp_server/SETUP_CLAUDE.md`
- **Script interactivo:** `start.ps1`
- **Datos SQL:** `backend/datos_ejemplo.sql`

---

**¿Todo funcionando?** 🎉

**¡Felicitaciones!** Has configurado exitosamente TaskPro con arquitectura A2A.

Ahora puedes:
- Experimentar con diferentes solicitudes
- Analizar las respuestas del agente
- Integrar con Claude Desktop
- Explorar el código y personalizarlo

**¡Mucha suerte con el reto!** 🚀
