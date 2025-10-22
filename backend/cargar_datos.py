"""
Script para cargar datos mínimos usando Python y las variables de entorno
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

# SQL para datos mínimos
sql_datos_minimos = """
-- Limpiar tablas existentes
TRUNCATE TABLE IF EXISTS clasificacion_logs, alertas, calificaciones, servicios, 
             recomendaciones, solicitudes, tarifas_mercado, trabajador_oficio, 
             trabajadores, solicitantes, oficios, barrios, ciudades 
RESTART IDENTITY CASCADE;

-- CIUDADES
INSERT INTO ciudades (id_ciudad, nombre_ciudad, departamento, region, codigo_postal_base) VALUES
(1, 'Bogotá D.C.', 'Cundinamarca', 'Andina', 110000);

-- BARRIOS
INSERT INTO barrios (id_barrio, id_ciudad, nombre_barrio, estrato) VALUES
(1, 1, 'Chapinero', 4),
(2, 1, 'Usaquén', 5);

-- OFICIOS
INSERT INTO oficios (id_oficio, nombre_oficio, categoria_servicio, descripcion) VALUES
(1, 'Plomero', 'Hogar', 'Instalación y reparación de tuberías, desagües, llaves y sistemas hidráulicos'),
(2, 'Electricista', 'Hogar', 'Instalación y reparación de sistemas eléctricos residenciales'),
(3, 'Cerrajero', 'Seguridad', 'Apertura de puertas, cambio de cerraduras, duplicado de llaves'),
(4, 'Técnico de Aires Acondicionados', 'Hogar', 'Instalación, mantenimiento y reparación de aire acondicionado'),
(5, 'Técnico de Refrigeración', 'Hogar', 'Reparación y mantenimiento de neveras y congeladores');

-- SOLICITANTES (María)
INSERT INTO solicitantes (id_solicitante, nombre_completo, cedula, telefono, email, id_barrio, direccion, acepta_habeas, fecha_registro) VALUES
(1, 'María González Pérez', '1012345678', '3101234567', 'maria.gonzalez@email.com', 1, 'Calle 63 #10-20 Apto 301', TRUE, '2024-01-15');

-- TRABAJADORES (Carlos y otros)
INSERT INTO trabajadores (id_trabajador, nombre_completo, identificacion, tipo_persona, telefono, email, id_barrio, direccion, anos_experiencia, calificacion_promedio, disponibilidad, cobertura_km, tiene_arl, fecha_registro) VALUES
(1, 'Carlos Mendoza Ruiz', '1098765432', 'natural', '3201234567', 'carlos.plomero@email.com', 2, 'Calle 85 #12-34 Apto 102', 12, 4.8, 'disponible', 15, TRUE, '2023-03-15'),
(2, 'Andrés Felipe Castro', '1087654321', 'natural', '3212345678', 'andres.plomero@email.com', 1, 'Carrera 128 #95-20', 8, 4.5, 'disponible', 12, TRUE, '2023-06-20'),
(3, 'Roberto Gómez López', '1065432109', 'natural', '3234567890', 'roberto.electricista@email.com', 1, 'Carrera 11 #65-40', 10, 4.7, 'disponible', 20, TRUE, '2023-01-25');

-- TRABAJADOR_OFICIO (especialidades y tarifas)
INSERT INTO trabajador_oficio (id_trab_oficio, id_trabajador, id_oficio, tarifa_hora_promedio, tarifa_visita, certificaciones) VALUES
(1, 1, 1, 35000, 25000, 'SENA Instalaciones Hidráulicas, Curso Soldadura SMAW'),
(2, 2, 1, 28000, 20000, 'SENA Sistemas Hidráulicos'),
(3, 3, 2, 38000, 28000, 'SENA Electricidad Residencial, RETIE vigente');

-- TARIFAS MERCADO
INSERT INTO tarifas_mercado (id_tarifa, id_oficio, ciudad, precio_min, precio_max, fuente) VALUES
(1, 1, 'Bogotá D.C.', 50000, 150000, 'Encuesta mercado 2024'),
(2, 2, 'Bogotá D.C.', 60000, 180000, 'Encuesta mercado 2024');
"""

try:
    # Conectar a la base de datos
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    print("🔄 Ejecutando script de datos mínimos...")
    
    # Ejecutar el script completo
    cursor.execute(sql_datos_minimos)
    
    # Confirmar cambios
    conn.commit()
    
    # Verificar que se cargaron los datos
    cursor.execute("SELECT COUNT(*) FROM trabajadores")
    count_trabajadores = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM oficios")  
    count_oficios = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM solicitantes")
    count_solicitantes = cursor.fetchone()[0]
    
    print("✅ Datos mínimos cargados exitosamente:")
    print(f"   - {count_oficios} oficios")
    print(f"   - {count_solicitantes} solicitante (María)")
    print(f"   - {count_trabajadores} trabajadores (incluye Carlos)")
    print("   - Especialidades y tarifas configuradas")
    print("")
    print("🚀 ¡Listo para probar el pipeline A2A!")
    print("   Caso de prueba: 'Necesito un plomero urgente, se rompió mi inodoro'")
    print("")
    print("📋 Trabajadores disponibles:")
    cursor.execute("""
        SELECT t.nombre_completo, o.nombre_oficio, t.calificacion_promedio, t.disponibilidad 
        FROM trabajadores t 
        JOIN trabajador_oficio to ON t.id_trabajador = to.id_trabajador 
        JOIN oficios o ON to.id_oficio = o.id_oficio
    """)
    
    for row in cursor.fetchall():
        nombre, oficio, calificacion, disponibilidad = row
        print(f"   - {nombre}: {oficio} ({calificacion}⭐, {disponibilidad})")
    
except Exception as e:
    print(f"❌ Error: {e}")
    if 'conn' in locals():
        conn.rollback()
finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()