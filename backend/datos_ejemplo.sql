-- =====================================================
-- TaskPro - Datos de Ejemplo para Desarrollo y Testing
-- =====================================================
-- Este script carga datos sintéticos representativos para probar
-- la funcionalidad de análisis y clasificación de solicitudes.

-- Limpieza (por seguridad)
TRUNCATE TABLE clasificacion_logs, alertas, calificaciones, servicios, 
             recomendaciones, solicitudes, tarifas_mercado, trabajador_oficio, 
             trabajadores, solicitantes, oficios, barrios, ciudades 
RESTART IDENTITY CASCADE;

-- =====================================================
-- MAESTROS: CIUDADES Y BARRIOS
-- =====================================================

INSERT INTO ciudades (id_ciudad, nombre_ciudad, departamento, region, codigo_postal_base) VALUES
(1, 'Bogotá D.C.', 'Cundinamarca', 'Andina', 110000),
(2, 'Medellín', 'Antioquia', 'Andina', 50000),
(3, 'Cali', 'Valle del Cauca', 'Pacífico', 76000),
(4, 'Barranquilla', 'Atlántico', 'Caribe', 80000),
(5, 'Cartagena', 'Bolívar', 'Caribe', 130000);

INSERT INTO barrios (id_barrio, id_ciudad, nombre_barrio, estrato) VALUES
-- Bogotá
(1, 1, 'Chapinero', 4),
(2, 1, 'Usaquén', 5),
(3, 1, 'Kennedy', 3),
(4, 1, 'Suba', 3),
(5, 1, 'Engativá', 2),
-- Medellín
(6, 2, 'El Poblado', 6),
(7, 2, 'Laureles', 4),
(8, 2, 'Bello', 3),
-- Cali
(9, 3, 'San Fernando', 5),
(10, 3, 'Ciudad Jardín', 4),
-- Barranquilla
(11, 4, 'El Prado', 5),
(12, 4, 'Riomar', 6),
-- Cartagena
(13, 5, 'Bocagrande', 6),
(14, 5, 'Getsemaní', 2);

-- =====================================================
-- MAESTROS: OFICIOS
-- =====================================================

INSERT INTO oficios (id_oficio, nombre_oficio, categoria_servicio, descripcion) VALUES
-- Hogar (10)
(1, 'Plomero', 'Hogar', 'Instalación y reparación de tuberías, desagües, llaves, tanques y sistemas hidráulicos'),
(2, 'Electricista', 'Hogar', 'Instalación y reparación de sistemas eléctricos residenciales y comerciales'),
(3, 'Cerrajero', 'Seguridad', 'Apertura de puertas, cambio de cerraduras, duplicado de llaves y sistemas de seguridad'),
(4, 'Técnico de Aires Acondicionados', 'Hogar', 'Instalación, mantenimiento y reparación de sistemas de aire acondicionado'),
(5, 'Técnico de Refrigeración', 'Hogar', 'Reparación y mantenimiento de neveras, congeladores y equipos de frío'),
(6, 'Técnico de Lavadoras', 'Hogar', 'Reparación y mantenimiento de lavadoras y secadoras de ropa'),
(7, 'Gasfitero', 'Hogar', 'Instalación y reparación de sistemas de gas domiciliario y estufas'),
(8, 'Pintor', 'Construcción', 'Pintura interior y exterior de viviendas y locales comerciales'),
(9, 'Albañil', 'Construcción', 'Trabajos de mampostería, muros, pisos, enchapes y obras civiles menores'),
(10, 'Carpintero', 'Construcción', 'Fabricación y reparación de muebles, puertas, ventanas y estructuras de madera'),

-- Tecnología (5)
(11, 'Técnico de Computadoras', 'Tecnología', 'Reparación y mantenimiento de computadoras de escritorio y portátiles'),
(12, 'Instalador de Redes', 'Tecnología', 'Instalación de redes de datos, Wi-Fi y cableado estructurado'),
(13, 'Técnico de Celulares', 'Tecnología', 'Reparación de smartphones y tablets'),
(14, 'Instalador de Antenas', 'Tecnología', 'Instalación de antenas parabólicas, TV digital y sistemas de señal'),
(15, 'Soporte IT', 'Tecnología', 'Soporte técnico remoto y presencial para equipos y software'),

-- Limpieza y Mantenimiento (5)
(16, 'Servicio de Limpieza', 'Limpieza', 'Limpieza profunda de hogares, oficinas y locales comerciales'),
(17, 'Jardinero', 'Mantenimiento', 'Diseño, mantenimiento y poda de jardines y áreas verdes'),
(18, 'Lavador de Fachadas', 'Mantenimiento', 'Limpieza de vidrios, fachadas y áreas de difícil acceso'),
(19, 'Fumigador', 'Mantenimiento', 'Control de plagas, fumigación y desinfección'),
(20, 'Servicio de Mudanzas', 'Transporte', 'Traslado de muebles, embalaje y transporte de pertenencias'),

-- Automotriz (3)
(21, 'Mecánico Automotriz', 'Automotriz', 'Reparación y mantenimiento de vehículos'),
(22, 'Electricista Automotriz', 'Automotriz', 'Diagnóstico y reparación de sistemas eléctricos de vehículos'),
(23, 'Técnico de Latonería y Pintura', 'Automotriz', 'Reparación de carrocería y pintura automotriz'),

-- Servicios Profesionales (2)
(24, 'Profesor Particular', 'Educación', 'Clases particulares a domicilio (matemáticas, idiomas, etc.)'),
(25, 'Entrenador Personal', 'Salud', 'Entrenamiento físico personalizado a domicilio o gimnasio');

-- =====================================================
-- TARIFAS DE MERCADO (Referencias para IA)
-- =====================================================

INSERT INTO tarifas_mercado (id_tarifa, id_oficio, ciudad, precio_min, precio_max, fuente) VALUES
-- Bogotá
(1, 1, 'Bogotá D.C.', 50000, 150000, 'Encuesta mercado 2024'),
(2, 2, 'Bogotá D.C.', 60000, 180000, 'Encuesta mercado 2024'),
(3, 3, 'Bogotá D.C.', 70000, 120000, 'Encuesta mercado 2024'),
(4, 4, 'Bogotá D.C.', 80000, 250000, 'Encuesta mercado 2024'),
(5, 5, 'Bogotá D.C.', 90000, 200000, 'Encuesta mercado 2024'),
(6, 6, 'Bogotá D.C.', 70000, 150000, 'Encuesta mercado 2024'),
(7, 8, 'Bogotá D.C.', 40000, 100000, 'Encuesta mercado 2024 (por día)'),
(8, 11, 'Bogotá D.C.', 50000, 120000, 'Encuesta mercado 2024'),
(9, 16, 'Bogotá D.C.', 80000, 150000, 'Encuesta mercado 2024 (limpieza profunda)'),
(10, 20, 'Bogotá D.C.', 150000, 500000, 'Encuesta mercado 2024 (según tamaño)'),

-- Medellín
(11, 1, 'Medellín', 45000, 130000, 'Encuesta mercado 2024'),
(12, 2, 'Medellín', 55000, 160000, 'Encuesta mercado 2024'),
(13, 4, 'Medellín', 70000, 220000, 'Encuesta mercado 2024'),
(14, 8, 'Medellín', 35000, 90000, 'Encuesta mercado 2024 (por día)'),

-- Cali
(15, 1, 'Cali', 40000, 120000, 'Encuesta mercado 2024'),
(16, 2, 'Cali', 50000, 150000, 'Encuesta mercado 2024'),
(17, 5, 'Cali', 80000, 180000, 'Encuesta mercado 2024');

-- =====================================================
-- USUARIOS SOLICITANTES (10 perfiles)
-- =====================================================

INSERT INTO solicitantes (id_solicitante, nombre_completo, cedula, telefono, email, id_barrio, direccion, acepta_habeas, fecha_registro) VALUES
(1, 'María González Pérez', '1012345678', '3101234567', 'maria.gonzalez@email.com', 1, 'Calle 63 #10-20 Apto 301', TRUE, '2024-01-15'),
(2, 'Carlos Rodríguez Díaz', '1023456789', '3112345678', 'carlos.rodriguez@email.com', 2, 'Carrera 7 #85-45 Casa 12', TRUE, '2024-02-20'),
(3, 'Ana Martínez López', '1034567890', '3123456789', 'ana.martinez@email.com', 3, 'Calle 38 Sur #72D-15', TRUE, '2024-03-10'),
(4, 'Luis Hernández Gómez', '1045678901', '3134567890', NULL, 4, 'Transversal 92 #129-30', TRUE, '2024-04-05'),
(5, 'Patricia Ramírez Silva', '1056789012', '3145678901', 'patricia.ramirez@email.com', 5, 'Calle 80 #98A-50 Conjunto Verde', TRUE, '2024-05-12'),
(6, 'Jorge Sánchez Torres', '1067890123', '3156789012', 'jorge.sanchez@email.com', 6, 'Carrera 43A #10-45 Torre 2', TRUE, '2024-06-18'),
(7, 'Laura Díaz Muñoz', '1078901234', '3167890123', NULL, 7, 'Calle 70 #45-30 Apto 502', TRUE, '2024-07-22'),
(8, 'Miguel Castro Vargas', '1089012345', '3178901234', 'miguel.castro@email.com', 9, 'Calle 5 #36-50 Urbanización Sol', TRUE, '2024-08-14'),
(9, 'Sandra Morales Ríos', '1090123456', '3189012345', 'sandra.morales@email.com', 11, 'Carrera 54 #75-20', TRUE, '2024-09-08'),
(10, 'Roberto Jiménez Cruz', '1001234567', '3190123456', NULL, 13, 'Avenida San Martín #8-100 Edificio Mar', TRUE, '2024-10-03');

-- =====================================================
-- COMENTARIOS Y NOTAS
-- =====================================================

-- Solicitantes representan usuarios reales con datos sintéticos
-- que cumplen estructura de Ley 1581 (Habeas Data Colombia)

-- Los oficios cubren las categorías más demandadas según el reto:
-- - Hogar: reparaciones técnicas urgentes (plomería, electricidad, etc.)
-- - Tecnología: soporte IT y reparaciones
-- - Limpieza y Mantenimiento: servicios recurrentes
-- - Automotriz: mecánica y reparaciones vehiculares
-- - Servicios Profesionales: educación y entrenamiento

-- Las tarifas son referenciales y permiten al Agente Analista
-- detectar precios anómalos (muy altos o bajos) y generar alertas.

-- PRÓXIMOS DATOS A CARGAR (según avance del proyecto):
-- - TRABAJADORES: perfiles de técnicos con disponibilidad
-- - TRABAJADOR_OFICIO: relación muchos a muchos con tarifas
-- - SOLICITUDES: casos de prueba con texto en lenguaje natural
-- - RECOMENDACIONES: emparejamiento trabajador-solicitud con score
-- - SERVICIOS: asignaciones y estados de ejecución
-- - CALIFICACIONES: feedback bidireccional
-- - ALERTAS: casos detectados por IA
-- - CLASIFICACION_LOGS: trazabilidad de predicciones del modelo

