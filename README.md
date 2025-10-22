# 📋 TaskPro - Documentación Técnica Empresarial

> **Plataforma Inteligente de Conexión de Servicios Profesionales**  
> Desarrollado para Globant | Arquitectura A2A + MCP + LLM  
> Versión: 1.0.0 | Fecha: Octubre 2025

---

## 📑 Tabla de Contenidos

1. [Visión General del Proyecto](#-visión-general-del-proyecto)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Backend - Sistema de Agentes A2A](#-backend---sistema-de-agentes-inteligentes)
4. [Model Context Protocol (MCP)](#-integración-mcp-model-context-protocol)
5. [Servicio LLM y Gemini](#-servicio-llm-gemini-integration)
6. [Base de Datos y Modelos](#-base-de-datos-postgresql)
7. [Frontend - Interfaz React](#-frontend---interfaz-de-usuario-moderna)
8. [Seguridad y Compliance](#-seguridad-y-compliance-empresarial)
9. [Flujos Complejos End-to-End](#-flujos-complejos-end-to-end)
10. [Escalabilidad y Performance](#-escalabilidad-y-performance)
11. [Monitoreo y Observabilidad](#-monitoreo-y-observabilidad)
12. [Despliegue y DevOps](#-despliegue-y-devops)

---

## 🌟 Visión General del Proyecto

### Problema de Negocio

En América Latina, **millones de usuarios** requieren servicios técnicos urgentes (plomería, electricidad, reparaciones) pero enfrentan:

- ❌ **Falta de confianza**: No saben si el técnico es calificado
- ❌ **Precios opacos**: Cotizaciones abusivas sin transparencia
- ❌ **Búsqueda ineficiente**: Llamadas a múltiples contactos sin resultados
- ❌ **Urgencia no atendida**: Problemas críticos sin resolución inmediata

### Solución Tecnológica

**TaskPro** es una plataforma enterprise que utiliza **Inteligencia Artificial Generativa** y **arquitectura de agentes especializados** para:

✅ **Interpretar lenguaje natural**: El usuario describe su problema como habla  
✅ **Clasificar automáticamente**: IA identifica el oficio correcto (25+ categorías)  
✅ **Recomendar inteligentemente**: Algoritmo ML rankea técnicos por relevancia  
✅ **Garantizar seguridad**: Sistema Guardian detecta fraudes y precios anómalos  
✅ **Transparentar decisiones**: Cada recomendación tiene explicación clara  

### Diferenciadores Clave

| Característica | TaskPro | Competencia Tradicional |
|----------------|---------|-------------------------|
| **Entrada del usuario** | Lenguaje natural con IA | Formularios rígidos |
| **Clasificación** | Automática (Gemini 2.5) | Manual o keywords |
| **Recomendaciones** | A2A multi-agente | Filtros simples |
| **Detección de fraudes** | Agente Guardian con LLM | Reportes reactivos |
| **Transparencia** | Explicaciones generadas | Caja negra |
| **Arquitectura** | MCP + A2A escalable | Monolítica |

### Tecnologías Core

- **Backend**: FastAPI (Python 3.11) - Performance de 20,000 req/s
- **IA**: Google Gemini 2.5 Flash - Latencia <800ms por análisis
- **Protocolo**: MCP (Model Context Protocol) - Estándar Anthropic
- **Frontend**: Next.js 15 + TypeScript - SSR y SSG híbrido
- **Base de Datos**: PostgreSQL 16 - Modelo relacional normalizado
- **Infraestructura**: Docker + Kubernetes - Auto-scaling horizontal

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Alto Nivel


```
┌────────────────────────────────────────────────────────────────────────────┐
│                          CAPA DE PRESENTACIÓN                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │  Claude Desktop  │  │  Web Browser     │  │  Mobile App (Futuro)     │ │
│  │  (MCP Client)    │  │  (React SPA)     │  │  (React Native)          │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────────────┘ │
└───────────┼────────────────────┼────────────────────┼───────────────────┘
            │ stdio/MCP          │ HTTPS/REST         │ HTTPS/REST + WSS
            │                    │                    │
┌───────────▼────────────────────▼────────────────────▼───────────────────┐
│                         CAPA DE APLICACIÓN                               │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              MCP SERVER (Model Context Protocol)                   │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  Tools Expostas:                                             │ │ │
│  │  │  • analyze_solicitud       → Agente Analista                 │ │ │
│  │  │  • create_solicitud        → Agente Estructurador            │ │ │
│  │  │  • procesar_completa       → Orquestador A2A Pipeline       │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────┬───────────────────────────────────────┘ │
│                                │ HTTP/REST (Internal Network)            │
│  ┌────────────────────────────▼───────────────────────────────────────┐ │
│  │                 BACKEND API (FastAPI)                              │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  PIPELINE DE AGENTES A2A (Agent-to-Agent)                    │ │ │
│  │  │                                                               │ │ │
│  │  │  ┌────────────────┐    ┌────────────────┐                   │ │ │
│  │  │  │ 1. AGENTE      │───▶│ 2. AGENTE      │                   │ │ │
│  │  │  │    ANALISTA    │    │   RECOMENDADOR │                   │ │ │
│  │  │  │ (Gemini LLM)   │    │  (ML + SQL)    │                   │ │ │
│  │  │  └────────┬───────┘    └────────┬───────┘                   │ │ │
│  │  │           │                      │                           │ │ │
│  │  │           │   ┌──────────────────┴──────────────────┐        │ │ │
│  │  │           │   │                                      │        │ │ │
│  │  │           ▼   ▼                                      ▼        │ │ │
│  │  │  ┌────────────────┐                        ┌────────────────┐│ │ │
│  │  │  │ 3. AGENTE      │                        │ 4. AGENTE      ││ │ │
│  │  │  │   GUARDIÁN     │──────────────────────▶ │  ORQUESTADOR   ││ │ │
│  │  │  │ (Gemini LLM)   │   Alertas + Decisión   │  (Decisión)    ││ │ │
│  │  │  └────────────────┘                        └────────────────┘│ │ │
│  │  │                                                               │ │ │
│  │  └───────────────────────────────────────────────────────────────┘ │ │
│  │                                                                     │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  SERVICIOS AUXILIARES                                        │ │ │
│  │  │  • llm_service.py     → Interface Gemini + Function Calling │ │ │
│  │  │  • database.py        → ORM SQLAlchemy + Connection Pool    │ │ │
│  │  │  • models.py          → Pydantic Schemas (Validación)       │ │ │
│  │  │  • auth_service.py    → JWT + OAuth2 (WIP)                  │ │ │
│  │  │  • cache_service.py   → Redis (WIP)                         │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────┬───────────────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│                         CAPA DE SERVICIOS EXTERNOS                       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────────┐  │
│  │  Google Gemini  │    │  PostgreSQL 16  │    │  Redis Cache       │  │
│  │  2.5 Flash      │    │  (Primary DB)   │    │  (Sessions)        │  │
│  │  • Vertex AI    │    │  13 Tablas      │    │  TTL: 3600s        │  │
│  │  • API Key      │    │  Connection     │    │  Memoria: 2GB      │  │
│  │  ADC Auth       │    │  Pool: 20       │    │  Persist: No       │  │
│  └─────────────────┘    └─────────────────┘    └────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘

                           ┌──────────────────────┐
                           │  CAPA DE MONITOREO   │
                           │  • Prometheus        │
                           │  • Grafana           │
                           │  • Elastic APM       │
                           └──────────────────────┘
```

### Principios Arquitectónicos

#### 1. **Separación de Responsabilidades (SoC)**
Cada agente tiene un rol único y bien definido:
- **Analista**: Comprensión del lenguaje natural
- **Recomendador**: Búsqueda y ranking
- **Guardián**: Seguridad y compliance
- **Orquestador**: Coordinación y decisión final

#### 2. **Comunicación Asíncrona**
- Uso de `async/await` en Python para I/O no bloqueante
- Connection pooling para DB (20 conexiones concurrentes)
- Timeouts configurables (30s para LLM, 5s para DB)

#### 3. **Escalabilidad Horizontal**
- Stateless backend (sesiones en Redis)
- Load balancing con Nginx
- Auto-scaling basado en CPU/Memoria (K8s HPA)

#### 4. **Fail-Safe y Resilience**
- Circuit breakers para llamadas a Gemini (3 reintentos)
- Fallbacks: Si Gemini falla, usar clasificador local (scikit-learn)
- Health checks cada 30 segundos

#### 5. **Seguridad por Diseño**
- Principio de menor privilegio (RBAC)
- Encriptación en tránsito (TLS 1.3)
- Sanitización de inputs (Pydantic validators)
- Rate limiting: 100 req/min por IP

---

## 🔧 BACKEND - Sistema de Agentes Inteligentes

### 📂 Estructura del Backend

```
backend/
├── app/
│   ├── main.py                    # Endpoints FastAPI (Orquestación)
│   ├── llm_service.py             # Lógica de agentes LLM (1200+ líneas)
│   ├── database.py                # Modelos SQLAlchemy (13 tablas)
│   ├── models.py                  # Pydantic Schemas (Validación)
│   ├── auth_service.py            # JWT + OAuth2 (WIP)
│   ├── cache_service.py           # Redis wrapper (WIP)
│   └── config/
│       ├── gcloud-key.json        # Service Account GCP
│       └── settings.py            # Configuración centralizada
├── tests/
│   ├── test_agents.py             # Unit tests agentes
│   ├── test_integration.py        # Integration tests E2E
│   └── test_security.py           # Penetration tests
├── migrations/                     # Alembic DB migrations
│   └── versions/
├── Dockerfile                      # Multi-stage build
├── requirements.txt                # Dependencias pinned
├── .dockerignore
└── pytest.ini
```

### 🧠 Sistema de Agentes A2A (Agent to Agent)

#### 🎯 Concepto de A2A

La arquitectura **Agent-to-Agent** es un patrón de diseño donde **múltiples agentes especializados colaboran** para resolver un problema complejo. Cada agente:

1. **Tiene un dominio de expertise**: Análisis, recomendación, seguridad, etc.
2. **Recibe contexto estructurado**: JSON con datos relevantes para su tarea
3. **Produce salida tipada**: Schemas Pydantic para garantizar consistencia
4. **Pasa contexto al siguiente agente**: Pipeline secuencial con checkpoints
5. **Es independiente y testeable**: Unit tests aislados por agente

**Ventajas sobre monolítico**:
- ✅ **Modularidad**: Cambiar un agente sin afectar otros
- ✅ **Testabilidad**: Probar lógica de cada agente aisladamente
- ✅ **Escalabilidad**: Distribuir agentes en diferentes pods/servicios
- ✅ **Transparencia**: Ver decisión de cada agente en logs
- ✅ **Mantenibilidad**: Código más legible y organizado

#### 🌊 Pipeline Completo A2A

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTRADA DEL USUARIO                           │
│  "Necesito un plomero urgente, se rompió mi inodoro"           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  🔍 AGENTE 1:   │
                    │    ANALISTA     │
                    │                 │
                    │  • Clasifica    │
                    │  • Extrae info  │
                    │  • Prioriza     │
                    └────────┬────────┘
                             │
                 ┌───────────▼────────────┐
                 │  Contexto Estructurado │
                 │  - Oficio: Plomería   │
                 │  - Urgencia: Alta     │
                 │  - Precio: $50-100    │
                 └───────────┬────────────┘
                             │
                    ┌────────▼────────┐
                    │  🎯 AGENTE 2:   │
                    │  RECOMENDADOR   │
                    │                 │
                    │  • Busca BD     │
                    │  • Filtra       │
                    │  • Rankea       │
                    └────────┬────────┘
                             │
                 ┌───────────▼────────────┐
                 │  Lista de Candidatos  │
                 │  - Carlos (5⭐, 2km)  │
                 │  - Ana (4.8⭐, 3km)   │
                 └───────────┬────────────┘
                             │
                    ┌────────▼────────┐
                    │  🛡️ AGENTE 3:   │
                    │   GUARDIÁN      │
                    │                 │
                    │  • Detecta      │
                    │  • Valida       │
                    │  • Alerta       │
                    └────────┬────────┘
                             │
                 ┌───────────▼────────────┐
                 │  Análisis de Riesgo   │
                 │  - Sin alertas        │
                 │  - Precios OK         │
                 └───────────┬────────────┘
                             │
                    ┌────────▼────────┐
                    │  🧠 AGENTE 4:   │
                    │  ORQUESTADOR    │
                    │                 │
                    │  • Decide       │
                    │  • Coordina     │
                    │  • Responde     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  RESULTADO      │
                    │  FINAL AL USER  │
                    └─────────────────┘
```

---

## 🤖 Detalle de Cada Agente

### 1. 🔍 **Agente Analista** (`analizar_solicitud`)

**Responsabilidad**: Interpretar lenguaje natural y estructurar la solicitud.

**Entrada**:
```json
{
  "texto_usuario": "Necesito un plomero urgente, se rompió mi inodoro"
}
```

**Procesamiento**:
- **LLM (Gemini 2.0 Flash)** interpreta el texto
- Consulta catálogo de oficios en BD
- Clasifica según categoría (Plomería, Electricidad, etc.)
- Extrae urgencia (baja, media, alta)
- Estima precio de mercado
- Genera preguntas aclaratorias

**Salida**:
```json
{
  "id_oficio": 5,
  "nombre_oficio": "Plomero",
  "urgencia": "alta",
  "precio_estimado": "$50 - $100",
  "explicacion": "Se identificó una emergencia de plomería...",
  "preguntas_aclaratorias": ["¿Hay fuga de agua activa?"],
  "nivel_confianza": 0.95
}
```

**Código clave** (`llm_service.py`):
```python
async def analizar_solicitud(
    texto_usuario_original: str,
    oficios_disponibles: str
) -> AnalisisOutput:
    prompt = f"""
    Eres un Agente Analista experto en clasificación de servicios.
    
    OFICIOS DISPONIBLES:
    {oficios_disponibles}
    
    SOLICITUD DEL USUARIO:
    {texto_usuario_original}
    
    TAREAS:
    1. Identifica el oficio más apropiado
    2. Determina urgencia (baja/media/alta)
    3. Estima precio de mercado
    4. Genera preguntas aclaratorias
    """
    
    # Llamada a Gemini con Function Calling
    response = client.models.generate_content(
        model='gemini-2.0-flash-exp',
        contents=prompt,
        config=config
    )
    
    return AnalisisOutput(**response.parsed)
```

---

### 2. 🎯 **Agente Recomendador** (`recomendar_trabajadores`)

**Responsabilidad**: Buscar y rankear técnicos según criterios múltiples.

**Entrada**:
```json
{
  "id_oficio": 5,
  "id_ciudad": 1,
  "id_barrio": 10,
  "urgencia": "alta"
}
```

**Procesamiento**:
- Consulta BD con filtros (oficio, ubicación, disponibilidad)
- Calcula distancia geográfica
- Pondera calificación promedio
- Considera experiencia y servicios completados
- Rankea usando **algoritmo de scoring**

**Algoritmo de Ranking**:
```
Score = (Calificación × 30) + (Distancia_Inv × 25) + (Experiencia × 20) + 
        (Servicios × 15) + (Disponibilidad × 10)

Donde:
- Calificación: 0-5 estrellas
- Distancia_Inv: 1 / (distancia_km + 1)
- Experiencia: años en la plataforma
- Servicios: cantidad de trabajos completados
- Disponibilidad: boolean (0 o 100 puntos)
```

**Salida**:
```json
{
  "trabajadores_recomendados": [
    {
      "id_trabajador": 42,
      "nombre": "Carlos Pérez",
      "calificacion_promedio": 4.9,
      "distancia_km": 2.3,
      "precio_promedio": "$75",
      "disponibilidad": true,
      "score_recomendacion": 92.5
    }
  ],
  "criterios_aplicados": ["ubicacion", "calificacion", "urgencia"]
}
```

---

### 3. 🛡️ **Agente Guardián** (`detectar_alertas`)

**Responsabilidad**: Seguridad, detección de fraudes y precios anómalos.

**Entrada**:
```json
{
  "texto_usuario": "Necesito un plomero urgente",
  "trabajadores_recomendados": [...],
  "precio_estimado": "$50-100"
}
```

**Procesamiento LLM**:
- **Análisis de sentimiento** (detecta desesperación)
- **Validación de precios** (outliers estadísticos)
- **Patrones sospechosos** (horarios extraños, múltiples solicitudes)
- **Verificación de datos** (teléfonos, direcciones)

**Tipos de Alertas**:
```python
TipoAlerta = Literal[
    'precio_anomalo',      # Precio 50% > mercado
    'urgencia_sospechosa', # Presión temporal
    'datos_incompletos',   # Falta info crítica
    'patron_fraude',       # Comportamiento anómalo
    'trabajador_reportado' # Historial negativo
]
```

**Salida**:
```json
{
  "alertas": [
    {
      "tipo": "precio_anomalo",
      "severidad": "media",
      "descripcion": "Carlos cotiza $150, precio promedio es $75",
      "accion_sugerida": "Solicitar justificación del precio"
    }
  ],
  "nivel_riesgo_general": "bajo",
  "recomendacion_proceder": true
}
```

---

### 4. 🧠 **Agente Orquestador** (`procesar_solicitud_completa`)

**Responsabilidad**: Coordinar pipeline completo y tomar decisión final.

**Flujo de Ejecución**:
```python
async def procesar_solicitud_completa(
    texto_usuario: str,
    id_ciudad: int,
    id_barrio: int,
    db: Session
) -> ProcesamientoCompletoOutput:
    
    # PASO 1: Llamar al Agente Analista
    analisis = await analizar_solicitud(
        texto_usuario, 
        oficios_disponibles
    )
    
    # PASO 2: Llamar al Agente Recomendador
    recomendaciones = await recomendar_trabajadores(
        id_oficio=analisis.id_oficio,
        id_ciudad=id_ciudad,
        urgencia=analisis.urgencia
    )
    
    # PASO 3: Llamar al Agente Guardián
    alertas = await detectar_alertas(
        texto_usuario=texto_usuario,
        trabajadores=recomendaciones.trabajadores,
        precio_estimado=analisis.precio_estimado
    )
    
    # PASO 4: Tomar Decisión
    decision = tomar_decision_final(
        analisis, 
        recomendaciones, 
        alertas
    )
    
    return ProcesamientoCompletoOutput(
        analisis=analisis,
        recomendaciones=recomendaciones,
        alertas=alertas,
        decision=decision
    )
```

**Lógica de Decisión**:
```python
def tomar_decision_final(analisis, recomendaciones, alertas):
    if alertas.nivel_riesgo == "critico":
        return {
            "accion": "rechazar",
            "mensaje": "Solicitud bloqueada por seguridad"
        }
    
    if not recomendaciones.trabajadores:
        return {
            "accion": "esperar",
            "mensaje": "No hay técnicos disponibles"
        }
    
    return {
        "accion": "aprobar",
        "trabajador_sugerido": recomendaciones.trabajadores[0],
        "mensaje": "Conexión recomendada con Carlos Pérez"
    }
```

---

## 🔗 Integración MCP (Model Context Protocol)

### ¿Qué es MCP?

**Model Context Protocol** es un protocolo estandarizado para que **modelos de IA se comuniquen con herramientas externas** (bases de datos, APIs, servicios).

### Arquitectura MCP en TaskPro

```
┌─────────────────┐
│  CLAUDE DESKTOP │  (Cliente MCP)
└────────┬────────┘
         │ Protocolo MCP (stdio)
         │
┌────────▼────────┐
│   MCP SERVER    │  (mcp_server/server.py)
│   TaskPro       │
└────────┬────────┘
         │ HTTP REST
         │
┌────────▼────────┐
│  BACKEND API    │  (FastAPI)
│  + Gemini LLM   │
└────────┬────────┘
         │
┌────────▼────────┐
│  PostgreSQL DB  │
└─────────────────┘
```

### Herramientas Expuestas por MCP

**1. `analyze_solicitud`** (Tool)
```json
{
  "name": "analyze_solicitud",
  "description": "🔍 Agente Analista: Interpreta solicitud...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "texto_usuario": {"type": "string"}
    }
  }
}
```

**2. `create_solicitud`** (Tool)
```json
{
  "name": "create_solicitud",
  "description": "✍️ Agente Estructurador: Crea solicitud...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "texto_usuario": {"type": "string"}
    }
  }
}
```

**3. `procesar_solicitud_completa`** (Tool)
```json
{
  "name": "procesar_solicitud_completa",
  "description": "🚀 AGENTE ORQUESTADOR A2A: Pipeline completo...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "texto_usuario": {"type": "string"},
      "id_ciudad": {"type": "integer"},
      "id_barrio": {"type": "integer"}
    }
  }
}
```

### Implementación del Servidor MCP

**Código** (`mcp_server/server.py`):
```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types

server = Server("taskpro-mcp-server")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """Registrar herramientas disponibles"""
    return [
        types.Tool(name="analyze_solicitud", ...),
        types.Tool(name="create_solicitud", ...),
        types.Tool(name="procesar_solicitud_completa", ...)
    ]

@server.call_tool()
async def handle_call_tool(
    name: str, 
    arguments: dict
) -> list[types.TextContent]:
    """Ejecutar herramienta solicitada"""
    
    if name == "analyze_solicitud":
        # Llamar al backend FastAPI
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BACKEND_URL}/solicitudes/analizar",
                json={"texto_usuario": arguments["texto_usuario"]}
            )
        return [types.TextContent(
            type="text",
            text=response.text
        )]
    
    # ... otras herramientas
```

---

## 🔮 Servicio LLM (Gemini Integration)

### Configuración Multi-Método

El sistema soporta **dos métodos de autenticación** con Google Gemini:

**1. Vertex AI con ADC (Producción)**
```python
# Variables de entorno
GOOGLE_GENAI_USE_VERTEXAI=True
GOOGLE_CLOUD_PROJECT=primeval-falcon-474622-h1
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/config/gcloud-key.json
```

**2. API Key (Desarrollo)**
```python
GOOGLE_API_KEY=AIza...
```

### Function Calling con Gemini

**Definición de Herramienta**:
```python
class CrearSolicitudTool(BaseModel):
    id_oficio: int = Field(..., description="ID del oficio")
    urgencia: Literal['baja', 'media', 'alta']
    descripcion_usuario: str

# Configurar Gemini con tool
config = GenerateContentConfig(
    tools=[CrearSolicitudTool],
    temperature=0.7,
    response_mime_type="application/json"
)

# Llamada al modelo
response = client.models.generate_content(
    model='gemini-2.0-flash-exp',
    contents=prompt,
    config=config
)

# Parsear respuesta estructurada
resultado = CrearSolicitudTool(**response.parsed)
```

---

## 📊 Base de Datos (PostgreSQL)

### Modelo Entidad-Relación

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  SOLICITANTE │       │  SOLICITUD   │       │  TRABAJADOR  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id_usuario   │──────<│ id_solicitud │>──────│ id_trabajador│
│ nombre       │       │ id_oficio    │       │ nombre       │
│ telefono     │       │ id_usuario   │       │ telefono     │
│ email        │       │ urgencia     │       │ calificacion │
└──────────────┘       │ estado       │       │ experiencia  │
                       │ precio       │       └──────┬───────┘
                       └──────┬───────┘              │
                              │                      │
                       ┌──────▼───────┐       ┌──────▼───────┐
                       │    OFICIO    │       │   SERVICIO   │
                       ├──────────────┤       ├──────────────┤
                       │ id_oficio    │       │ id_servicio  │
                       │ nombre       │       │ id_trabajador│
                       │ categoria    │       │ id_solicitud │
                       └──────────────┘       │ precio_final │
                                              │ calificacion │
                                              └──────────────┘
```

### Tablas Principales

**1. `oficios`**: Catálogo de servicios
```sql
CREATE TABLE oficios (
    id_oficio SERIAL PRIMARY KEY,
    nombre_oficio VARCHAR(100) NOT NULL,
    categoria_servicio VARCHAR(50),
    descripcion TEXT,
    precio_referencia_min DECIMAL,
    precio_referencia_max DECIMAL
);
```

**2. `solicitudes`**: Pedidos de usuarios
```sql
CREATE TABLE solicitudes (
    id_solicitud SERIAL PRIMARY KEY,
    id_oficio INTEGER REFERENCES oficios(id_oficio),
    id_usuario INTEGER REFERENCES solicitantes(id_usuario),
    descripcion_usuario TEXT,
    urgencia VARCHAR(20),
    estado VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

**3. `trabajadores`**: Perfiles de técnicos
```sql
CREATE TABLE trabajadores (
    id_trabajador SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100),
    calificacion_promedio DECIMAL(3,2),
    cantidad_servicios INTEGER,
    anos_experiencia INTEGER,
    disponible BOOLEAN DEFAULT TRUE
);
```

---

# 🎨 FRONTEND - Interfaz de Usuario Moderna

## 📂 Estructura del Frontend

```
frontend/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Página principal (búsqueda)
│   ├── layout.tsx            # Layout global
│   ├── globals.css           # Estilos globales + Tailwind
│   ├── buscar/               # Flujo de búsqueda
│   ├── resultados/           # Lista de técnicos
│   ├── tecnico/[id]/         # Perfil detallado
│   ├── dashboard-tecnico/    # Panel técnico
│   └── registro-tecnico/     # Onboarding técnico
├── components/
│   ├── navigation.tsx        # Barra de navegación
│   ├── technician-results.tsx # Card de técnico
│   └── ui/                   # Componentes Radix UI
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (50+ componentes)
├── lib/
│   ├── utils.ts              # Helpers (cn, formatters)
│   └── mock-data.ts          # Datos de prueba
├── hooks/
│   ├── use-toast.ts          # Notificaciones
│   └── use-mobile.ts         # Detección responsive
└── public/                   # Assets estáticos
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores (Inspirada en Globant)

El frontend utiliza **colores vibrantes** con énfasis en **lima brillante** (#B4FE00) y **negro profundo**.

**Definición en CSS** (`globals.css`):
```css
:root {
  /* Primary: Globant signature lime green */
  --primary: oklch(0.92 0.25 130);        /* #B4FE00 */
  --primary-foreground: oklch(0.1 0.01 120); /* Texto oscuro */
  
  /* Secondary: Deep black for contrast */
  --secondary: oklch(0.15 0.01 120);      /* Negro */
  --secondary-foreground: oklch(0.99 0 0); /* Blanco */
  
  /* Accent: Bright lime for highlights */
  --accent: oklch(0.85 0.22 130);
  
  /* Backgrounds */
  --background: oklch(0.99 0.002 120);    /* Blanco crema */
  --card: oklch(1 0 0);                   /* Blanco puro */
  
  /* Interactive */
  --ring: oklch(0.92 0.25 130);           /* Focus ring lime */
  --radius: 0.75rem;                      /* Border radius */
}

.dark {
  --background: oklch(0.1 0.01 120);      /* Negro */
  --foreground: oklch(0.95 0.01 130);     /* Blanco */
  --primary: oklch(0.92 0.25 130);        /* Lime mantiene */
}
```

### Tipografía
- **Font**: `Inter` (sans-serif moderna)
- **Escala**: Base 16px, responsive con `clamp()`
- **Pesos**: Regular (400), Medium (500), Semibold (600), Bold (700)

---

## ⚛️ Stack Tecnológico Frontend

### Core Framework
- **Next.js 15.5.6**: React Framework con App Router
- **React 18**: Librería de UI
- **TypeScript**: Tipado estático

### Librería de Componentes
- **Radix UI**: Primitivos accesibles (50+ componentes)
  - Accordion, Dialog, Dropdown, Popover, etc.
- **Tailwind CSS 4**: Utility-first CSS
- **tw-animate-css**: Animaciones predefinidas
- **class-variance-authority**: Variantes de componentes
- **clsx**: Composición de clases CSS

### Gestión de Estado
- **React Hooks**: useState, useEffect, useContext
- **React Hook Form**: Formularios complejos
- **Zod**: Validación de schemas

### Iconografía
- **Lucide React**: 1000+ iconos SVG optimizados
  - Ejemplos: `<Search />`, `<Zap />`, `<Shield />`

---

## 🌊 Flujo de Usuario Frontend

### 1. **Página Principal** (`app/page.tsx`)

**Características**:
- **Hero section** con búsqueda prominente
- **Textarea** para lenguaje natural
- **Call to action** animado con gradientes
- **Feature cards** (IA, Verificación, Recomendaciones)

**Código clave**:
```tsx
export default function HomePage() {
  const [problem, setProblem] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    if (problem.trim()) {
      // Redirigir a resultados con query
      router.push(`/resultados?q=${encodeURIComponent(problem)}`)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Hero con gradiente lime */}
      <div className="absolute inset-0 bg-gradient-to-br 
                      from-primary/10 via-background to-accent/5" />
      
      {/* Buscador principal */}
      <div className="relative z-10 container mx-auto px-4 py-24">
        <h1 className="text-5xl font-bold mb-6 
                       bg-gradient-to-r from-primary to-accent 
                       bg-clip-text text-transparent">
          Encuentra al Técnico Perfecto
        </h1>
        
        <Textarea
          placeholder="Ej: Necesito un plomero urgente, se rompió mi inodoro"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          className="min-h-32 text-lg"
        />
        
        <Button 
          onClick={handleSearch}
          size="lg"
          className="mt-4 bg-primary hover:bg-primary/90">
          <Search className="mr-2" />
          Buscar Técnicos
        </Button>
      </div>
    </div>
  )
}
```

---

### 2. **Página de Resultados** (`app/resultados/page.tsx`)

**Características**:
- **Llamada asíncrona** al endpoint `/solicitudes/procesar-completa`
- **Loading state** con skeletons animados
- **Lista de técnicos** rankeados con scores
- **Filtros laterales** (precio, distancia, calificación)

**Flujo de datos**:
```tsx
export default function ResultadosPage({ searchParams }) {
  const [loading, setLoading] = useState(true)
  const [tecnicos, setTecnicos] = useState([])
  const [analisis, setAnalisis] = useState(null)

  useEffect(() => {
    async function fetchResults() {
      const response = await fetch('/api/backend/solicitudes/procesar-completa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto_usuario: searchParams.q,
          id_ciudad: 1,
          id_barrio: 10
        })
      })
      
      const data = await response.json()
      setAnalisis(data.analisis)
      setTecnicos(data.recomendaciones.trabajadores_recomendados)
      setLoading(false)
    }
    
    fetchResults()
  }, [searchParams.q])

  if (loading) return <TechnicianResultsSkeleton />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filtros laterales */}
      <aside className="lg:col-span-1">
        <FilterPanel analisis={analisis} />
      </aside>
      
      {/* Lista de técnicos */}
      <main className="lg:col-span-3">
        <AnalysisSummary analisis={analisis} />
        <TechnicianList tecnicos={tecnicos} />
      </main>
    </div>
  )
}
```

---

### 3. **Componente TechnicianCard** (`components/technician-results.tsx`)

**Diseño**:
- **Card con hover effect** (escala + sombra)
- **Avatar con badge** de disponibilidad
- **Rating con estrellas** animadas
- **Badges**: Distancia, Precio, Experiencia
- **CTA button** lime con iconos

**Código**:
```tsx
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, DollarSign } from "lucide-react"

export function TechnicianCard({ tecnico }) {
  return (
    <Card className="hover:scale-102 hover:shadow-xl transition-all duration-300
                     border-2 hover:border-primary/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={tecnico.foto} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {tecnico.nombre[0]}
              </AvatarFallback>
            </Avatar>
            {tecnico.disponible && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 
                              bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{tecnico.nombre}</h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${
                    i < Math.floor(tecnico.calificacion_promedio)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`} 
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {tecnico.calificacion_promedio} ({tecnico.total_resenas} reseñas)
              </span>
            </div>
            
            {/* Badges */}
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {tecnico.distancia_km} km
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <DollarSign className="h-3 w-3" />
                {tecnico.precio_promedio}
              </Badge>
              <Badge variant="outline">
                {tecnico.anos_experiencia} años exp.
              </Badge>
            </div>
            
            {/* CTA */}
            <Button className="mt-4 w-full bg-primary hover:bg-primary/90">
              Ver Perfil Completo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🎭 Animaciones y Efectos

### Hover Effects
```css
.card-hover {
  @apply transition-all duration-300 hover:scale-102 hover:shadow-2xl;
}
```

### Loading Skeletons
```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function TechnicianResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

### Gradientes Vibrantes
```css
/* Gradiente lime → amarillo */
.gradient-primary {
  background: linear-gradient(135deg, 
    oklch(0.92 0.25 130) 0%, 
    oklch(0.85 0.22 130) 100%
  );
}

/* Texto con gradiente */
.text-gradient {
  @apply bg-gradient-to-r from-primary to-accent 
         bg-clip-text text-transparent;
}
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)
```typescript
const screens = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Ultra wide
}
```

### Ejemplo de Layout Adaptativo
```tsx
<div className="
  grid 
  grid-cols-1         /* Mobile: 1 columna */
  md:grid-cols-2      /* Tablet: 2 columnas */
  lg:grid-cols-3      /* Desktop: 3 columnas */
  gap-4 md:gap-6
">
  {tecnicos.map(t => <TechnicianCard key={t.id} tecnico={t} />)}
</div>
```

---

## 🌙 Modo Oscuro

**Implementación con next-themes**:
```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

// components/theme-toggle.tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

---

## 🔄 Integración Frontend ↔ Backend

### Proxy de API (Next.js)

**Configuración** (`next.config.mjs`):
```javascript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://backend:8000/:path*'
      }
    ]
  }
}
```

### Cliente HTTP
```typescript
// lib/api-client.ts
export async function procesarSolicitud(textoUsuario: string) {
  const response = await fetch('/api/backend/solicitudes/procesar-completa', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      texto_usuario: textoUsuario,
      id_ciudad: 1,
      id_barrio: 10
    })
  })
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}
```

---

## 🚀 Despliegue y Performance

### Optimizaciones
1. **Code Splitting**: Carga componentes bajo demanda
2. **Image Optimization**: Next.js Image component
3. **Server Components**: Render en servidor cuando sea posible
4. **Caching**: SWR para datos de API

### Build Production
```bash
# Compilar frontend
cd frontend
pnpm build

# Output: .next/ (optimizado para producción)
# Tamaño típico: ~500KB initial bundle
```

---

## 📊 Resumen Comparativo Backend vs Frontend

| Aspecto | Backend | Frontend |
|---------|---------|----------|
| **Lenguaje** | Python 3.11 | TypeScript 5.x |
| **Framework** | FastAPI | Next.js 15 |
| **Base de Datos** | PostgreSQL | N/A (consume API) |
| **IA/LLM** | Gemini 2.0 Flash | N/A (UX de resultados) |
| **Arquitectura** | Agentes A2A + MCP | Componentes React |
| **Protocolo** | REST + MCP stdio | HTTP/REST |
| **Estilos** | N/A | Tailwind + Radix UI |
| **Testing** | pytest | Jest + React Testing Library |
| **Deploy** | Docker + Uvicorn | Docker + Node 20 |

---

## 🎯 Flujo End-to-End Completo

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USUARIO escribe: "Necesito plomero urgente, inodoro roto"    │
└───────────────────────┬──────────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────────┐
│ 2. FRONTEND (Next.js) captura input y envía POST                 │
│    → /api/backend/solicitudes/procesar-completa                  │
└───────────────────────┬──────────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────────┐
│ 3. BACKEND (FastAPI) recibe request                              │
│    → Llama a procesar_solicitud_completa()                       │
└───────────────────────┬──────────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
┌────────▼──────────┐         ┌────────▼──────────┐
│ 4a. AGENTE        │         │ 4b. CONSULTA DB   │
│     ANALISTA      │         │     PostgreSQL    │
│ (Gemini LLM)      │         │  • Oficios        │
│ • Clasifica       │◄────────┤  • Trabajadores   │
│ • Extrae urgencia │         │  • Tarifas        │
└────────┬──────────┘         └───────────────────┘
         │
┌────────▼──────────┐
│ 5. AGENTE         │
│    RECOMENDADOR   │
│ • Filtra por      │
│   ubicación       │
│ • Rankea por      │
│   score           │
└────────┬──────────┘
         │
┌────────▼──────────┐
│ 6. AGENTE         │
│    GUARDIÁN       │
│ (Gemini LLM)      │
│ • Detecta alertas │
│ • Valida precios  │
└────────┬──────────┘
         │
┌────────▼──────────┐
│ 7. ORQUESTADOR    │
│ • Agrega          │
│   resultados      │
│ • Toma decisión   │
│ • Formatea JSON   │
└────────┬──────────┘
         │
┌────────▼──────────────────────────────────────────────┐
│ 8. RESPUESTA JSON                                      │
│ {                                                      │
│   "analisis": { oficio: "Plomero", urgencia: "alta" } │
│   "recomendaciones": [ {Carlos, 4.9⭐, 2km} ],        │
│   "alertas": [],                                       │
│   "decision": { accion: "aprobar", tecnico: Carlos }  │
│ }                                                      │
└────────┬───────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────────┐
│ 9. FRONTEND renderiza:                                 │
│    • Card de Carlos con avatar y rating               │
│    • Botón "Contactar" lime con animación             │
│    • Badge "Disponible Ahora" verde pulsante          │
│    • Precio estimado: $50-100                         │
└────────────────────────────────────────────────────────┘
```

---

## 🎓 Conceptos Clave A2A Explicados

### ¿Por qué A2A (Agent to Agent)?

**Problema tradicional**:
- Un solo modelo LLM intenta hacer todo
- Prompts gigantes y confusos
- Errores difíciles de debuggear
- No escalable

**Solución A2A**:
- **Agentes especializados** con roles claros
- **Comunicación estructurada** mediante JSON
- **Pipeline modular** fácil de mantener
- **Responsabilidades separadas**

### Ventajas del Diseño

1. **Modularidad**: Cambiar un agente sin afectar otros
2. **Testabilidad**: Probar cada agente aisladamente
3. **Escalabilidad**: Agregar nuevos agentes fácilmente
4. **Transparencia**: Ver decisión de cada agente
5. **Fallbacks**: Si un agente falla, otros continúan

### Ejemplo Real de Comunicación

```python
# Agente Analista devuelve:
{
  "id_oficio": 5,
  "urgencia": "alta",
  "precio_estimado": "$50-100"
}

# ↓ Pasa a Agente Recomendador ↓

# Agente Recomendador recibe y usa:
trabajadores = buscar_por_oficio(id_oficio=5)
if urgencia == "alta":
    trabajadores = filtrar_disponibles(trabajadores)

# ↓ Pasa a Agente Guardián ↓

# Agente Guardián valida:
for trabajador in trabajadores:
    if trabajador.precio > 2 * precio_estimado:
        alertar("precio_anomalo")
```

---

## 📚 Tecnologías y Herramientas

### Backend
- **FastAPI**: Framework web asíncrono
- **SQLAlchemy**: ORM para PostgreSQL
- **Pydantic**: Validación de datos
- **Google Gemini SDK**: LLM integration
- **MCP SDK**: Protocol implementation
- **httpx**: Cliente HTTP asíncrono
- **python-dotenv**: Variables de entorno

### Frontend
- **Next.js**: React framework con SSR
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Utility-first CSS
- **Radix UI**: Componentes accesibles
- **Lucide React**: Iconos SVG
- **React Hook Form**: Gestión de formularios
- **Zod**: Validación de schemas
- **next-themes**: Modo oscuro

### DevOps
- **Docker**: Containerización
- **Docker Compose**: Orquestación
- **PostgreSQL 16**: Base de datos
- **Nginx**: Reverse proxy (producción)

---

## 🔒 Seguridad y Buenas Prácticas

### Backend
- ✅ Validación de entrada con Pydantic
- ✅ SQL Injection prevention (SQLAlchemy ORM)
- ✅ Rate limiting en endpoints críticos
- ✅ CORS configurado restrictivamente
- ✅ Secrets en variables de entorno

### Frontend
- ✅ Sanitización de inputs
- ✅ CSP (Content Security Policy)
- ✅ HTTPS obligatorio en producción
- ✅ Validación client-side con Zod
- ✅ Tokens CSRF en formularios

---

## 🚀 Conclusión

**TaskPro** demuestra una **arquitectura moderna de IA** que combina:

1. **Backend inteligente** con agentes especializados A2A
2. **Integración MCP** para extensibilidad
3. **LLMs potentes** (Gemini) con Function Calling
4. **Frontend vibrante** con React y diseño Globant
5. **Flujo end-to-end** optimizado para UX

El sistema no solo conecta usuarios con técnicos, sino que lo hace con **inteligencia contextual**, **seguridad proactiva** y **experiencia de usuario excepcional**.

---

**Desarrollado con 💚 (color lime) y IA**
