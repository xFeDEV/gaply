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


# Schemas para listado de trabajadores



class OficioInfo(BaseModel):


    """Información básica de un oficio que domina un trabajador."""


    id_oficio: int


    nombre_oficio: str


    tarifa_hora_promedio: int


    tarifa_visita: int


    certificaciones: Optional[str] = None








class BarrioInfo(BaseModel):


    """Información del barrio y ciudad de un trabajador."""


    id_barrio: int


    nombre_barrio: str


    estrato: int


    ciudad: str


    departamento: str


    region: str








class TrabajadorListItem(BaseModel):


    """Información de un trabajador en el listado con todos sus detalles."""


    model_config = ConfigDict(from_attributes=True)


    


    id_trabajador: int


    nombre_completo: str


    telefono: str


    email: Optional[str] = None


    anos_experiencia: int


    calificacion_promedio: float


    disponibilidad: str


    cobertura_km: int


    tiene_arl: bool


    tipo_persona: str


    


    # Información de ubicación


    barrio: BarrioInfo


    


    # Oficios que domina


    oficios: list[OficioInfo] = []








class TrabajadorListResponse(BaseModel):


    """Respuesta del endpoint de listado de trabajadores con metadatos."""


    total: int


    trabajadores: list[TrabajadorListItem] = []


    filtros_aplicados: dict = {}








# Schemas para endpoints de filtros coordinados


class CiudadOption(BaseModel):


    """Opción de ciudad para select."""


    id_ciudad: int


    nombre_ciudad: str


    departamento: str


    region: str


    total_trabajadores: int  # Cantidad de trabajadores disponibles en esta ciudad








class CiudadesResponse(BaseModel):


    """Respuesta del endpoint de ciudades."""


    total: int


    ciudades: list[CiudadOption] = []








class OficioOption(BaseModel):


    """Opción de oficio para select."""


    id_oficio: int


    nombre_oficio: str


    categoria_servicio: str


    descripcion: Optional[str] = None


    total_trabajadores: int  # Cantidad de trabajadores que ofrecen este oficio








class OficiosResponse(BaseModel):


    """Respuesta del endpoint de oficios."""


    total: int


    oficios: list[OficioOption] = []








class FiltrosDisponibles(BaseModel):


    """Opciones disponibles para los filtros según el contexto actual."""


    ciudades_disponibles: list[CiudadOption] = []


    oficios_disponibles: list[OficioOption] = []


    calificacion_min_sugerida: float = 1.0


    calificacion_max_disponible: float = 5.0


    disponibilidades: list[str] = []


    tiene_arl_count: dict = {"con_arl": 0, "sin_arl": 0}








# Schemas para perfil de trabajador


class ServicioRealizado(BaseModel):


    """Información de un servicio realizado por el trabajador."""


    id_servicio: int


    id_solicitud: int


    fecha_asignacion: str


    fecha_cierre: Optional[str] = None


    costo_final_cop: int


    estado: str


    descripcion_solicitud: str


    urgencia: str


    oficio: str


    ubicacion: str


    solicitante_nombre: str








class CalificacionRecibida(BaseModel):


    """Calificación recibida por un servicio."""


    id_calificacion: int


    id_servicio: int


    puntaje: float


    comentario: Optional[str] = None


    fecha: str


    quien_califica: str


    descripcion_servicio: str








class EstadisticasTrabajador(BaseModel):


    """Estadísticas generales del trabajador."""


    total_servicios: int


    servicios_completados: int


    servicios_en_proceso: int


    total_calificaciones: int


    promedio_calificacion: float


    total_ingresos: int








class PerfilTrabajador(BaseModel):


    """Perfil completo del trabajador con toda su información."""


    # Datos básicos


    id_trabajador: int


    nombre_completo: str


    identificacion: str


    tipo_persona: str


    telefono: str


    email: Optional[str] = None


    anos_experiencia: int


    calificacion_promedio: float


    disponibilidad: str


    cobertura_km: int


    tiene_arl: bool


    fecha_registro: str


    


    # Ubicación


    barrio: BarrioInfo


    


    # Oficios que domina


    oficios: list[OficioInfo] = []


    


    # Estadísticas


    estadisticas: EstadisticasTrabajador


    


    # Servicios realizados


    servicios_realizados: list[ServicioRealizado] = []


    


    # Calificaciones recibidas


    calificaciones_recibidas: list[CalificacionRecibida] = []