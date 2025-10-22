from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# URL de conexión (reemplaza ${VPS_IP} por la IP real de tu servidor)
DATABASE_URL = "postgresql+asyncpg://admin:supersecret123@20.57.33.149:5432/gaply"

# Crea el motor asíncrono
engine = create_async_engine(DATABASE_URL, echo=True)

# Crea la fábrica de sesiones asíncronas
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)

# Base para los modelos
Base = declarative_base()
