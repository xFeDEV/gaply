# TaskPro Backend - Sistema A2A con MCP

## 🎯 Descripción General

**TaskPro** es una plataforma de conexión entre usuarios que necesitan servicios técnicos urgentes y trabajadores calificados disponibles en América Latina. Utiliza inteligencia artificial (IA) con arquitectura **Agent-to-Agent (A2A)** para clasificar, analizar y estructurar solicitudes de servicio en lenguaje natural.

### Arquitectura A2A (Agent-to-Agent)

El sistema implementa dos agentes especializados que trabajan en colaboración:

```
Usuario (lenguaje natural)
    ↓
[Servidor MCP]  ← Protocolo de comunicación con IA
    ↓
┌─────────────────────────────────────┐
│  AGENTE 1: ANALISTA                 │
│  - Clasifica oficio                 │
│  - Estima urgencia y precio         │
│  - Detecta señales de alerta        │
│  - Propone preguntas aclaratorias   │
│  - NO crea registros en BD          │
└─────────────────────────────────────┘
    ↓ (análisis previo)
┌─────────────────────────────────────┐
│  AGENTE 2: ESTRUCTURADOR            │
│  - Recibe texto del usuario         │
│  - Extrae id_oficio, urgencia       │
│  - Normaliza descripción            │
│  - CREA solicitud en BD             │
└─────────────────────────────────────┘
    ↓
Base de Datos PostgreSQL
```

---

## 🚀 Componentes del Sistema

### 1. **Backend FastAPI** (`/backend`)

API REST con dos endpoints principales:

- **POST `/solicitudes/analizar`** → Agente Analista (solo análisis, sin DB)
- **POST `/solicitudes/crear`** → Agente Estructurador (crea registro en BD)

**Archivos clave:**
- `app/main.py` - Endpoints FastAPI
- `app/llm_service.py` - Lógica de agentes con Gemini
- `app/database.py` - Modelos SQLAlchemy (ORM completo)
- `app/models.py` - Schemas Pydantic (validación I/O)

### 2. **Servidor MCP** (`/mcp_server`)

Servidor de **Model Context Protocol** que expone herramientas (tools) para agentes de IA:

- `analyze_solicitud` - Llama al Agente Analista
- `create_solicitud` - Llama al Agente Estructurador

Permite que Claude Desktop u otros clientes MCP interactúen con TaskPro.

**Archivos clave:**
- `server.py` - Implementación del servidor MCP
- `pyproject.toml` - Dependencias Python

### 3. **Base de Datos PostgreSQL**

Esquema relacional completo con:
- **Maestros:** Ciudades, Barrios, Oficios
- **Usuarios:** Solicitantes, Trabajadores
- **Operación:** Solicitudes, Recomendaciones, Servicios, Calificaciones, Alertas

Ver `database.py` para detalles de todas las tablas.

---

## 📋 Requisitos Previos

- **Docker** y **Docker Compose**
- **Python 3.10+** (para desarrollo local)
- Credenciales de **Google Gemini**:
  - Opción 1: API Key (`GOOGLE_API_KEY`)
  - Opción 2: Vertex AI con ADC (`GOOGLE_APPLICATION_CREDENTIALS`)

---

## ⚙️ Configuración

### 1. Variables de Entorno

Crea o edita `docker-compose.local.yml` con:

```yaml
environment:
  # Base de datos
  DATABASE_URL: postgresql://user:password@postgres:5432/taskpro_db
  
  # Gemini (opción 1: API Key)
  GOOGLE_API_KEY: "tu-api-key-aqui"
  
  # Gemini (opción 2: Vertex AI)
  GOOGLE_GENAI_USE_VERTEXAI: "false"  # cambiar a "true" para Vertex
  GOOGLE_CLOUD_PROJECT: "tu-proyecto-gcp"
  GOOGLE_CLOUD_LOCATION: "us-central1"
  GOOGLE_APPLICATION_CREDENTIALS: "/app/config/gcloud-key.json"
```

### 2. Credenciales de Google Cloud (si usas Vertex AI)

Coloca tu archivo JSON de credenciales en:
```
backend/app/config/gcloud-key.json
```

---

## 🐳 Ejecución con Docker

### Iniciar todos los servicios

```powershell
docker-compose -f docker-compose.local.yml up --build
```

Servicios disponibles:
- **Backend FastAPI:** http://localhost:8000
- **PostgreSQL:** localhost:5432
- **Documentación interactiva:** http://localhost:8000/docs

### Ver logs en tiempo real

```powershell
docker-compose -f docker-compose.local.yml logs -f backend
```

### Detener servicios

```powershell
docker-compose -f docker-compose.local.yml down
```

---

## 🧪 Pruebas de Endpoints

### 1. Health Check

```powershell
curl http://localhost:8000/health
```

**Respuesta esperada:**
```json
{"status": "ok", "service": "TaskPro Backend"}
```

### 2. Analizar Solicitud (Agente Analista)

```powershell
curl -X POST http://localhost:8000/solicitudes/analizar `
  -H "Content-Type: application/json" `
  -d '{"texto_usuario": "Necesito un plomero urgente, se me rompió un caño en la cocina"}'
```

**Respuesta esperada:**
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

### 3. Crear Solicitud (Agente Estructurador)

```powershell
curl -X POST http://localhost:8000/solicitudes/crear `
  -H "Content-Type: application/json" `
  -d '{"texto_usuario": "Mi nevera no enfría, necesito técnico hoy"}'
```

**Respuesta esperada:**
```json
{
  "id_solicitud": 1,
  "id_solicitante": 0,
  "id_oficio": 5,
  "descripcion_usuario": "Reparación de nevera que no enfría",
  "urgencia": "alta",
  "id_barrio_servicio": 0,
  "fecha_creacion": "2025-10-22T15:30:00",
  "estado": "pendiente",
  "precio_estimado_mercado": 0.0,
  "flag_alerta": false
}
```

---

## 🔧 Uso del Servidor MCP

### Instalación local (para desarrollo)

```powershell
cd mcp_server
pip install -e .
```

### Configuración en Claude Desktop

Edita `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "taskpro": {
      "command": "python",
      "args": [
        "C:\\Users\\santi\\OneDrive\\Documentos\\GitHub\\gaply\\mcp_server\\server.py"
      ],
      "env": {
        "BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}
```

### Herramientas disponibles en Claude

Una vez configurado, Claude Desktop podrá usar:

- 🔍 **analyze_solicitud** - Analiza y clasifica sin crear registros
- ✍️ **create_solicitud** - Crea solicitud estructurada en BD

---

## 📊 Flujo Completo de Uso

### Escenario: Usuario solicita plomero urgente

1. **Usuario (en Claude Desktop):**
   > "Necesito un plomero urgente, se me rompió un caño en la cocina y está saliendo agua por todos lados"

2. **Agente Analista (automático):**
   - Llama a `analyze_solicitud`
   - Clasifica: Oficio = Plomero (ID: 1)
   - Urgencia = Alta (palabras clave: "urgente", "saliendo agua")
   - Precio estimado: $80,000 COP
   - Señales: Ninguna alerta
   - Confianza: 0.95

3. **Claude presenta el análisis al usuario:**
   > "He analizado tu solicitud:
   > - Servicio: Plomero
   > - Urgencia: Alta
   > - Precio estimado: $80,000 COP
   > 
   > ¿Deseas confirmar la creación de la solicitud?"

4. **Usuario confirma:**
   > "Sí, por favor créala"

5. **Agente Estructurador (automático):**
   - Llama a `create_solicitud`
   - Crea registro en BD con ID #1
   - Estado: Pendiente
   - Timestamp: 2025-10-22 15:30:00

6. **Sistema retorna confirmación:**
   > "✅ Solicitud #1 creada exitosamente. Los trabajadores cercanos serán notificados."

---

## 🛠️ Desarrollo Local (sin Docker)

### Backend

```powershell
cd backend
pip install -r requirements.txt

# Configurar variables de entorno
$env:DATABASE_URL="postgresql://user:password@localhost:5432/taskpro_db"
$env:GOOGLE_API_KEY="tu-api-key"

# Ejecutar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### MCP Server

```powershell
cd mcp_server
pip install -e .

# Ejecutar (requiere backend corriendo)
python server.py
```

---

## 📂 Estructura del Proyecto

```
gaply/
├── backend/
│   ├── app/
│   │   ├── main.py              # Endpoints FastAPI
│   │   ├── llm_service.py       # Agentes IA (Analista + Estructurador)
│   │   ├── database.py          # Modelos SQLAlchemy (todas las tablas)
│   │   ├── models.py            # Schemas Pydantic (I/O API)
│   │   └── config/
│   │       └── gcloud-key.json  # Credenciales GCP (si usas Vertex)
│   ├── requirements.txt
│   └── Dockerfile
├── mcp_server/
│   ├── server.py                # Servidor MCP
│   ├── pyproject.toml           # Dependencias
│   └── README.md                # Docs específicas MCP
├── docker-compose.local.yml     # Configuración Docker completa
└── README.md                    # Este archivo
```

---

## 🎓 Criterios de Éxito (Reto)

### ✅ I. Conexión eficaz con servicios urgentes
- Agente Analista interpreta lenguaje natural (urgencia, contexto)
- Clasificación correcta en >80% de casos de prueba

### ✅ II. Transparencia en recomendaciones
- Campo `explicacion` en respuestas del Analista
- Motivos claros de clasificación y detección de alertas

### ✅ III. Flujo completo demostrado
- Desde texto en lenguaje natural → Análisis → Creación en BD
- Integración A2A funcional (Analista → Estructurador)

---

## 🐛 Troubleshooting

### Error: "No hay oficios disponibles"
**Solución:** Carga datos iniciales en la tabla `oficios`:
```sql
INSERT INTO public.oficios (id_oficio, nombre_oficio, categoria_servicio, descripcion) VALUES
(1, 'Plomero', 'Hogar', 'Reparación e instalación de sistemas de agua y desagüe'),
(2, 'Electricista', 'Hogar', 'Instalación y reparación de sistemas eléctricos'),
(3, 'Cerrajero', 'Seguridad', 'Apertura de puertas y cambio de cerraduras');
```

### Error: "Error al llamar a Gemini"
**Solución:** Verifica tus credenciales:
- Si usas API Key: revisa `GOOGLE_API_KEY` en docker-compose
- Si usas Vertex AI: verifica `GOOGLE_APPLICATION_CREDENTIALS` y permisos

### Error de conexión MCP
**Solución:** Asegúrate de que el backend esté corriendo en `http://localhost:8000`

---

## 📝 Próximos Pasos (TODOs en código)

- [ ] Implementar autenticación de usuarios (`id_solicitante` real)
- [ ] Detección automática de ubicación (`id_barrio_servicio`)
- [ ] Motor de recomendación de trabajadores (tabla `recomendaciones`)
- [ ] Sistema de calificaciones bidireccional
- [ ] Notificaciones en tiempo real (WebSockets)

---

## 📞 Soporte

Para preguntas o issues, contactar al equipo de desarrollo o crear un issue en el repositorio.

---

**TaskPro** - Conectando necesidades y oportunidades con IA 🚀
