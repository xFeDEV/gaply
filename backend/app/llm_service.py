import os
from typing import Literal, Annotated
from google import genai
from google.genai.types import HttpOptions
from pydantic import BaseModel, Field
from models import AnalisisOutput  # Importación absoluta para ejecución dentro de /app


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

