-- =====================================================
-- Datos Mínimos para Prueba A2A (María → Carlos)
-- =====================================================

-- Solo los datos esenciales para probar el pipeline completo

-- Limpiar tablas
TRUNCATE TABLE clasificacion_logs, alertas, calificaciones, servicios, 
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
-- Carlos (plomero estrella para el caso de uso)
(1, 'Carlos Mendoza Ruiz', '1098765432', 'natural', '3201234567', 'carlos.plomero@email.com', 2, 'Calle 85 #12-34 Apto 102', 12, 4.8, 'disponible', 15, TRUE, '2023-03-15'),
-- Andrés (plomero alternativo)
(2, 'Andrés Felipe Castro', '1087654321', 'natural', '3212345678', 'andres.plomero@email.com', 1, 'Carrera 128 #95-20', 8, 4.5, 'disponible', 12, TRUE, '2023-06-20'),
-- Roberto (electricista)
(3, 'Roberto Gómez López', '1065432109', 'natural', '3234567890', 'roberto.electricista@email.com', 1, 'Carrera 11 #65-40', 10, 4.7, 'disponible', 20, TRUE, '2023-01-25');

-- TRABAJADOR_OFICIO (especialidades y tarifas)
INSERT INTO trabajador_oficio (id_trab_oficio, id_trabajador, id_oficio, tarifa_hora_promedio, tarifa_visita, certificaciones) VALUES
-- Carlos - Plomero
(1, 1, 1, 35000, 25000, 'SENA Instalaciones Hidráulicas, Curso Soldadura SMAW'),
-- Andrés - Plomero  
(2, 2, 1, 28000, 20000, 'SENA Sistemas Hidráulicos'),
-- Roberto - Electricista
(3, 3, 2, 38000, 28000, 'SENA Electricidad Residencial, RETIE vigente');

-- TARIFAS MERCADO
INSERT INTO tarifas_mercado (id_tarifa, id_oficio, ciudad, precio_min, precio_max, fuente) VALUES
(1, 1, 'Bogotá D.C.', 50000, 150000, 'Encuesta mercado 2024'),
(2, 2, 'Bogotá D.C.', 60000, 180000, 'Encuesta mercado 2024');

-- =====================================================
-- RESUMEN DE DATOS CARGADOS
-- =====================================================
/*
✅ Datos listos para probar caso María → Carlos:

SOLICITUD DE PRUEBA:
"Necesito un plomero urgente, se rompió mi inodoro"

RESULTADO ESPERADO:
1. Agente Analista → Identifica oficio Plomero (ID:1), urgencia alta
2. Agente Recomendador → Encuentra Carlos (4.8⭐, Usaquén, 12 años exp)
3. Agente Guardian → Verifica precios normales (25k-35k vs mercado 50k-150k)
4. Orquestador → Procede, conecta María con Carlos

TRABAJADORES DISPONIBLES:
- Carlos Mendoza: Plomero senior, 4.8⭐, Usaquén (cerca de Chapinero)
- Andrés Castro: Plomero junior, 4.5⭐, Chapinero (mismo barrio María)
- Roberto Gómez: Electricista, 4.7⭐, Chapinero

UBICACIONES:
- María: Chapinero (solicita servicio)
- Carlos: Usaquén (2-3 km de distancia)
- Andrés: Chapinero (mismo barrio, <1 km)
*/