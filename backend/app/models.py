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


