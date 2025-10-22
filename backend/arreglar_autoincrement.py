"""
Script para verificar y arreglar la secuencia auto-increment de la tabla solicitudes
"""
import os
import psycopg2
from pathlib import Path

# Cargar variables de entorno desde .env
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    with open(env_path, 'r') as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

# Obtener URL de la base de datos y convertir de asyncpg a psycopg2
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise ValueError("No se encontró DATABASE_URL en las variables de entorno")

# Convertir URL de asyncpg a psycopg2
if database_url.startswith("postgresql+asyncpg://"):
    database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")

print(f"🔗 Conectando a: {database_url}")

try:
    # Conectar a la base de datos
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    print("🔍 Verificando estructura de la tabla solicitudes...")
    
    # Verificar si la tabla existe y su estructura
    cursor.execute("""
        SELECT column_name, column_default, is_nullable, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'solicitudes' AND table_schema = 'public'
        ORDER BY ordinal_position;
    """)
    
    columnas = cursor.fetchall()
    
    if not columnas:
        print("❌ La tabla 'solicitudes' no existe")
        print("🔧 Creando tabla solicitudes...")
        
        # Crear tabla con secuencia auto-increment
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS public.solicitudes (
                id_solicitud SERIAL PRIMARY KEY,
                id_solicitante INTEGER NOT NULL REFERENCES public.solicitantes(id_solicitante),
                id_oficio INTEGER NOT NULL REFERENCES public.oficios(id_oficio),
                descripcion_usuario VARCHAR(400) NOT NULL,
                urgencia VARCHAR(10) NOT NULL,
                id_barrio_servicio INTEGER NOT NULL REFERENCES public.barrios(id_barrio),
                fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                estado VARCHAR(15) NOT NULL DEFAULT 'pendiente',
                precio_estimado_mercado INTEGER NOT NULL DEFAULT 0,
                flag_alerta BOOLEAN NOT NULL DEFAULT FALSE
            );
        """)
        
        conn.commit()
        print("✅ Tabla solicitudes creada con SERIAL (auto-increment)")
        
    else:
        print("✅ Tabla solicitudes encontrada:")
        for col in columnas:
            print(f"   - {col[0]}: {col[3]} (default: {col[1]}, nullable: {col[2]})")
        
        # Verificar si id_solicitud tiene secuencia
        cursor.execute("""
            SELECT column_default 
            FROM information_schema.columns 
            WHERE table_name = 'solicitudes' 
            AND column_name = 'id_solicitud' 
            AND table_schema = 'public';
        """)
        
        default_value = cursor.fetchone()[0]
        print(f"🔍 id_solicitud default: {default_value}")
        
        if not default_value or 'nextval' not in str(default_value):
            print("❌ La columna id_solicitud NO tiene secuencia auto-increment")
            print("🔧 Arreglando secuencia...")
            
            # Crear secuencia si no existe
            cursor.execute("""
                CREATE SEQUENCE IF NOT EXISTS public.solicitudes_id_solicitud_seq
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;
            """)
            
            # Asociar la secuencia a la columna
            cursor.execute("""
                ALTER TABLE public.solicitudes 
                ALTER COLUMN id_solicitud 
                SET DEFAULT nextval('public.solicitudes_id_solicitud_seq'::regclass);
            """)
            
            # Asegurar que la secuencia es propiedad de la columna
            cursor.execute("""
                ALTER SEQUENCE public.solicitudes_id_solicitud_seq 
                OWNED BY public.solicitudes.id_solicitud;
            """)
            
            # Actualizar el valor actual de la secuencia basándose en registros existentes
            cursor.execute("""
                SELECT setval('public.solicitudes_id_solicitud_seq', 
                    COALESCE((SELECT MAX(id_solicitud) FROM public.solicitudes), 0) + 1, 
                    false);
            """)
            
            conn.commit()
            print("✅ Secuencia auto-increment configurada correctamente")
            
        else:
            print("✅ id_solicitud ya tiene secuencia auto-increment configurada")
    
    # Verificar el estado final
    cursor.execute("""
        SELECT column_default 
        FROM information_schema.columns 
        WHERE table_name = 'solicitudes' 
        AND column_name = 'id_solicitud' 
        AND table_schema = 'public';
    """)
    
    final_default = cursor.fetchone()[0]
    print(f"🎯 Estado final - id_solicitud default: {final_default}")
    
    # Probar inserción
    print("\n🧪 Probando inserción de prueba...")
    cursor.execute("""
        INSERT INTO public.solicitudes 
        (id_solicitante, id_oficio, descripcion_usuario, urgencia, id_barrio_servicio, 
         fecha_creacion, estado, precio_estimado_mercado, flag_alerta)
        VALUES (1, 1, 'Prueba auto-increment', 'baja', 1, CURRENT_TIMESTAMP, 'pendiente', 0, FALSE)
        RETURNING id_solicitud;
    """)
    
    nuevo_id = cursor.fetchone()[0]
    print(f"✅ Inserción exitosa - Nuevo ID generado: {nuevo_id}")
    
    # Eliminar el registro de prueba
    cursor.execute("DELETE FROM public.solicitudes WHERE id_solicitud = %s", (nuevo_id,))
    conn.commit()
    print(f"🧹 Registro de prueba eliminado")
    
    print("\n🎉 ¡Tabla solicitudes lista para usar con auto-increment!")

except Exception as e:
    print(f"❌ Error: {e}")
    if 'conn' in locals():
        conn.rollback()
finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()