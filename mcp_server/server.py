"""
MCP Server para TaskPro - Servidor de Model Context Protocol

Este servidor expone herramientas (tools) que permiten a los agentes de IA:
1. Analizar solicitudes de servicio (analyze_solicitud)
2. Crear solicitudes estructuradas (create_solicitud)

El servidor se comunica con el backend FastAPI en http://backend:8000
y implementa el protocolo MCP para integración con Claude Desktop u otros clientes MCP.
"""

import asyncio
import httpx
from typing import Any
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp import types

# URL del backend FastAPI (ajustar según configuración de docker-compose)
BACKEND_URL = "http://backend:8000"

# Crear instancia del servidor MCP
server = Server("taskpro-mcp-server")


@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """
    Lista las herramientas disponibles en el servidor MCP.
    
    Expone dos herramientas principales:
    - analyze_solicitud: Analiza y clasifica una solicitud sin crearla en BD
    - create_solicitud: Crea una solicitud estructurada en la base de datos
    """
    return [
        types.Tool(
            name="analyze_solicitud",
            description=(
                "🔍 Agente Analista: Interpreta una solicitud de servicio en lenguaje natural, "
                "sugiere el oficio más apropiado, estima urgencia y precio, detecta señales de alerta "
                "y propone preguntas aclaratorias. NO crea registros en la BD, solo análisis. "
                "Útil para: vista previa, transparencia, feedback al usuario antes de confirmar. "
                "Retorna: oficio sugerido, urgencia, precio estimado, explicación, alertas, confianza."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "texto_usuario": {
                        "type": "string",
                        "description": (
                            "Texto en lenguaje natural del usuario describiendo su necesidad. "
                            "Ejemplo: 'Necesito un plomero urgente, se me rompió un caño en la cocina'"
                        )
                    }
                },
                "required": ["texto_usuario"]
            }
        ),
        types.Tool(
            name="create_solicitud",
            description=(
                "✍️ Agente Estructurador: Crea una solicitud de servicio en la base de datos "
                "a partir de texto en lenguaje natural. Clasifica el oficio, extrae urgencia "
                "y normaliza la descripción. Guarda la solicitud con estado 'pendiente'. "
                "Útil para: confirmación final tras análisis previo, creación directa. "
                "Retorna: solicitud completa con ID generado, fecha de creación, estado, etc."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "texto_usuario": {
                        "type": "string",
                        "description": (
                            "Texto en lenguaje natural del usuario describiendo su necesidad. "
                            "Ejemplo: 'Necesito reparar mi nevera que no enfría, es urgente porque se me daña la comida'"
                        )
                    }
                },
                "required": ["texto_usuario"]
            }
        )
    ]


@server.call_tool()
async def handle_call_tool(
    name: str,
    arguments: dict[str, Any] | None
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    """
    Maneja las llamadas a las herramientas del servidor MCP.
    
    Rutas las solicitudes al backend FastAPI correspondiente:
    - analyze_solicitud → POST /solicitudes/analizar
    - create_solicitud → POST /solicitudes/crear
    """
    
    if not arguments:
        raise ValueError("Se requieren argumentos para esta herramienta")
    
    texto_usuario = arguments.get("texto_usuario")
    if not texto_usuario:
        raise ValueError("El argumento 'texto_usuario' es requerido")
    
    # Crear cliente HTTP con timeout generoso (LLM puede tardar)
    async with httpx.AsyncClient(timeout=30.0) as client:
        
        if name == "analyze_solicitud":
            # Llamar al endpoint de análisis (Agente Analista)
            try:
                response = await client.post(
                    f"{BACKEND_URL}/solicitudes/analizar",
                    json={"texto_usuario": texto_usuario}
                )
                response.raise_for_status()
                analisis = response.json()
                
                # Formatear respuesta legible para el agente
                resultado = (
                    f"📊 **Análisis de Solicitud**\n\n"
                    f"**Texto original:** {analisis.get('texto_usuario_original', texto_usuario)}\n\n"
                    f"**Oficio sugerido:** {analisis.get('nombre_oficio_sugerido', 'No identificado')} "
                    f"(ID: {analisis.get('id_oficio_sugerido', 'N/A')})\n"
                    f"**Urgencia inferida:** {analisis.get('urgencia_inferida', 'No determinada')}\n"
                    f"**Descripción normalizada:** {analisis.get('descripcion_normalizada', 'N/A')}\n"
                    f"**Precio estimado:** ${analisis.get('precio_mercado_estimado', 'No disponible')} COP\n"
                    f"**Confianza:** {analisis.get('confianza', 0):.2f}\n\n"
                    f"**Explicación:** {analisis.get('explicacion', 'Sin explicación')}\n\n"
                )
                
                # Añadir alertas si existen
                senales = analisis.get('senales_alerta', [])
                if senales:
                    resultado += f"⚠️ **Señales de alerta:** {', '.join(senales)}\n\n"
                
                # Añadir preguntas aclaratorias si existen
                if analisis.get('necesita_aclaraciones'):
                    preguntas = analisis.get('preguntas_aclaratorias', [])
                    resultado += f"❓ **Preguntas sugeridas:**\n"
                    for i, pregunta in enumerate(preguntas, 1):
                        resultado += f"{i}. {pregunta}\n"
                
                return [types.TextContent(type="text", text=resultado)]
                
            except httpx.HTTPStatusError as e:
                error_detail = e.response.json().get("detail", str(e)) if e.response else str(e)
                return [
                    types.TextContent(
                        type="text",
                        text=f"❌ Error al analizar solicitud: {error_detail}"
                    )
                ]
            except Exception as e:
                return [
                    types.TextContent(
                        type="text",
                        text=f"❌ Error inesperado: {str(e)}"
                    )
                ]
        
        elif name == "create_solicitud":
            # Llamar al endpoint de creación (Agente Estructurador)
            try:
                response = await client.post(
                    f"{BACKEND_URL}/solicitudes/crear",
                    json={"texto_usuario": texto_usuario}
                )
                response.raise_for_status()
                solicitud = response.json()
                
                # Formatear respuesta con datos de la solicitud creada
                resultado = (
                    f"✅ **Solicitud Creada Exitosamente**\n\n"
                    f"**ID Solicitud:** {solicitud.get('id_solicitud')}\n"
                    f"**Oficio:** ID {solicitud.get('id_oficio')}\n"
                    f"**Descripción:** {solicitud.get('descripcion_usuario')}\n"
                    f"**Urgencia:** {solicitud.get('urgencia')}\n"
                    f"**Estado:** {solicitud.get('estado')}\n"
                    f"**Fecha creación:** {solicitud.get('fecha_creacion')}\n"
                    f"**Precio estimado mercado:** ${solicitud.get('precio_estimado_mercado')} COP\n"
                    f"**Alerta activa:** {'Sí' if solicitud.get('flag_alerta') else 'No'}\n"
                )
                
                return [types.TextContent(type="text", text=resultado)]
                
            except httpx.HTTPStatusError as e:
                error_detail = e.response.json().get("detail", str(e)) if e.response else str(e)
                return [
                    types.TextContent(
                        type="text",
                        text=f"❌ Error al crear solicitud: {error_detail}"
                    )
                ]
            except Exception as e:
                return [
                    types.TextContent(
                        type="text",
                        text=f"❌ Error inesperado: {str(e)}"
                    )
                ]
        
        else:
            raise ValueError(f"Herramienta desconocida: {name}")


async def main():
    """Función principal que inicia el servidor MCP."""
    # Ejecutar el servidor usando stdio (entrada/salida estándar)
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="taskpro-mcp-server",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={}
                )
            )
        )


if __name__ == "__main__":
    asyncio.run(main())
