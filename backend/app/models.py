"""
models.py - Schemas Pydantic para validación de entrada/salida de API

Contiene los modelos Pydantic utilizados para validar requests y responses
de los endpoints FastAPI. Los modelos SQLAlchemy están en database.py.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# =========================
# SCHEMAS PYDANTIC PARA API
# =========================

# Schema Pydantic para el input del endpoint (solo recibe texto del usuario)
class SolicitudInput(BaseModel):
    texto_usuario: str


# Schema Pydantic para el output (respuesta con la solicitud creada)
class SolicitudOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id_solicitud: int
    id_solicitante: Optional[int] = None
    id_oficio: Optional[int] = None
    descripcion_usuario: Optional[str] = None
    urgencia: Optional[str] = None
    id_barrio_servicio: Optional[int] = None
    fecha_creacion: Optional[datetime] = None
    estado: str = 'pendiente'
    precio_estimado_mercado: float = 0.0
    flag_alerta: bool = False


# Schemas para análisis previo (A2A - Agente Analista)
class AnalisisInput(BaseModel):
    """Entrada para el analizador: texto en lenguaje natural del usuario."""
    texto_usuario: str


class AnalisisOutput(BaseModel):
    """Salida del analizador con trazabilidad y banderas de seguridad."""
    texto_usuario_original: str
    id_oficio_sugerido: Optional[int] = None
    nombre_oficio_sugerido: Optional[str] = None
    urgencia_inferida: Optional[str] = None  # 'baja' | 'media' | 'alta'
    descripcion_normalizada: Optional[str] = None
    precio_mercado_estimado: Optional[float] = None
    explicacion: Optional[str] = None
    senales_alerta: list[str] = []
    necesita_aclaraciones: bool = False
    preguntas_aclaratorias: list[str] = []
    confianza: Optional[float] = None  # 0.0 - 1.0


# Schemas para agente recomendador
class TrabajadorRecomendado(BaseModel):
    """Un trabajador individual recomendado con su score y explicación."""
    id_trabajador: int
    nombre_completo: str
    score_relevancia: float  # 0.0 - 1.0
    distancia_km: float
    motivo_top: str  # 'experiencia' | 'proximidad' | 'precio' | 'calificacion'
    precio_propuesto: int
    anos_experiencia: int
    calificacion_promedio: float
    explicacion: str
    tiene_arl: bool


class RecomendacionOutput(BaseModel):
    """Salida del agente recomendador con lista priorizada de trabajadores."""
    id_solicitud: Optional[int] = None
    total_candidatos_encontrados: int
    trabajadores_recomendados: list[TrabajadorRecomendado] = []
    criterios_busqueda: dict = {}
    explicacion_algoritmo: str
    confianza_recomendaciones: float  # 0.0 - 1.0


# Schemas para agente detector de alertas
class AlertaDetectada(BaseModel):
    """Una alerta individual detectada por el sistema."""
    tipo_alerta: str  # 'precio_anomalo' | 'riesgo_seguridad' | 'patron_sospechoso'
    severidad: str  # 'baja' | 'media' | 'alta' | 'critica'
    detalle: str
    entidad_afectada: str  # 'solicitud' | 'trabajador' | 'recomendacion'
    id_entidad: Optional[int] = None
    accion_recomendada: str


class AlertaOutput(BaseModel):
    """Salida del detector de alertas con todas las anomalías encontradas."""
    alertas_detectadas: list[AlertaDetectada] = []
    score_riesgo_general: float  # 0.0 - 1.0
    requiere_revision_manual: bool
    explicacion_evaluacion: str


# Schema para el flujo completo A2A
class ProcesamientoCompletoInput(BaseModel):
    """Entrada para el procesamiento completo A2A: solo el texto del usuario."""
    texto_usuario: str
    id_barrio_usuario: Optional[int] = None  # OPCIONAL: No es necesario, se detecta del texto


class ProcesamientoCompletoOutput(BaseModel):
    """Salida del procesamiento completo A2A con todo el pipeline ejecutado."""
    # Resultados del análisis inicial
    analisis: AnalisisOutput
    
    # ID de la solicitud creada (si se decidió crearla)
    solicitud_creada: Optional[SolicitudOutput] = None
    
    # Recomendaciones de trabajadores
    recomendaciones: Optional[RecomendacionOutput] = None
    
    # Alertas detectadas
    alertas: AlertaOutput
    
    # Meta-información del procesamiento
    tiempo_procesamiento_ms: int
    agentes_ejecutados: list[str] = []
    decision_final: str  # 'solicitud_creada' | 'requiere_aclaraciones' | 'bloqueada_por_alertas'
    mensaje_usuario: str


