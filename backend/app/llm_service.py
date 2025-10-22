import os
from datetime import datetime
from typing import Literal, Annotated
from pathlib import Path
from google import genai
from google.genai.types import HttpOptions
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


def get_gemini_client():
    """
    Configura y devuelve el cliente de Gemini.
    
    Soporta dos métodos de autenticación:
    1. Vertex AI con ADC (Application Default Credentials) - Recomendado para producción
    2. API Key - Fallback o desarrollo
    
    La configuración se controla mediante variables de entorno:
    - GOOGLE_GENAI_USE_VERTEXAI: Si es "True", usa Vertex AI
    - GOOGLE_APPLICATION_CREDENTIALS: Ruta al archivo JSON de credenciales (para Vertex AI)
    - GOOGLE_CLOUD_PROJECT: ID del proyecto de Google Cloud (para Vertex AI)
    - GOOGLE_CLOUD_LOCATION: Ubicación del servicio (para Vertex AI, ej: us-central1)
    - GOOGLE_API_KEY: API Key de Gemini (fallback)
    
    Returns:
        Cliente de Gemini configurado.
    """
    use_vertex = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() == "true"
    
    if use_vertex:
        # Modo Vertex AI con ADC
        # Las credenciales se cargan automáticamente desde GOOGLE_APPLICATION_CREDENTIALS
        project = os.getenv("GOOGLE_CLOUD_PROJECT")
        location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
        
        if not project:
            raise ValueError(
                "GOOGLE_CLOUD_PROJECT no está configurado. "
                "Es requerido cuando se usa Vertex AI."
            )
        
        print(f"🔐 Usando Vertex AI con ADC - Proyecto: {project}, Ubicación: {location}")
        
        # El cliente se autentica automáticamente usando ADC
        client = genai.Client(
            http_options=HttpOptions(api_version="v1alpha")
        )
    else:
        # Modo API Key (fallback)
        api_key = os.getenv("GOOGLE_API_KEY")
        
        if not api_key:
            raise ValueError(
                "No se encontró GOOGLE_API_KEY. "
                "Asegúrate de configurarla en el archivo docker-compose.yml "
                "o habilita Vertex AI con GOOGLE_GENAI_USE_VERTEXAI=True"
            )
        
        print("🔑 Usando API Key de Gemini")
        
        # Crear el cliente con la API key
        client = genai.Client(
            api_key=api_key,
            http_options=HttpOptions(api_version="v1alpha")
        )
    
    return client


# Inicializar el cliente global
client = get_gemini_client()


def crear_solicitud(
    id_oficio: Annotated[int, "ID del oficio/servicio identificado de la tabla de oficios disponibles"],
    urgencia: Annotated[Literal['baja', 'media', 'alta'], "Nivel de urgencia de la solicitud"],
    descripcion_usuario: Annotated[str, "Descripción limpia y estructurada extraída del texto del usuario"]
):
    """
    Crea una solicitud de servicio estructurada a partir del texto del usuario.
    
    Esta función es usada por el LLM mediante Function Calling para estructurar
    la información extraída del texto en lenguaje natural del usuario.
    
    Args:
        id_oficio: ID del oficio/servicio identificado de la tabla de oficios disponibles
        urgencia: Nivel de urgencia (baja, media o alta)
        descripcion_usuario: Descripción limpia y estructurada extraída del texto del usuario
    """
    pass  # Esta función solo define la interfaz para el LLM


async def generar_solicitud_estructurada(texto_usuario_original: str, oficios_disponibles: str) -> CrearSolicitudTool:
    """
    Procesa el texto en lenguaje natural del usuario y lo convierte en una solicitud estructurada
    usando Google Gemini y Function Calling.
    
    Args:
        texto_usuario_original: El texto que escribió el usuario describiendo su necesidad
        oficios_disponibles: String con la tabla de oficios disponibles en formato legible
    
    Returns:
        CrearSolicitudTool: Objeto estructurado con id_oficio, urgencia y descripción
    """
    
    # System prompt para guiar a Gemini
    system_instruction = f"""Eres 'TaskPro Assistant', un asistente inteligente que ayuda a usuarios a crear solicitudes de servicios profesionales.

Tu trabajo es:
1. Leer la solicitud en lenguaje natural del usuario
2. Identificar el oficio/servicio más apropiado de la tabla de oficios disponibles
3. Determinar el nivel de urgencia (baja, media, alta) basándote en palabras clave y contexto
4. Extraer y limpiar la descripción del servicio necesitado

[INICIO DE TABLA DE OFICIOS]
{oficios_disponibles}
[FIN DE TABLA DE OFICIOS]

REGLAS IMPORTANTES:
- Siempre debes llamar a la función 'crear_solicitud' con los datos estructurados
- El id_oficio DEBE existir en la tabla de oficios proporcionada
- La urgencia debe ser: 'baja', 'media' o 'alta'
  * 'alta': si el usuario menciona "urgente", "ya", "hoy", "emergencia"
  * 'media': si menciona "pronto", "esta semana", o no especifica tiempo
  * 'baja': si menciona "cuando puedan", "sin apuro", o fechas lejanas
- La descripción debe ser clara, concisa y en tercera persona

Ejemplo de transformación:
Usuario: "Necesito un plomero urgente, se me rompió un caño en la cocina"
→ id_oficio: [ID del oficio 'Plomero'], urgencia: 'alta', descripcion_usuario: 'Reparación urgente de caño roto en cocina'
"""

    # Preparar el mensaje del usuario
    user_message = f"[SOLICITUD DEL USUARIO]\n{texto_usuario_original}"
    
    # Llamar a Gemini con function calling
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=user_message,
            config={
                "system_instruction": system_instruction,
                "tools": [crear_solicitud],
                "response_modalities": ["TEXT"],
                "temperature": 0.2,  # Baja temperatura para respuestas más determinísticas
            }
        )
    except Exception as e:
        raise ValueError(f"Error al llamar a Gemini: {str(e)}")
    
    # Extraer la llamada a la función
    if not response.candidates:
        raise ValueError("No se recibió respuesta del modelo")
    
    candidate = response.candidates[0]
    
    if not candidate.content or not candidate.content.parts:
        raise ValueError("La respuesta del modelo no contiene parts")
    
    # Buscar la function call en la respuesta
    function_call = None
    for part in candidate.content.parts:
        if hasattr(part, 'function_call') and part.function_call:
            function_call = part.function_call
            break
    
    if not function_call:
        # Intentar obtener texto de la respuesta para debugging
        text_parts = [p.text for p in candidate.content.parts if hasattr(p, 'text')]
        text_response = " ".join(text_parts) if text_parts else "Sin texto"
        raise ValueError(f"El modelo no generó una llamada a función. Respuesta: {text_response}")
    
    if function_call.name != "crear_solicitud":
        raise ValueError(f"El modelo llamó a una función inesperada: {function_call.name}")
    
    # Extraer y parsear los argumentos
    args = dict(function_call.args)
    
    # Crear y retornar la instancia de CrearSolicitudTool
    try:
        solicitud_tool = CrearSolicitudTool(
            id_oficio=int(args['id_oficio']),
            urgencia=args['urgencia'],
            descripcion_usuario=args['descripcion_usuario']
        )
        return solicitud_tool
    except KeyError as e:
        raise ValueError(f"Falta el parámetro requerido: {str(e)}. Args recibidos: {args}")
    except Exception as e:
        raise ValueError(f"Error al crear CrearSolicitudTool: {str(e)}. Args recibidos: {args}")


async def analizar_solicitud(texto_usuario_original: str, oficios_disponibles: str) -> AnalisisOutput:
    """
    Agente Analista: interpreta la necesidad, sugiere oficio, estima urgencia y precio,
    detecta señales de alerta y formula preguntas aclaratorias.

    Retorna un AnalisisOutput con trazabilidad y campos útiles para UI y auditoría.
    """

    system_instruction = f"""Eres 'TaskPro Analyst', un analista experto en clasificación de servicios técnicos para LATAM.

Objetivo:
- Entender el problema del usuario y mapearlo al oficio más adecuado de la lista provista.
- Inferir urgencia ('baja' | 'media' | 'alta').
- Normalizar la descripción en tercera persona, concisa y clara.
- Estimar un precio de mercado razonable (si es posible) en moneda local referencial.
- Detectar señales de alerta (riesgos, términos problemáticos, incoherencias o potencial fraude).
- Indicar si hacen falta aclaraciones y proponer 1-3 preguntas concretas.
- Proveer una explicación breve y un puntaje de confianza (0.0 a 1.0).

Contexto de negocio (resumen):
- Conectar necesidades urgentes y confiables (usuarios) con trabajadores calificados disponibles.
- Transparencia: explicar por qué se recomienda un oficio.
- Priorizar seguridad y claridad (alertas, precios fuera de rango, lenguaje agresivo, etc.).

[INICIO DE TABLA DE OFICIOS]
{oficios_disponibles}
[FIN DE TABLA DE OFICIOS]

Formato de salida JSON estricto con las claves EXACTAS:
{{
  "texto_usuario_original": str,
  "id_oficio_sugerido": int | null,
  "nombre_oficio_sugerido": str | null,
  "urgencia_inferida": "baja" | "media" | "alta" | null,
  "descripcion_normalizada": str | null,
  "precio_mercado_estimado": float | null,
  "explicacion": str | null,
  "senales_alerta": [str],
  "necesita_aclaraciones": bool,
  "preguntas_aclaratorias": [str],
  "confianza": float | null
}}

Reglas:
- Si dudas entre 2 oficios, escoge el más directamente relacionado con la acción solicitada.
- Si mencionan urgencia explícita ("urgente", "hoy", "inmediato"), marca 'alta'.
- Si no hay suficiente info para un precio, deja null.
- No inventes IDs: el id_oficio_sugerido DEBE existir en la tabla provista o deja null.
"""

    user_message = f"[SOLICITUD DEL USUARIO]\n{texto_usuario_original}"

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=user_message,
            config={
                "system_instruction": system_instruction,
                "response_modalities": ["TEXT"],
                "temperature": 0.2,
            }
        )
    except Exception as e:
        raise ValueError(f"Error al llamar a Gemini (analista): {str(e)}")

    if not response.candidates:
        raise ValueError("Analista: no se recibió respuesta del modelo")

    candidate = response.candidates[0]
    text_parts = [getattr(p, 'text', '') for p in getattr(candidate, 'content', {}).parts or []]
    text = " ".join([t for t in text_parts if t]).strip()

    if not text:
        raise ValueError("Analista: la respuesta no contiene texto JSON")

    # Intentar parsear JSON de forma robusta
    import json
    parsed = None
    try:
        parsed = json.loads(text)
    except Exception:
        # Heurística: extraer el primer bloque entre llaves
        import re
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                parsed = json.loads(match.group(0))
            except Exception as e:
                raise ValueError(f"Analista: no se pudo parsear JSON. Texto: {text[:500]}...") from e
        else:
            raise ValueError(f"Analista: no se encontró JSON en la respuesta. Texto: {text[:500]}...")

    try:
        # Normalización de tipos
        if parsed.get("id_oficio_sugerido") is not None:
            parsed["id_oficio_sugerido"] = int(parsed["id_oficio_sugerido"])  # puede venir como str
        if parsed.get("precio_mercado_estimado") is not None:
            parsed["precio_mercado_estimado"] = float(parsed["precio_mercado_estimado"])  # coerción

        analisis = AnalisisOutput(**parsed)
        return analisis
    except Exception as e:
        raise ValueError(f"Analista: error creando AnalisisOutput: {str(e)} | parsed={parsed}")


async def recomendar_trabajadores(
    id_oficio: int, 
    urgencia: str, 
    descripcion_normalizada: str,
    trabajadores_disponibles: str,
    criterios_ubicacion: str = ""
) -> RecomendacionOutput:
    """
    Agente Recomendador: encuentra y prioriza trabajadores para una solicitud específica.
    
    Args:
        id_oficio: ID del oficio requerido
        urgencia: Nivel de urgencia ('baja', 'media', 'alta')
        descripcion_normalizada: Descripción limpia del servicio requerido
        trabajadores_disponibles: String con datos de trabajadores formateados
        criterios_ubicacion: Información adicional de ubicación/distancia
    
    Returns:
        RecomendacionOutput: Lista priorizada de trabajadores recomendados con explicaciones
    """

    system_instruction = f"""Eres 'TaskPro Matcher', un agente especializado en conectar solicitudes con los trabajadores más apropiados.

Objetivo:
- Analizar trabajadores disponibles y asignar scores de relevancia (0.0 a 1.0).
- Priorizar basándote en: experiencia relevante, proximidad, disponibilidad, calificación, precio justo.
- Generar explicaciones claras de por qué cada trabajador es recomendado.
- Limitar a los TOP 5 mejores candidatos para evitar sobrecarga cognitiva.

Contexto de la solicitud:
- Oficio requerido: ID {id_oficio}
- Urgencia: {urgencia}
- Descripción: {descripcion_normalizada}
- Criterios ubicación: {criterios_ubicacion}

[INICIO DE TRABAJADORES DISPONIBLES]
{trabajadores_disponibles}
[FIN DE TRABAJADORES DISPONIBLES]

Criterios de scoring (prioridad según urgencia):
- URGENCIA ALTA: Disponibilidad inmediata (40%), Proximidad (30%), Experiencia (20%), Precio (10%)
- URGENCIA MEDIA: Experiencia (30%), Calificación (25%), Proximidad (25%), Precio (20%)
- URGENCIA BAJA: Precio (35%), Calificación (30%), Experiencia (25%), Proximidad (10%)

Motivos principales: 'experiencia' | 'proximidad' | 'precio' | 'calificacion' | 'disponibilidad'

Formato JSON estricto:
{{
  "total_candidatos_encontrados": int,
  "trabajadores_recomendados": [
    {{
      "id_trabajador": int,
      "nombre_completo": str,
      "score_relevancia": float,
      "distancia_km": float,
      "motivo_top": str,
      "precio_propuesto": int,
      "anos_experiencia": int,
      "calificacion_promedio": float,
      "explicacion": str,
      "tiene_arl": bool
    }}
  ],
  "criterios_busqueda": {{ "urgencia": str, "oficio_id": int }},
  "explicacion_algoritmo": str,
  "confianza_recomendaciones": float
}}

Reglas:
- Solo incluir trabajadores que manejen el oficio requerido.
- Máximo 5 recomendaciones, ordenadas por score descendente.
- Scores realistas: pocos trabajadores deberían tener >0.9.
- Explicaciones específicas y accionables (no genéricas).
- Precios propuestos basados en tarifas del trabajador y complejidad inferida.
"""

    user_message = f"""Encuentra los mejores trabajadores para esta solicitud:

Oficio requerido: {id_oficio}
Urgencia: {urgencia}
Descripción del trabajo: {descripcion_normalizada}

Analiza todos los trabajadores disponibles y recomienda los TOP 5 más apropiados."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=user_message,
            config={
                "system_instruction": system_instruction,
                "response_modalities": ["TEXT"],
                "temperature": 0.3,  # Algo de variabilidad en recomendaciones
            }
        )
    except Exception as e:
        raise ValueError(f"Error al llamar a Gemini (recomendador): {str(e)}")

    if not response.candidates:
        raise ValueError("Recomendador: no se recibió respuesta del modelo")

    candidate = response.candidates[0]
    text_parts = [getattr(p, 'text', '') for p in getattr(candidate, 'content', {}).parts or []]
    text = " ".join([t for t in text_parts if t]).strip()

    if not text:
        raise ValueError("Recomendador: la respuesta no contiene texto JSON")

    # Parsear JSON
    import json
    try:
        parsed = json.loads(text)
    except Exception:
        import re
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                parsed = json.loads(match.group(0))
            except Exception as e:
                raise ValueError(f"Recomendador: no se pudo parsear JSON. Texto: {text[:500]}...") from e
        else:
            raise ValueError(f"Recomendador: no se encontró JSON. Texto: {text[:500]}...")

    try:
        recomendacion = RecomendacionOutput(**parsed)
        return recomendacion
    except Exception as e:
        raise ValueError(f"Recomendador: error creando RecomendacionOutput: {str(e)} | parsed={parsed}")


async def detectar_alertas(
    analisis: "AnalisisOutput",
    recomendaciones: "RecomendacionOutput" = None,
    contexto_adicional: str = ""
) -> AlertaOutput:
    """
    Agente Detector de Alertas: identifica anomalías, riesgos y patrones sospechosos.
    
    Args:
        analisis: Resultado del análisis inicial de la solicitud
        recomendaciones: Recomendaciones de trabajadores (opcional)
        contexto_adicional: Información adicional para evaluación
    
    Returns:
        AlertaOutput: Lista de alertas detectadas con severidad y acciones recomendadas
    """

    # Preparar datos para el análisis
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

    system_instruction = f"""Eres 'TaskPro Guardian', un agente de seguridad especializado en detectar anomalías y riesgos.

Objetivo:
- Evaluar solicitudes, precios y recomendaciones en busca de patrones anómalos.
- Detectar posibles fraudes, riesgos de seguridad, precios fuera de rango.
- Clasificar alertas por severidad: 'baja' | 'media' | 'alta' | 'critica'.
- Proponer acciones específicas para mitigar riesgos.

Tipos de alertas a buscar:
1. PRECIO_ANOMALO: Precios muy por encima/debajo del mercado
2. RIESGO_SEGURIDAD: Trabajos peligrosos, horarios nocturnos, ubicaciones riesgosas
3. PATRON_SOSPECHOSO: Lenguaje agresivo, urgencia artificial, datos inconsistentes
4. CALIDAD_BAJA: Trabajadores con baja calificación para trabajos críticos
5. DISPONIBILIDAD_DUDOSA: Múltiples trabajadores "disponibles" simultáneamente

Severidades:
- CRITICA: Bloquea la transacción automáticamente
- ALTA: Requiere revisión manual inmediata
- MEDIA: Advierte al usuario antes de proceder
- BAJA: Log para auditoría posterior

Datos a evaluar:
Solicitud: {solicitud_data}
Recomendaciones: {recomendaciones_data}
Contexto adicional: {contexto_adicional}

Formato JSON estricto:
{{
  "alertas_detectadas": [
    {{
      "tipo_alerta": str,
      "severidad": str,
      "detalle": str,
      "entidad_afectada": str,
      "id_entidad": int | null,
      "accion_recomendada": str
    }}
  ],
  "score_riesgo_general": float,
  "requiere_revision_manual": bool,
  "explicacion_evaluacion": str
}}

Reglas:
- Solo incluir alertas con evidencia concreta.
- Ser específico en los detalles (no genérico).
- Score de riesgo: 0.0 = seguro, 1.0 = máximo riesgo.
- Revisión manual si score > 0.7 o hay alertas críticas/altas.
"""

    user_message = "Evalúa esta solicitud y recomendaciones en busca de riesgos y anomalías."

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=user_message,
            config={
                "system_instruction": system_instruction,
                "response_modalities": ["TEXT"],
                "temperature": 0.1,  # Muy conservador para seguridad
            }
        )
    except Exception as e:
        raise ValueError(f"Error al llamar a Gemini (detector alertas): {str(e)}")

    if not response.candidates:
        raise ValueError("Detector alertas: no se recibió respuesta del modelo")

    candidate = response.candidates[0]
    text_parts = [getattr(p, 'text', '') for p in getattr(candidate, 'content', {}).parts or []]
    text = " ".join([t for t in text_parts if t]).strip()

    if not text:
        raise ValueError("Detector alertas: la respuesta no contiene texto JSON")

    # Parsear JSON
    import json
    try:
        parsed = json.loads(text)
    except Exception:
        import re
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                parsed = json.loads(match.group(0))
            except Exception as e:
                raise ValueError(f"Detector alertas: no se pudo parsear JSON. Texto: {text[:500]}...") from e
        else:
            raise ValueError(f"Detector alertas: no se encontró JSON. Texto: {text[:500]}...")

    try:
        alertas = AlertaOutput(**parsed)
        return alertas
    except Exception as e:
        raise ValueError(f"Detector alertas: error creando AlertaOutput: {str(e)} | parsed={parsed}")


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
    
    Args:
        texto_usuario: Texto original del usuario
        oficios_disponibles: Catálogo de oficios formateado
        trabajadores_disponibles: Base de trabajadores formateada
        id_barrio_usuario: Ubicación del usuario (opcional)
    
    Returns:
        ProcesamientoCompletoOutput: Resultado completo del pipeline A2A
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
        
        import re
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

