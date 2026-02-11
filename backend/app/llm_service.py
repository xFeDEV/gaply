import os
import json
import re
from datetime import datetime
from typing import Literal, Annotated
from pathlib import Path
from openai import AzureOpenAI
from pydantic import BaseModel, Field
from models import (
    AnalisisOutput, RecomendacionOutput, AlertaOutput, 
    ProcesamientoCompletoOutput, SolicitudOutput
)  # Importación absoluta para ejecución dentro de /app

# Cargar variables de entorno desde .env
try:
    from dotenv import load_dotenv
    # Buscar el archivo .env en la raíz del proyecto
    env_path = Path(__file__).parent.parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    print("⚠️  python-dotenv no instalado. Asegúrate de exportar las variables manualmente.")


# Modelo Pydantic para la herramienta de Function Calling
class CrearSolicitudTool(BaseModel):
    id_oficio: int = Field(..., description="ID del oficio/servicio identificado de la tabla de oficios disponibles")
    urgencia: Literal['baja', 'media', 'alta'] = Field(..., description="Nivel de urgencia de la solicitud")
    descripcion_usuario: str = Field(..., description="Descripción limpia y estructurada extraída del texto del usuario")


# ──────────────────────────────────────────────
# Cliente Azure OpenAI
# ──────────────────────────────────────────────

def get_openai_client() -> AzureOpenAI:
    """
    Configura y devuelve el cliente de Azure OpenAI.

    Variables de entorno requeridas:
    - AZURE_OPENAI_ENDPOINT: URL del recurso Azure OpenAI
    - AZURE_OPENAI_API_KEY: Clave de autenticación
    - AZURE_OPENAI_API_VERSION: Versión del API (ej: 2024-12-01-preview)
    """
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview")

    if not endpoint or not api_key:
        raise ValueError(
            "Faltan variables de entorno AZURE_OPENAI_ENDPOINT y/o AZURE_OPENAI_API_KEY. "
            "Configúralas en el archivo .env"
        )

    print(f"🔑 Conectando a Azure OpenAI → {endpoint}")

    client = AzureOpenAI(
        azure_endpoint=endpoint,
        api_key=api_key,
        api_version=api_version,
    )
    return client


# Inicializar el cliente global
client = get_openai_client()

# Deployment name (modelo desplegado en Azure)
DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5-mini")


# ──────────────────────────────────────────────
# Helper: llamar al modelo y devolver texto
# ──────────────────────────────────────────────

def _chat(system: str, user: str, *,
          max_tokens: int = 8192, json_mode: bool = True) -> str:
    """
    Wrapper interno para llamadas a chat.completions.create.
    Devuelve el contenido de texto del primer choice.
    Usa role='developer' en lugar de 'system' (requerido por modelos de razonamiento como gpt-5-mini).
    """
    kwargs = dict(
        model=DEPLOYMENT,
        messages=[
            {"role": "developer", "content": system},
            {"role": "user", "content": user},
        ],
        max_completion_tokens=max_tokens,
    )
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    response = client.chat.completions.create(**kwargs)

    content = response.choices[0].message.content
    if not content:
        # Reasoning models pueden devolver contenido vacío en algunos casos
        print(f"⚠️ [LLM] Respuesta vacía. Finish reason: {response.choices[0].finish_reason}")
        raise ValueError("El modelo devolvió una respuesta vacía")

    return content


def _parse_json(text: str, context: str = "LLM") -> dict:
    """Parse JSON robusto con fallback de regex."""
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception as e:
                raise ValueError(f"{context}: no se pudo parsear JSON. Texto: {text[:500]}...") from e
        raise ValueError(f"{context}: no se encontró JSON. Texto: {text[:500]}...")


# ──────────────────────────────────────────────
#  Función stub para compatibilidad
# ──────────────────────────────────────────────

def crear_solicitud(
    id_oficio: Annotated[int, "ID del oficio/servicio identificado de la tabla de oficios disponibles"],
    urgencia: Annotated[Literal['baja', 'media', 'alta'], "Nivel de urgencia de la solicitud"],
    descripcion_usuario: Annotated[str, "Descripción limpia y estructurada extraída del texto del usuario"]
):
    """
    Crea una solicitud de servicio estructurada a partir del texto del usuario.

    Esta función es usada por el LLM mediante Function Calling para estructurar
    la información extraída del texto en lenguaje natural del usuario.
    """
    pass  # Esta función solo define la interfaz para el LLM


# ══════════════════════════════════════════════
# AGENTE 1 — Generar solicitud estructurada
# ══════════════════════════════════════════════

async def generar_solicitud_estructurada(texto_usuario_original: str, oficios_disponibles: str) -> CrearSolicitudTool:
    """
    Procesa el texto en lenguaje natural del usuario y lo convierte en una solicitud estructurada
    usando Azure OpenAI (gpt-5-mini) con JSON mode.
    """

    system_instruction = f"""Clasifica solicitudes de servicios. Responde SOLO JSON con: id_oficio (int), urgencia ("baja"|"media"|"alta"), descripcion_usuario (str concisa, tercera persona).

Oficios disponibles:
{oficios_disponibles}

Urgencia: alta=urgente/ya/hoy/emergencia, media=pronto/esta semana/sin especificar, baja=sin apuro/cuando puedan.
El id_oficio DEBE existir en la tabla."""

    user_message = texto_usuario_original

    try:
        text = _chat(system_instruction, user_message, max_tokens=4096)
    except Exception as e:
        raise ValueError(f"Error al llamar a Azure OpenAI: {str(e)}")

    parsed = _parse_json(text, "Solicitud")

    try:
        solicitud_tool = CrearSolicitudTool(
            id_oficio=int(parsed['id_oficio']),
            urgencia=parsed['urgencia'],
            descripcion_usuario=parsed['descripcion_usuario']
        )
        return solicitud_tool
    except KeyError as e:
        raise ValueError(f"Falta el parámetro requerido: {str(e)}. Args recibidos: {parsed}")
    except Exception as e:
        raise ValueError(f"Error al crear CrearSolicitudTool: {str(e)}. Args recibidos: {parsed}")


# ══════════════════════════════════════════════
# AGENTE 2 — Analizar solicitud
# ══════════════════════════════════════════════

async def analizar_solicitud(texto_usuario_original: str, oficios_disponibles: str) -> AnalisisOutput:
    """
    Agente Analista: interpreta la necesidad, sugiere oficio, estima urgencia y precio,
    detecta señales de alerta y formula preguntas aclaratorias.
    """

    system_instruction = f"""Analista de servicios técnicos LATAM. Responde SOLO JSON con estas claves:
{{"texto_usuario_original":str, "id_oficio_sugerido":int|null, "nombre_oficio_sugerido":str|null, "urgencia_inferida":"baja"|"media"|"alta"|null, "descripcion_normalizada":str|null, "precio_mercado_estimado":float|null, "explicacion":str|null, "senales_alerta":[str], "necesita_aclaraciones":bool, "preguntas_aclaratorias":[str], "confianza":float|null}}

Oficios:
{oficios_disponibles}

Reglas: mapea al oficio más relevante (ID DEBE existir). Urgencia alta=urgente/hoy/emergencia. Precio en moneda local o null. Detecta alertas (fraude, lenguaje agresivo, incoherencias). Confianza 0.0-1.0. Máx 3 preguntas aclaratorias si faltan datos."""

    user_message = texto_usuario_original

    try:
        text = _chat(system_instruction, user_message, max_tokens=8192)
    except Exception as e:
        raise ValueError(f"Error al llamar a Azure OpenAI (analista): {str(e)}")

    parsed = _parse_json(text, "Analista")

    try:
        if parsed.get("id_oficio_sugerido") is not None:
            parsed["id_oficio_sugerido"] = int(parsed["id_oficio_sugerido"])
        if parsed.get("precio_mercado_estimado") is not None:
            parsed["precio_mercado_estimado"] = float(parsed["precio_mercado_estimado"])

        analisis = AnalisisOutput(**parsed)
        return analisis
    except Exception as e:
        raise ValueError(f"Analista: error creando AnalisisOutput: {str(e)} | parsed={parsed}")


# ══════════════════════════════════════════════
# AGENTE 3 — Recomendar trabajadores
# ══════════════════════════════════════════════

async def recomendar_trabajadores(
    id_oficio: int, 
    urgencia: str, 
    descripcion_normalizada: str,
    trabajadores_disponibles: str,
    criterios_ubicacion: str = ""
) -> RecomendacionOutput:
    """
    Agente Recomendador: encuentra y prioriza trabajadores para una solicitud específica.
    """

    system_instruction = f"""Recomienda TOP 5 trabajadores. Responde SOLO JSON:
{{"total_candidatos_encontrados":int, "trabajadores_recomendados":[{{"id_trabajador":int, "nombre_completo":str, "score_relevancia":float, "distancia_km":float, "motivo_top":"experiencia"|"proximidad"|"precio"|"calificacion"|"disponibilidad", "precio_propuesto":int, "anos_experiencia":int, "calificacion_promedio":float, "explicacion":str, "tiene_arl":bool}}], "criterios_busqueda":{{"urgencia":str,"oficio_id":int}}, "explicacion_algoritmo":str, "confianza_recomendaciones":float}}

Solicitud: oficio={id_oficio}, urgencia={urgencia}, desc="{descripcion_normalizada}", ubicación={criterios_ubicacion}

Trabajadores:
{trabajadores_disponibles}

Scoring por urgencia — alta: disponibilidad(40%)+proximidad(30%)+experiencia(20%)+precio(10%), media: experiencia(30%)+calificación(25%)+proximidad(25%)+precio(20%), baja: precio(35%)+calificación(30%)+experiencia(25%)+proximidad(10%). Ordenar por score desc. Explicaciones breves y específicas."""

    user_message = f"Recomienda TOP 5 para oficio {id_oficio}, urgencia {urgencia}: {descripcion_normalizada}"

    try:
        text = _chat(system_instruction, user_message, max_tokens=16384)
    except Exception as e:
        raise ValueError(f"Error al llamar a Azure OpenAI (recomendador): {str(e)}")

    parsed = _parse_json(text, "Recomendador")

    try:
        recomendacion = RecomendacionOutput(**parsed)
        return recomendacion
    except Exception as e:
        raise ValueError(f"Recomendador: error creando RecomendacionOutput: {str(e)} | parsed={parsed}")


# ══════════════════════════════════════════════
# AGENTE 4 — Detectar alertas
# ══════════════════════════════════════════════

async def detectar_alertas(
    analisis: "AnalisisOutput",
    recomendaciones: "RecomendacionOutput" = None,
    contexto_adicional: str = ""
) -> AlertaOutput:
    """
    Agente Detector de Alertas: identifica anomalías, riesgos y patrones sospechosos.
    """

    solicitud_data = {
        "texto_original": analisis.texto_usuario_original,
        "oficio_sugerido": analisis.nombre_oficio_sugerido,
        "urgencia": analisis.urgencia_inferida,
        "precio_estimado": analisis.precio_mercado_estimado,
        "confianza_analisis": analisis.confianza,
        "senales_previas": analisis.senales_alerta
    }

    recomendaciones_data = []
    if recomendaciones and recomendaciones.trabajadores_recomendados:
        for rec in recomendaciones.trabajadores_recomendados:
            recomendaciones_data.append({
                "id_trabajador": rec.id_trabajador,
                "precio_propuesto": rec.precio_propuesto,
                "score": rec.score_relevancia,
                "distancia": rec.distancia_km,
                "calificacion": rec.calificacion_promedio
            })

    system_instruction = f"""Detector de riesgos. Responde SOLO JSON:
{{"alertas_detectadas":[{{"tipo_alerta":str, "severidad":"baja"|"media"|"alta"|"critica", "detalle":str, "entidad_afectada":str, "id_entidad":int|null, "accion_recomendada":str}}], "score_riesgo_general":float(0-1), "requiere_revision_manual":bool, "explicacion_evaluacion":str}}

Tipos: PRECIO_ANOMALO, RIESGO_SEGURIDAD, PATRON_SOSPECHOSO, CALIDAD_BAJA, DISPONIBILIDAD_DUDOSA.
Severidad critica=bloquear, alta=revisión manual, media=advertir, baja=log.
Revisión manual si score>0.7 o alertas criticas/altas. Solo alertas con evidencia concreta.

Datos:
Solicitud: {solicitud_data}
Recomendaciones: {recomendaciones_data}
Contexto: {contexto_adicional}"""

    user_message = "Evalúa esta solicitud y recomendaciones en busca de riesgos y anomalías."

    try:
        text = _chat(system_instruction, user_message)
    except Exception as e:
        raise ValueError(f"Error al llamar a Azure OpenAI (detector alertas): {str(e)}")

    parsed = _parse_json(text, "Detector alertas")

    try:
        alertas = AlertaOutput(**parsed)
        return alertas
    except Exception as e:
        raise ValueError(f"Detector alertas: error creando AlertaOutput: {str(e)} | parsed={parsed}")


# ══════════════════════════════════════════════
# ORQUESTADOR — Pipeline A2A completo
# ══════════════════════════════════════════════

async def procesar_solicitud_completa(
    texto_usuario: str,
    oficios_disponibles: str,
    trabajadores_disponibles: str,
    id_barrio_usuario: int = None
) -> ProcesamientoCompletoOutput:
    """
    Agente Orquestador Principal: ejecuta el pipeline completo A2A.
    
    Flujo:
    1. Analizar solicitud (Agente Analista)
    2. Si es viable → Recomendar trabajadores (Agente Recomendador) 
    3. Detectar alertas en todo el proceso (Agente Guardian)
    4. Decidir acción final basándose en alertas y análisis
    5. Retornar resultado completo
    """
    import time
    
    inicio_tiempo = time.time()
    agentes_ejecutados = []
    
    try:
        # PASO 1: Análisis inicial (Agente Analista)
        print("🔍 Ejecutando Agente Analista...")
        agentes_ejecutados.append("analista")
        
        analisis = await analizar_solicitud(texto_usuario, oficios_disponibles)
        
        # PASO 2: Evaluación temprana de viabilidad y datos faltantes
        alertas_tempranas = []
        
        # Verificar confianza del análisis
        if analisis.confianza and analisis.confianza < 0.5:
            alertas_tempranas.append({
                "tipo_alerta": "CONFIANZA_BAJA",
                "severidad": "media",
                "detalle": f"Análisis inicial con confianza {analisis.confianza:.2f} < 0.5",
                "entidad_afectada": "solicitud",
                "id_entidad": None,
                "accion_recomendada": "Solicitar más detalles al usuario sobre el problema"
            })
        
        # Verificar datos del solicitante
        if not id_barrio_usuario:
            alertas_tempranas.append({
                "tipo_alerta": "DATOS_INCOMPLETOS",
                "severidad": "alta",
                "detalle": "No se proporcionó la ubicación del usuario (id_barrio_usuario)",
                "entidad_afectada": "solicitud",
                "id_entidad": None,
                "accion_recomendada": "Solicitar dirección o barrio del usuario para calcular distancias precisas"
            })
        
        # Extraer nombre del usuario del texto (si está disponible)
        texto_lower = texto_usuario.lower()
        nombre_usuario = None
        patrones_nombre = [
            r"soy\s+([a-záéíóúñ\s]+)",
            r"me\s+llamo\s+([a-záéíóúñ\s]+)",
            r"es\s+para\s+([a-záéíóúñ\s]+)",
            r"mi\s+nombre\s+es\s+([a-záéíóúñ\s]+)"
        ]
        
        for patron in patrones_nombre:
            match = re.search(patron, texto_lower)
            if match:
                nombre_usuario = match.group(1).strip().title()
                break
        
        if not nombre_usuario:
            alertas_tempranas.append({
                "tipo_alerta": "IDENTIFICACION_FALTANTE",
                "severidad": "media",
                "detalle": "No se pudo identificar el nombre del solicitante en el texto",
                "entidad_afectada": "solicitud",
                "id_entidad": None,
                "accion_recomendada": "Solicitar nombre completo y datos de contacto del usuario"
            })
        
        # Si hay alertas críticas tempranas, detener procesamiento
        alertas_criticas_tempranas = [a for a in alertas_tempranas if a["severidad"] in ["critica", "alta"]]
        
        if alertas_criticas_tempranas or (analisis.confianza and analisis.confianza < 0.3):
            tiempo_final = int((time.time() - inicio_tiempo) * 1000)
            
            alertas_output = AlertaOutput(
                alertas_detectadas=alertas_tempranas,
                score_riesgo_general=0.7 if alertas_criticas_tempranas else 0.3,
                requiere_revision_manual=len(alertas_criticas_tempranas) > 0,
                explicacion_evaluacion="Procesamiento detenido por datos insuficientes o confianza muy baja"
            )
            
            preguntas_adicionales = []
            if not id_barrio_usuario:
                preguntas_adicionales.append("¿En qué barrio o dirección necesitas el servicio?")
            if not nombre_usuario:
                preguntas_adicionales.append("¿Cuál es tu nombre completo para la solicitud?")
            if analisis.preguntas_aclaratorias:
                preguntas_adicionales.extend(analisis.preguntas_aclaratorias)
            
            mensaje_usuario = "Necesito algunos datos adicionales: " + " ".join(preguntas_adicionales)
            
            return ProcesamientoCompletoOutput(
                analisis=analisis,
                solicitud_creada=None,
                recomendaciones=None,
                alertas=alertas_output,
                tiempo_procesamiento_ms=tiempo_final,
                agentes_ejecutados=agentes_ejecutados,
                decision_final="requiere_aclaraciones",
                mensaje_usuario=mensaje_usuario
            )
        
        # PASO 3: Buscar trabajadores (Agente Recomendador)
        recomendaciones = None
        if analisis.id_oficio_sugerido:
            print("🎯 Ejecutando Agente Recomendador...")
            agentes_ejecutados.append("recomendador")
            
            criterios_ubicacion = f"Barrio usuario: {id_barrio_usuario}" if id_barrio_usuario else ""
            
            recomendaciones = await recomendar_trabajadores(
                id_oficio=analisis.id_oficio_sugerido,
                urgencia=analisis.urgencia_inferida or "media",
                descripcion_normalizada=analisis.descripcion_normalizada or texto_usuario,
                trabajadores_disponibles=trabajadores_disponibles,
                criterios_ubicacion=criterios_ubicacion
            )
        
        # PASO 4: Detectar alertas (Agente Guardian)
        print("🛡️ Ejecutando Agente Guardian...")
        agentes_ejecutados.append("guardian")
        
        alertas = await detectar_alertas(
            analisis=analisis,
            recomendaciones=recomendaciones,
            contexto_adicional=f"Procesamiento A2A completo. Barrio: {id_barrio_usuario}"
        )
        
        # PASO 5: Decidir acción final basándose en alertas
        decision_final = "solicitud_creada"
        mensaje_usuario = "Solicitud procesada exitosamente."
        solicitud_creada = None
        
        # Verificar alertas críticas
        alertas_criticas = [a for a in alertas.alertas_detectadas if a.severidad == "critica"]
        alertas_altas = [a for a in alertas.alertas_detectadas if a.severidad == "alta"]
        
        if alertas_criticas:
            decision_final = "bloqueada_por_alertas"
            mensaje_usuario = f"Solicitud bloqueada por seguridad: {alertas_criticas[0].detalle}"
        elif alertas.score_riesgo_general > 0.8 or alertas.requiere_revision_manual:
            decision_final = "bloqueada_por_alertas" 
            mensaje_usuario = "Solicitud requiere revisión manual por posibles riesgos."
        elif alertas_altas:
            decision_final = "requiere_aclaraciones"
            mensaje_usuario = f"Advertencia de seguridad: {alertas_altas[0].detalle}. ¿Deseas continuar?"
        else:
            # Todo OK, crear solicitud (simulada por ahora)
            decision_final = "solicitud_creada"
            
            # Incluir alertas tempranas en el total
            todas_las_alertas = alertas.alertas_detectadas + alertas_tempranas
            
            # Determinar si crear solicitud real o simulada
            crear_en_bd = (
                id_barrio_usuario is not None and  # Tenemos ubicación
                nombre_usuario is not None and     # Identificamos usuario
                len(alertas_criticas_tempranas) == 0  # Sin alertas críticas tempranas
            )
            
            if crear_en_bd:
                # TODO: Crear solicitud REAL en base de datos
                # Por ahora simulamos, pero aquí iría la lógica real de BD
                mensaje_usuario = f"¡Perfecto {nombre_usuario}! Encontré trabajadores disponibles para tu solicitud."
                solicitud_creada = SolicitudOutput(
                    id_solicitud=99998,  # ID simulado pero "más real"
                    id_solicitante=1,  # TODO: Buscar/crear solicitante real
                    id_oficio=analisis.id_oficio_sugerido,
                    descripcion_usuario=analisis.descripcion_normalizada,
                    urgencia=analisis.urgencia_inferida,
                    id_barrio_servicio=id_barrio_usuario,
                    fecha_creacion=datetime.now(),
                    estado="pendiente",
                    precio_estimado_mercado=analisis.precio_mercado_estimado or 0.0,
                    flag_alerta=len(todas_las_alertas) > 0
                )
            else:
                # Solicitud simulada (modo demostración)
                mensaje_usuario = "¡Encontré trabajadores disponibles! [MODO DEMO - Proporciona todos los datos para crear solicitud real]"
                solicitud_creada = SolicitudOutput(
                    id_solicitud=99999,  # ID claramente simulado
                    id_solicitante=0,    # ID simulado
                    id_oficio=analisis.id_oficio_sugerido,
                    descripcion_usuario=analisis.descripcion_normalizada,
                    urgencia=analisis.urgencia_inferida,
                    id_barrio_servicio=id_barrio_usuario or 1,
                    fecha_creacion=datetime.now(),
                    estado="pendiente",
                    precio_estimado_mercado=analisis.precio_mercado_estimado or 0.0,
                    flag_alerta=len(todas_las_alertas) > 0
                )
            
            # Actualizar alertas con las tempranas
            alertas.alertas_detectadas = todas_las_alertas
        
        # RESULTADO FINAL
        tiempo_final = int((time.time() - inicio_tiempo) * 1000)
        
        resultado = ProcesamientoCompletoOutput(
            analisis=analisis,
            solicitud_creada=solicitud_creada,
            recomendaciones=recomendaciones,
            alertas=alertas,
            tiempo_procesamiento_ms=tiempo_final,
            agentes_ejecutados=agentes_ejecutados,
            decision_final=decision_final,
            mensaje_usuario=mensaje_usuario
        )
        
        print(f"✅ Pipeline A2A completado en {tiempo_final}ms. Agentes: {', '.join(agentes_ejecutados)}")
        return resultado
        
    except Exception as e:
        # Manejo de errores: crear respuesta de fallo
        tiempo_final = int((time.time() - inicio_tiempo) * 1000)
        
        alertas_error = AlertaOutput(
            alertas_detectadas=[{
                "tipo_alerta": "ERROR_SISTEMA",
                "severidad": "critica", 
                "detalle": f"Error en pipeline A2A: {str(e)}",
                "entidad_afectada": "sistema",
                "id_entidad": None,
                "accion_recomendada": "Reintentar o contactar soporte técnico"
            }],
            score_riesgo_general=1.0,
            requiere_revision_manual=True,
            explicacion_evaluacion="Fallo técnico durante procesamiento"
        )
        
        # Analisis básico de fallo
        analisis_fallo = AnalisisOutput(
            texto_usuario_original=texto_usuario,
            explicacion=f"Error durante análisis: {str(e)}",
            confianza=0.0
        )
        
        return ProcesamientoCompletoOutput(
            analisis=analisis_fallo,
            solicitud_creada=None,
            recomendaciones=None,
            alertas=alertas_error,
            tiempo_procesamiento_ms=tiempo_final,
            agentes_ejecutados=agentes_ejecutados,
            decision_final="bloqueada_por_alertas",
            mensaje_usuario="Lo siento, hubo un error técnico. Por favor intenta nuevamente."
        )
