import os
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column, 
    Integer, 
    String, 
    Float, 
    Boolean, 
    DateTime, 
    ForeignKey,
    create_engine
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel, ConfigDict

# Leer la variable de entorno DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("La variable de entorno DATABASE_URL no está configurada")

# Crear el motor de la base de datos
engine = create_engine(DATABASE_URL, echo=True)

# Crear la SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear la Base
Base = declarative_base()


# Modelo SQLAlchemy para la tabla public.oficios
class Oficio(Base):
    __tablename__ = "oficios"
    __table_args__ = {'schema': 'public'}
    
    id_oficio = Column(Integer, primary_key=True)
    nombre_oficio = Column(String)
    categoria_servicio = Column(String)
    descripcion = Column(String)


# Modelo SQLAlchemy para la tabla public.solicitudes
class Solicitud(Base):
    __tablename__ = "solicitudes"
    __table_args__ = {'schema': 'public'}
    
    id_solicitud = Column(Integer, primary_key=True, autoincrement=True)
    id_solicitante = Column(Integer)
    id_oficio = Column(Integer, ForeignKey("public.oficios.id_oficio"))
    descripcion_usuario = Column(String)
    urgencia = Column(String)
    id_barrio_servicio = Column(Integer)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    estado = Column(String, default='pendiente')
    precio_estimado_mercado = Column(Float, default=0.0)
    flag_alerta = Column(Boolean, default=False)


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


# Función de utilidad para obtener una sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

