#!/usr/bin/env python3
"""
Script para cargar datos mínimos necesarios para probar el pipeline A2A
Ejecutar con: python cargar_datos_minimos.py
"""

import os
import sys
from pathlib import Path

# Agregar el directorio app al path para importar los modelos
sys.path.append(str(Path(__file__).parent / "app"))

from app.database import engine, SessionLocal, Base
from app.database import (
    Ciudad, Barrio, Oficio, Solicitante, Trabajador, 
    TrabajadorOficio, TarifaMercado
)

def cargar_datos_minimos():
    """Carga los datos mínimos necesarios para el caso María-Carlos"""
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    # Crear sesión
    db = SessionLocal()
    
    try:
        print("🔄 Cargando datos mínimos para prueba A2A...")
        
        # Verificar si ya hay datos
        if db.query(Ciudad).count() > 0:
            print("✅ Ya existen datos en la base de datos")
            return
        
        # 1. CIUDADES
        bogota = Ciudad(id_ciudad=1, nombre_ciudad='Bogotá D.C.', 
                       departamento='Cundinamarca', region='Andina', codigo_postal_base=110000)
        db.add(bogota)
        
        # 2. BARRIOS
        chapinero = Barrio(id_barrio=1, id_ciudad=1, nombre_barrio='Chapinero', estrato=4)
        usaquen = Barrio(id_barrio=2, id_ciudad=1, nombre_barrio='Usaquén', estrato=5)
        db.add_all([chapinero, usaquen])
        
        # 3. OFICIOS 
        plomero = Oficio(id_oficio=1, nombre_oficio='Plomero', categoria_servicio='Hogar',
                        descripcion='Instalación y reparación de tuberías, desagües, llaves')
        electricista = Oficio(id_oficio=2, nombre_oficio='Electricista', categoria_servicio='Hogar',
                             descripcion='Instalación y reparación de sistemas eléctricos')
        db.add_all([plomero, electricista])
        
        # 4. SOLICITANTES (María)
        maria = Solicitante(
            id_solicitante=1, nombre_completo='María González Pérez',
            cedula='1012345678', telefono='3101234567', 
            email='maria.gonzalez@email.com', id_barrio=1,
            direccion='Calle 63 #10-20 Apto 301', acepta_habeas=True,
            fecha_registro='2024-01-15'
        )
        db.add(maria)
        
        # 5. TRABAJADORES (Carlos)
        carlos = Trabajador(
            id_trabajador=1, nombre_completo='Carlos Mendoza Ruiz',
            identificacion='1098765432', tipo_persona='natural',
            telefono='3201234567', email='carlos.plomero@email.com',
            id_barrio=2, direccion='Calle 85 #12-34 Apto 102',
            anos_experiencia=12, calificacion_promedio=4.8,
            disponibilidad='disponible', cobertura_km=15,
            tiene_arl=True, fecha_registro='2023-03-15'
        )
        
        andres = Trabajador(
            id_trabajador=2, nombre_completo='Andrés Felipe Castro',
            identificacion='1087654321', tipo_persona='natural',
            telefono='3212345678', email='andres.plomero@email.com',
            id_barrio=1, direccion='Carrera 128 #95-20',
            anos_experiencia=8, calificacion_promedio=4.5,
            disponibilidad='disponible', cobertura_km=12,
            tiene_arl=True, fecha_registro='2023-06-20'
        )
        
        db.add_all([carlos, andres])
        
        # 6. TRABAJADOR_OFICIO (especialidades)
        carlos_plomero = TrabajadorOficio(
            id_trab_oficio=1, id_trabajador=1, id_oficio=1,
            tarifa_hora_promedio=35000, tarifa_visita=25000,
            certificaciones='SENA Instalaciones Hidráulicas'
        )
        
        andres_plomero = TrabajadorOficio(
            id_trab_oficio=2, id_trabajador=2, id_oficio=1,
            tarifa_hora_promedio=28000, tarifa_visita=20000,
            certificaciones='SENA Sistemas Hidráulicos'
        )
        
        db.add_all([carlos_plomero, andres_plomero])
        
        # 7. TARIFAS MERCADO
        tarifa = TarifaMercado(
            id_tarifa=1, id_oficio=1, ciudad='Bogotá D.C.',
            precio_min=50000, precio_max=150000,
            fuente='Encuesta mercado 2024'
        )
        db.add(tarifa)
        
        # Confirmar cambios
        db.commit()
        print("✅ Datos mínimos cargados exitosamente:")
        print("   - 1 ciudad (Bogotá)")
        print("   - 2 barrios (Chapinero, Usaquén)")
        print("   - 2 oficios (Plomero, Electricista)")
        print("   - 1 solicitante (María)")
        print("   - 2 trabajadores (Carlos, Andrés)")
        print("   - Especialidades y tarifas configuradas")
        print("")
        print("🚀 ¡Listo para probar el pipeline A2A!")
        print("   Caso de prueba: 'Necesito un plomero urgente, se rompió mi inodoro'")
        
    except Exception as e:
        print(f"❌ Error cargando datos: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    cargar_datos_minimos()