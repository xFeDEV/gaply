"""
database.py - Modelos SQLAlchemy y configuración de base de datos para TaskPro

Contiene todos los modelos ORM que representan las tablas del esquema relacional,
incluyendo maestros (ciudades, barrios, oficios), usuarios (solicitantes, trabajadores)
y operación (solicitudes, recomendaciones, servicios, calificaciones, alertas, logs).

Basado en el esquema TaskPro para PostgreSQL/MySQL/SQL Server.
"""

import os
from datetime import datetime, date
from pathlib import Path
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Numeric,
    create_engine,
    CheckConstraint,
    UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Cargar variables de entorno desde .env
try:
    from dotenv import load_dotenv
    # Buscar el archivo .env en la raíz del proyecto
    env_path = Path(__file__).parent.parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    print("⚠️  python-dotenv no instalado. Asegúrate de exportar las variables manualmente.")

# Leer la variable de entorno DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("La variable de entorno DATABASE_URL no está configurada")

# Normalizar URL: si se pasó un driver asíncrono (asyncpg), forzar driver síncrono
# para el uso actual con SQLAlchemy ORM sin AsyncSession, evitando MissingGreenlet.
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    print("⚠️  DATABASE_URL usa 'asyncpg' pero el ORM está en modo síncrono. Cambiando a 'psycopg2'.")
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)

# Crear el motor de la base de datos (sincrónico)
engine = create_engine(DATABASE_URL, echo=True)

# Crear la SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear la Base
Base = declarative_base()


# =========================
# MAESTROS
# =========================

class Ciudad(Base):
    """Tabla de ciudades con información geográfica base."""
    __tablename__ = "ciudades"
    __table_args__ = {'schema': 'public'}
    
    id_ciudad = Column(Integer, primary_key=True)
    nombre_ciudad = Column(String(80), nullable=False)
    departamento = Column(String(80), nullable=False)
    region = Column(String(40), nullable=False)
    codigo_postal_base = Column(Integer, nullable=False)
    
    # Relaciones
    barrios = relationship("Barrio", back_populates="ciudad")


class Barrio(Base):
    """Tabla de barrios asociados a ciudades, con estrato socioeconómico."""
    __tablename__ = "barrios"
    __table_args__ = {'schema': 'public'}
    
    id_barrio = Column(Integer, primary_key=True)
    id_ciudad = Column(Integer, ForeignKey("public.ciudades.id_ciudad"), nullable=False)
    nombre_barrio = Column(String(100), nullable=False)
    estrato = Column(Integer, nullable=False)
    
    # Relaciones
    ciudad = relationship("Ciudad", back_populates="barrios")
    solicitantes = relationship("Solicitante", back_populates="barrio")
    trabajadores = relationship("Trabajador", back_populates="barrio")
    solicitudes = relationship("Solicitud", back_populates="barrio_servicio")


class Oficio(Base):
    """Catálogo de oficios/servicios técnicos disponibles."""
    __tablename__ = "oficios"
    __table_args__ = {'schema': 'public'}
    
    id_oficio = Column(Integer, primary_key=True)
    nombre_oficio = Column(String(100), nullable=False, unique=True)
    categoria_servicio = Column(String(60), nullable=False)
    descripcion = Column(String(300), nullable=True)
    
    # Relaciones
    solicitudes = relationship("Solicitud", back_populates="oficio")
    tarifas_mercado = relationship("TarifaMercado", back_populates="oficio")
    trabajador_oficios = relationship("TrabajadorOficio", back_populates="oficio")


# =========================
# USUARIOS
# =========================

class Solicitante(Base):
    """Usuarios que solicitan servicios técnicos."""
    __tablename__ = "solicitantes"
    __table_args__ = {'schema': 'public'}
    
    id_solicitante = Column(Integer, primary_key=True)
    nombre_completo = Column(String(150), nullable=False)
    cedula = Column(String(20), nullable=False, unique=True)
    telefono = Column(String(20), nullable=False)
    email = Column(String(150), nullable=True, unique=True)
    id_barrio = Column(Integer, ForeignKey("public.barrios.id_barrio"), nullable=False)
    direccion = Column(String(120), nullable=False)
    acepta_habeas = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(Date, nullable=False)
    
    # Relaciones
    barrio = relationship("Barrio", back_populates="solicitantes")
    solicitudes = relationship("Solicitud", back_populates="solicitante")


class Trabajador(Base):
    """Profesionales/técnicos que ofrecen servicios."""
    __tablename__ = "trabajadores"
    __table_args__ = (
        CheckConstraint('calificacion_promedio >= 1 AND calificacion_promedio <= 5', name='ck_trabajadores_rating'),
        {'schema': 'public'}
    )
    
    id_trabajador = Column(Integer, primary_key=True)
    nombre_completo = Column(String(150), nullable=False)
    identificacion = Column(String(20), nullable=False, unique=True)
    tipo_persona = Column(String(20), nullable=False)
    telefono = Column(String(20), nullable=False)
    email = Column(String(150), nullable=True, unique=True)
    id_barrio = Column(Integer, ForeignKey("public.barrios.id_barrio"), nullable=False)
    direccion = Column(String(120), nullable=False)
    anos_experiencia = Column(Integer, nullable=False)
    calificacion_promedio = Column(Numeric(3, 2), nullable=False)
    disponibilidad = Column(String(15), nullable=False)
    cobertura_km = Column(Integer, nullable=False)
    tiene_arl = Column(Boolean, nullable=False, default=False)
    fecha_registro = Column(Date, nullable=False)
    
    # Relaciones
    barrio = relationship("Barrio", back_populates="trabajadores")
    trabajador_oficios = relationship("TrabajadorOficio", back_populates="trabajador")
    recomendaciones = relationship("Recomendacion", back_populates="trabajador")
    servicios = relationship("Servicio", back_populates="trabajador")


class TrabajadorOficio(Base):
    """Relación muchos a muchos entre trabajadores y oficios, con tarifas."""
    __tablename__ = "trabajador_oficio"
    __table_args__ = (
        UniqueConstraint('id_trabajador', 'id_oficio', name='uq_to'),
        {'schema': 'public'}
    )
    
    id_trab_oficio = Column(Integer, primary_key=True)
    id_trabajador = Column(Integer, ForeignKey("public.trabajadores.id_trabajador"), nullable=False)
    id_oficio = Column(Integer, ForeignKey("public.oficios.id_oficio"), nullable=False)
    tarifa_hora_promedio = Column(Integer, nullable=False)
    tarifa_visita = Column(Integer, nullable=False)
    certificaciones = Column(String(120), nullable=True)
    
    # Relaciones
    trabajador = relationship("Trabajador", back_populates="trabajador_oficios")
    oficio = relationship("Oficio", back_populates="trabajador_oficios")


class TarifaMercado(Base):
    """Rangos de precios de mercado por oficio y ciudad."""
    __tablename__ = "tarifas_mercado"
    __table_args__ = {'schema': 'public'}
    
    id_tarifa = Column(Integer, primary_key=True)
    id_oficio = Column(Integer, ForeignKey("public.oficios.id_oficio"), nullable=False)
    ciudad = Column(String(80), nullable=False)
    precio_min = Column(Integer, nullable=False)
    precio_max = Column(Integer, nullable=False)
    fuente = Column(String(120), nullable=False)
    
    # Relaciones
    oficio = relationship("Oficio", back_populates="tarifas_mercado")


# =========================
# OPERACIÓN
# =========================

class Solicitud(Base):
    """Solicitudes de servicio creadas por solicitantes."""
    __tablename__ = "solicitudes"
    __table_args__ = {'schema': 'public'}
    
    id_solicitud = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    id_solicitante = Column(Integer, ForeignKey("public.solicitantes.id_solicitante"), nullable=False)
    id_oficio = Column(Integer, ForeignKey("public.oficios.id_oficio"), nullable=False)
    descripcion_usuario = Column(String(400), nullable=False)
    urgencia = Column(String(10), nullable=False)
    id_barrio_servicio = Column(Integer, ForeignKey("public.barrios.id_barrio"), nullable=False)
    fecha_creacion = Column(DateTime, nullable=False, default=datetime.utcnow)
    estado = Column(String(15), nullable=False, default='pendiente')
    precio_estimado_mercado = Column(Integer, nullable=False)
    flag_alerta = Column(Boolean, nullable=False, default=False)
    
    # Relaciones
    solicitante = relationship("Solicitante", back_populates="solicitudes")
    oficio = relationship("Oficio", back_populates="solicitudes")
    barrio_servicio = relationship("Barrio", back_populates="solicitudes")
    recomendaciones = relationship("Recomendacion", back_populates="solicitud")
    servicios = relationship("Servicio", back_populates="solicitud")
    alertas = relationship("Alerta", back_populates="solicitud")
    logs_clasificacion = relationship("ClasificacionLog", back_populates="solicitud")


class Recomendacion(Base):
    """Recomendaciones de trabajadores para solicitudes específicas."""
    __tablename__ = "recomendaciones"
    __table_args__ = {'schema': 'public'}
    
    id_recomendacion = Column(Integer, primary_key=True)
    id_solicitud = Column(Integer, ForeignKey("public.solicitudes.id_solicitud"), nullable=False)
    id_trabajador = Column(Integer, ForeignKey("public.trabajadores.id_trabajador"), nullable=False)
    score_relevancia = Column(Numeric(4, 3), nullable=False)
    distancia_km = Column(Numeric(5, 2), nullable=False)
    motivo_top = Column(String(20), nullable=False)
    precio_estimado = Column(Integer, nullable=False)
    precio_propuesto = Column(Integer, nullable=False)
    explicacion = Column(String(500), nullable=True)
    es_asignado = Column(Boolean, nullable=False, default=False)
    
    # Relaciones
    solicitud = relationship("Solicitud", back_populates="recomendaciones")
    trabajador = relationship("Trabajador", back_populates="recomendaciones")
    alertas = relationship("Alerta", back_populates="recomendacion")


class Servicio(Base):
    """Servicios asignados y ejecutados."""
    __tablename__ = "servicios"
    __table_args__ = {'schema': 'public'}
    
    id_servicio = Column(Integer, primary_key=True)
    id_solicitud = Column(Integer, ForeignKey("public.solicitudes.id_solicitud"), nullable=False)
    id_trabajador = Column(Integer, ForeignKey("public.trabajadores.id_trabajador"), nullable=False)
    fecha_asignacion = Column(DateTime, nullable=False)
    fecha_cierre = Column(DateTime, nullable=True)
    costo_final_cop = Column(Integer, nullable=False)
    aplica_iva = Column(Boolean, nullable=False, default=False)
    valor_iva_cop = Column(Integer, nullable=False, default=0)
    retencion_fuente_cop = Column(Integer, nullable=False, default=0)
    estado = Column(String(15), nullable=False)
    
    # Relaciones
    solicitud = relationship("Solicitud", back_populates="servicios")
    trabajador = relationship("Trabajador", back_populates="servicios")
    calificaciones = relationship("Calificacion", back_populates="servicio")


class Calificacion(Base):
    """Calificaciones de servicios (por solicitante o trabajador)."""
    __tablename__ = "calificaciones"
    __table_args__ = (
        CheckConstraint('puntaje >= 1 AND puntaje <= 5', name='ck_cal_puntaje'),
        {'schema': 'public'}
    )
    
    id_calificacion = Column(Integer, primary_key=True)
    id_servicio = Column(Integer, ForeignKey("public.servicios.id_servicio"), nullable=False)
    quien_califica = Column(String(15), nullable=False)
    puntaje = Column(Numeric(2, 1), nullable=False)
    comentario = Column(String(500), nullable=True)
    fecha = Column(Date, nullable=False)
    
    # Relaciones
    servicio = relationship("Servicio", back_populates="calificaciones")


class Alerta(Base):
    """Alertas generadas por el sistema (precios anómalos, riesgos, etc.)."""
    __tablename__ = "alertas"
    __table_args__ = {'schema': 'public'}
    
    id_alerta = Column(Integer, primary_key=True)
    id_solicitud = Column(Integer, ForeignKey("public.solicitudes.id_solicitud"), nullable=True)
    id_recomendacion = Column(Integer, ForeignKey("public.recomendaciones.id_recomendacion"), nullable=True)
    tipo_alerta = Column(String(30), nullable=False)
    severidad = Column(String(10), nullable=False)
    detalle = Column(String(400), nullable=False)
    fecha = Column(Date, nullable=False)
    
    # Relaciones
    solicitud = relationship("Solicitud", back_populates="alertas")
    recomendacion = relationship("Recomendacion", back_populates="alertas")


class ClasificacionLog(Base):
    """Logs de clasificación de solicitudes por el modelo IA."""
    __tablename__ = "clasificacion_logs"
    __table_args__ = {'schema': 'public'}
    
    id_log = Column(Integer, primary_key=True)
    id_solicitud = Column(Integer, ForeignKey("public.solicitudes.id_solicitud"), nullable=False)
    texto_original = Column(String(500), nullable=False)
    id_oficio_predicho = Column(Integer, ForeignKey("public.oficios.id_oficio"), nullable=False)
    confianza = Column(Numeric(4, 3), nullable=False)
    modelo_version = Column(String(40), nullable=False)
    
    # Relaciones
    solicitud = relationship("Solicitud", back_populates="logs_clasificacion")
    oficio_predicho = relationship("Oficio")


# Función de utilidad para obtener una sesión de base de datos
def get_db():
    """Dependencia FastAPI para obtener sesiones de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
