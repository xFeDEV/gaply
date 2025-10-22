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
        ),
        types.Tool(
            name="procesar_solicitud_completa",
            description=(
                "🚀 **AGENTE ORQUESTADOR A2A**: Resuelve el problema completo de María y Carlos. "
                "Ejecuta el pipeline completo de agentes: Analista → Recomendador → Guardian → Decisión. "
                "\n\n**Caso de uso:** María: 'Necesito un plomero urgente, se rompió mi inodoro' "
                "→ Sistema encuentra a Carlos (plomero, 5⭐, 2km, disponible) → Conexión exitosa. "
                "\n\n**Pipeline ejecutado:**\n"
                "1. 🔍 Agente Analista: identifica oficio, urgencia, precio estimado\n"
                "2. 🎯 Agente Recomendador: encuentra trabajadores cercanos y calificados\n"
                "3. 🛡️ Agente Guardian: detecta riesgos, precios anómalos, patrones sospechosos\n"
                "4. 🧠 Orquestador: decide acción final basándose en análisis y alertas\n"
                "\n**Retorna:** Análisis completo + Recomendaciones priorizadas + Alertas de seguridad + Decisión final"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "texto_usuario": {
                        "type": "string",
                        "description": (
                            "Descripción del problema en lenguaje natural. El usuario puede escribir "
                            "como hablaría en la vida real. Ejemplos:\n"
                            "• 'Se me dañó la nevera y no enfría nada, necesito que venga alguien hoy'\n"
                            "• 'Tengo una fuga de agua en el baño, es urgente'\n"
                            "• 'Necesito un electricista para instalar un aire acondicionado'\n"
                            "• 'Se me tapó el desagüe de la cocina y huele horrible'"
                        )
                    },
                    "id_barrio_usuario": {
                        "type": "integer",
                        "description": (
                            "ID del barrio donde vive el usuario (opcional). "
                            "Si se proporciona, permite calcular distancias más precisas y priorizar trabajadores cercanos."
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
        
        elif name == "procesar_solicitud_completa":
            # 🚀 Ejecutar el pipeline completo A2A (María → Carlos)
            try:
                # Extraer parámetros adicionales
                id_barrio_usuario = arguments.get("id_barrio_usuario")
                
                payload = {"texto_usuario": texto_usuario}
                if id_barrio_usuario:
                    payload["id_barrio_usuario"] = id_barrio_usuario
                
                response = await client.post(
                    f"{BACKEND_URL}/solicitudes/procesar-completa",
                    json=payload
                )
                response.raise_for_status()
                procesamiento = response.json()
                
                # Formatear respuesta completa del pipeline A2A
                resultado = (
                    f"🚀 **PIPELINE COMPLETO EJECUTADO** ({procesamiento.get('tiempo_procesamiento_ms')}ms)\n"
                    f"**Agentes ejecutados:** {', '.join(procesamiento.get('agentes_ejecutados', []))}\n\n"
                )
                
                # Análisis inicial
                analisis = procesamiento.get('analisis', {})
                resultado += (
                    f"🔍 **ANÁLISIS INICIAL**\n"
                    f"**Oficio identificado:** {analisis.get('nombre_oficio_sugerido', 'No identificado')} "
                    f"(ID: {analisis.get('id_oficio_sugerido', 'N/A')})\n"
                    f"**Urgencia:** {analisis.get('urgencia_inferida', 'No determinada')}\n"
                    f"**Precio estimado:** ${analisis.get('precio_mercado_estimado', 0)} COP\n"
                    f"**Confianza:** {analisis.get('confianza', 0):.2f}/1.0\n"
                    f"**Explicación:** {analisis.get('explicacion', 'Sin explicación')}\n\n"
                )
                
                # Recomendaciones de trabajadores
                recomendaciones = procesamiento.get('recomendaciones')
                if recomendaciones and recomendaciones.get('trabajadores_recomendados'):
                    resultado += f"🎯 **TRABAJADORES RECOMENDADOS** ({recomendaciones.get('total_candidatos_encontrados')} encontrados)\n\n"
                    
                    for i, trabajador in enumerate(recomendaciones['trabajadores_recomendados'][:3], 1):  # Top 3
                        resultado += (
                            f"**#{i}. {trabajador.get('nombre_completo')}**\n"
                            f"• Score de relevancia: {trabajador.get('score_relevancia'):.2f}/1.0\n"
                            f"• Distancia: {trabajador.get('distancia_km')} km\n"
                            f"• Experiencia: {trabajador.get('anos_experiencia')} años\n"
                            f"• Calificación: {trabajador.get('calificacion_promedio')}/5 ⭐\n"
                            f"• Precio propuesto: ${trabajador.get('precio_propuesto')} COP\n"
                            f"• Motivo principal: {trabajador.get('motivo_top')}\n"
                            f"• ARL: {'✅' if trabajador.get('tiene_arl') else '❌'}\n"
                            f"• **Explicación:** {trabajador.get('explicacion')}\n\n"
                        )
                else:
                    resultado += "❌ **No se encontraron trabajadores disponibles**\n\n"
                
                # Alertas de seguridad
                alertas = procesamiento.get('alertas', {})
                alertas_detectadas = alertas.get('alertas_detectadas', [])
                
                if alertas_detectadas:
                    resultado += f"🛡️ **ALERTAS DE SEGURIDAD** (Riesgo general: {alertas.get('score_riesgo_general', 0):.2f}/1.0)\n\n"
                    
                    for alerta in alertas_detectadas:
                        severidad_emoji = {
                            'critica': '🔴',
                            'alta': '🟠', 
                            'media': '🟡',
                            'baja': '🟢'
                        }.get(alerta.get('severidad', 'baja'), '⚪')
                        
                        resultado += (
                            f"{severidad_emoji} **{alerta.get('tipo_alerta').replace('_', ' ').title()}** "
                            f"({alerta.get('severidad').upper()})\n"
                            f"**Detalle:** {alerta.get('detalle')}\n"
                            f"**Acción recomendada:** {alerta.get('accion_recomendada')}\n\n"
                        )
                else:
                    resultado += "🟢 **Sin alertas de seguridad detectadas**\n\n"
                
                # Decisión final
                decision = procesamiento.get('decision_final', 'desconocida')
                mensaje = procesamiento.get('mensaje_usuario', '')
                
                decision_emoji = {
                    'solicitud_creada': '✅',
                    'requiere_aclaraciones': '❓',
                    'bloqueada_por_alertas': '🚫'
                }.get(decision, '❓')
                
                resultado += (
                    f"{decision_emoji} **DECISIÓN FINAL:** {decision.replace('_', ' ').title()}\n"
                    f"**Mensaje para el usuario:** {mensaje}\n"
                )
                
                # Solicitud creada (si aplica)
                if procesamiento.get('solicitud_creada'):
                    solicitud = procesamiento['solicitud_creada']
                    resultado += (
                        f"\n📝 **Solicitud creada:** ID {solicitud.get('id_solicitud')} "
                        f"(Estado: {solicitud.get('estado')})\n"
                    )
                
                return [types.TextContent(type="text", text=resultado)]
                
            except httpx.HTTPStatusError as e:
                error_detail = e.response.json().get("detail", str(e)) if e.response else str(e)
                return [
                    types.TextContent(
                        type="text",
                        text=f"❌ Error en pipeline A2A: {error_detail}"
                    )
                ]
            except Exception as e:
                return [
                    types.TextContent(
                        type="text", 
                        text=f"❌ Error inesperado en pipeline A2A: {str(e)}"
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
