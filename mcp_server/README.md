# TaskPro MCP Server

Servidor de **Model Context Protocol (MCP)** para TaskPro que expone herramientas de análisis y creación de solicitudes de servicio a agentes de IA.

## 🎯 Herramientas Disponibles

### 1. `analyze_solicitud`

**Agente Analista** - Interpreta y clasifica solicitudes sin crear registros en base de datos.

**Entrada:**
```json
{
  "texto_usuario": "Necesito un plomero urgente, se me rompió un caño"
}
```

**Salida:**
- Oficio sugerido (ID y nombre)
- Urgencia inferida (baja/media/alta)
- Descripción normalizada
- Precio estimado de mercado
- Explicación del análisis
- Señales de alerta (si existen)
- Preguntas aclaratorias (si aplica)
- Nivel de confianza (0.0 - 1.0)

**Casos de uso:**
- Vista previa antes de crear solicitud
- Validación de entrada del usuario
- Feedback transparente sobre clasificación

---

### 2. `create_solicitud`

**Agente Estructurador** - Crea una solicitud estructurada en la base de datos.

**Entrada:**
```json
{
  "texto_usuario": "Mi nevera no enfría, necesito técnico hoy"
}
```

**Salida:**
- ID de solicitud generado
- Datos estructurados guardados en BD
- Estado: pendiente
- Timestamp de creación

**Casos de uso:**
- Confirmación final tras análisis previo
- Creación directa de solicitud

---

## 🚀 Instalación

### Desarrollo local

```powershell
# Clonar repositorio
cd gaply/mcp_server

# Instalar en modo desarrollo
pip install -e .
```

### Dependencias

- Python 3.10+
- `mcp>=1.1.2`
- `httpx>=0.28.0`

---

## ⚙️ Configuración

### Variables de entorno

```powershell
# URL del backend FastAPI
$env:BACKEND_URL="http://localhost:8000"
```

### Configuración en Claude Desktop

Edita `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "taskpro": {
      "command": "python",
      "args": [
        "C:\\ruta\\completa\\gaply\\mcp_server\\server.py"
      ],
      "env": {
        "BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}
```

**Importante:** Usa rutas absolutas en Windows.

---

## 🧪 Prueba Manual (Desarrollo)

### Iniciar servidor

```powershell
cd mcp_server
python server.py
```

El servidor escucha en stdio (entrada/salida estándar) según el protocolo MCP.

### Verificar backend está corriendo

```powershell
curl http://localhost:8000/health
```

Debe retornar: `{"status": "ok", "service": "TaskPro Backend"}`

---

## 📊 Flujo de Comunicación

```
Claude Desktop
    ↓ (MCP Protocol)
[MCP Server - server.py]
    ↓ (HTTP POST)
[Backend FastAPI - main.py]
    ↓ (LLM Call)
[Google Gemini 2.0 Flash]
    ↓ (Structured Output)
[PostgreSQL Database]
```

---

## 🔍 Ejemplo de Uso en Claude

### Análisis previo

**Usuario:**
> "Analiza esta solicitud: 'Necesito un electricista urgente, se fue la luz en mi casa'"

**Claude (usa `analyze_solicitud`):**
> "📊 He analizado la solicitud:
> - **Oficio:** Electricista (ID: 2)
> - **Urgencia:** Alta (detectado: 'urgente', 'se fue la luz')
> - **Precio estimado:** $100,000 COP
> - **Confianza:** 0.92
> - **Explicación:** Problema eléctrico residencial con urgencia explícita
> - **Alertas:** Ninguna"

### Creación confirmada

**Usuario:**
> "Perfecto, créala"

**Claude (usa `create_solicitud`):**
> "✅ Solicitud creada exitosamente:
> - **ID:** 1
> - **Estado:** Pendiente
> - **Fecha:** 2025-10-22 15:30:00
> Los trabajadores cercanos serán notificados automáticamente."

---

## 🛠️ Desarrollo

### Estructura del código

```python
# server.py

@server.list_tools()
async def handle_list_tools():
    """Define las herramientas disponibles"""
    ...

@server.call_tool()
async def handle_call_tool(name, arguments):
    """Ejecuta las herramientas solicitadas"""
    if name == "analyze_solicitud":
        # POST /solicitudes/analizar
    elif name == "create_solicitud":
        # POST /solicitudes/crear
```

### Añadir nuevas herramientas

1. Agregar definición en `handle_list_tools()`
2. Implementar lógica en `handle_call_tool()`
3. Actualizar este README con documentación

---

## 🐛 Troubleshooting

### Error: "Connection refused"
**Causa:** Backend no está corriendo  
**Solución:** Inicia el backend con Docker o localmente

### Error: "Invalid tool name"
**Causa:** Nombre de herramienta incorrecto  
**Solución:** Usa exactamente `analyze_solicitud` o `create_solicitud`

### Claude no detecta el servidor
**Causa:** Configuración incorrecta en `claude_desktop_config.json`  
**Solución:**
1. Verifica ruta absoluta del archivo `server.py`
2. Reinicia Claude Desktop completamente
3. Revisa logs en `%APPDATA%\Claude\logs\`

---

## 📚 Recursos

- [Documentación MCP](https://modelcontextprotocol.io/)
- [Anthropic MCP SDK](https://github.com/anthropics/anthropic-sdk-python)
- [Claude Desktop Config](https://docs.anthropic.com/claude/docs/mcp)

---

## 📝 TODOs

- [ ] Agregar herramienta `recommend_workers` (motor de recomendación)
- [ ] Implementar `list_solicitudes` con filtros (estado, urgencia)
- [ ] Añadir `update_solicitud_estado` (asignar trabajador)
- [ ] Crear `get_solicitud_detail` (ver detalles completos)
- [ ] Logging estructurado con niveles de severidad

---

**TaskPro MCP Server** - Puente entre IA y backend TaskPro 🤖
