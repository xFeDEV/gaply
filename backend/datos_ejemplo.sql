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

-- =====================================================
-- TRABAJADORES (15 perfiles técnicos - El caso de Carlos incluido)
-- =====================================================

INSERT INTO trabajadores (id_trabajador, nombre_completo, identificacion, tipo_persona, telefono, email, id_barrio, direccion, anos_experiencia, calificacion_promedio, disponibilidad, cobertura_km, tiene_arl, fecha_registro) VALUES
-- PLOMEROS (incluye a Carlos para el caso de uso)
(1, 'Carlos Mendoza Ruiz', '1098765432', 'natural', '3201234567', 'carlos.plomero@email.com', 2, 'Calle 85 #12-34 Apto 102', 12, 4.8, 'disponible', 15, TRUE, '2023-03-15'),
(2, 'Andrés Felipe Castro', '1087654321', 'natural', '3212345678', 'andres.plomero@email.com', 4, 'Carrera 128 #95-20', 8, 4.5, 'disponible', 12, TRUE, '2023-06-20'),
(3, 'Jairo Sánchez Villa', '1076543210', 'natural', '3223456789', 'jairo.plomero@email.com', 3, 'Calle 45 Sur #78-15', 15, 4.9, 'parcial', 10, TRUE, '2022-11-10'),

-- ELECTRICISTAS
(4, 'Roberto Gómez López', '1065432109', 'natural', '3234567890', 'roberto.electricista@email.com', 1, 'Carrera 11 #65-40', 10, 4.7, 'disponible', 20, TRUE, '2023-01-25'),
(5, 'Edison Vargas Mora', '1054321098', 'natural', '3245678901', 'edison.electricista@email.com', 5, 'Calle 80 #105-30', 6, 4.3, 'disponible', 8, FALSE, '2023-09-12'),
(6, 'Fernando Eléctricos SAS', '9001234567', 'juridica', '3256789012', 'contacto@fernandoelectricos.com', 6, 'Carrera 43A #15-60 Local 203', 20, 4.9, 'disponible', 25, TRUE, '2020-05-18'),

-- TÉCNICOS AIRES ACONDICIONADOS
(7, 'Miguel Torres Aire', '1043210987', 'natural', '3267890123', 'miguel.aires@email.com', 7, 'Calle 70 #50-25', 7, 4.6, 'disponible', 18, TRUE, '2023-04-08'),
(8, 'Climatización Total Ltda', '9007654321', 'juridica', '3278901234', 'servicio@climatotal.com', 9, 'Avenida 6N #28-45 Bodega 12', 15, 4.8, 'disponible', 30, TRUE, '2021-08-14'),

-- TÉCNICOS REFRIGERACIÓN  
(9, 'Pedro Frío González', '1032109876', 'natural', '3289012345', 'pedro.frio@email.com', 10, 'Calle 5 #40-80 Barrio Jardín', 9, 4.4, 'parcial', 12, TRUE, '2023-02-28'),
(10, 'Servicio Neveras Express', '9004567890', 'juridica', '3290123456', 'expressfrio@email.com', 11, 'Carrera 58 #76-30', 12, 4.7, 'disponible', 20, TRUE, '2022-07-05'),

-- CERRAJEROS
(11, 'Jhon Jairo Llaves', '1021098765', 'natural', '3201234568', 'jhon.cerrajero@email.com', 8, 'Calle 33 #25-15 La América', 5, 4.2, 'disponible', 15, FALSE, '2023-08-30'),
(12, 'Cerrajería 24 Horas', '9002345678', 'juridica', '3212345679', '24horas@cerrajeria.com', 1, 'Calle 57 #8-40 Centro', 18, 4.8, 'disponible', 35, TRUE, '2019-12-01'),

-- TÉCNICOS DE COMPUTADORAS
(13, 'Alejandro PC Master', '1010987654', 'natural', '3223456780', 'alejandro.pc@email.com', 2, 'Carrera 15 #88-25 Apto 304', 4, 4.1, 'disponible', 10, FALSE, '2024-01-18'),
(14, 'Soporte TI Profesional', '9003456789', 'juridica', '3234567891', 'soporte@tiprofesional.com', 12, 'Zona Franca Parque Central', 8, 4.6, 'parcial', 25, TRUE, '2022-03-22'),

-- SERVICIOS MUDANZAS
(15, 'Mudanzas Rápidas Carga', '9005678901', 'juridica', '3245678902', 'carga@mudanzasrapidas.com', 13, 'Carrera 3 #8-120 Bocagrande', 6, 4.3, 'disponible', 40, TRUE, '2023-05-15');

-- =====================================================
-- TRABAJADOR_OFICIO (Especialidades y Tarifas)
-- =====================================================

INSERT INTO trabajador_oficio (id_trab_oficio, id_trabajador, id_oficio, tarifa_hora_promedio, tarifa_visita, certificaciones) VALUES
-- Carlos Mendoza (Plomero estrella) - ID Trabajador 1
(1, 1, 1, 35000, 25000, 'SENA Instalaciones Hidráulicas, Curso Soldadura SMAW'),

-- Andrés Felipe Castro (Plomero junior) - ID Trabajador 2  
(2, 2, 1, 28000, 20000, 'SENA Sistemas Hidráulicos'),

-- Jairo Sánchez (Plomero senior) - ID Trabajador 3
(3, 3, 1, 40000, 30000, 'SENA Instalaciones Hidráulicas, Certificación ARL Sura, 15 años experiencia'),

-- Roberto Gómez (Electricista) - ID Trabajador 4
(4, 4, 2, 38000, 28000, 'SENA Electricidad Residencial, RETIE vigente'),

-- Edison Vargas (Electricista junior) - ID Trabajador 5
(5, 5, 2, 30000, 22000, 'Técnico Electricidad Industrial'),

-- Fernando Eléctricos SAS (Empresa electricista) - ID Trabajador 6
(6, 6, 2, 45000, 35000, 'RETIE, RETILAP, ISO 9001, 20 años mercado'),

-- Miguel Torres (Aires acondicionados) - ID Trabajador 7
(7, 7, 4, 42000, 35000, 'SENA Refrigeración, Manejo gases refrigerantes'),

-- Climatización Total (Empresa aires) - ID Trabajador 8
(8, 8, 4, 50000, 40000, 'Certificación EPA, Autorización gases refrigerantes, Garantía 1 año'),

-- Pedro Frío (Técnico neveras) - ID Trabajador 9
(9, 9, 5, 35000, 25000, 'SENA Refrigeración Doméstica'),

-- Servicio Neveras Express (Empresa neveras) - ID Trabajador 10
(10, 10, 5, 40000, 30000, 'Autorización fabricantes LG, Samsung, Whirlpool'),

-- Jhon Jairo Llaves (Cerrajero) - ID Trabajador 11
(11, 11, 3, 25000, 35000, 'Curso Cerrajería Básica'),

-- Cerrajería 24 Horas (Empresa cerrajería) - ID Trabajador 12
(12, 12, 3, 35000, 45000, 'Cámara de Comercio, Seguros responsabilidad civil'),

-- Alejandro PC Master (Técnico computadoras) - ID Trabajador 13
(13, 13, 11, 30000, 25000, 'CompTIA A+, Microsoft Certified'),

-- Soporte TI Profesional (Empresa IT) - ID Trabajador 14
(14, 14, 11, 45000, 35000, 'Cisco CCNA, Microsoft Partner, VMware Certified'),
(15, 14, 12, 40000, 30000, 'Certificación Redes, Cableado Estructurado'),
(16, 14, 15, 50000, 40000, 'ITIL Foundation, Soporte Técnico Nivel 2'),

-- Mudanzas Rápidas (Empresa mudanzas) - ID Trabajador 15  
(17, 15, 20, 80000, 150000, 'Licencia Transporte Carga, Seguros mercancía, Embalaje profesional');

-- =====================================================
-- SOLICITUDES DE EJEMPLO (Casos típicos como María)
-- =====================================================

INSERT INTO solicitudes (id_solicitud, id_solicitante, id_oficio, descripcion_usuario, urgencia, id_barrio_servicio, fecha_creacion, estado, precio_estimado_mercado, flag_alerta) VALUES
-- María con su inodoro (caso principal del reto)
(1, 1, 1, 'Necesito un plomero urgente, se me rompió el inodoro y está saliendo agua por todos lados', 'alta', 1, '2024-10-22 14:30:00', 'pendiente', 80000, FALSE),

-- Otros casos típicos
(2, 2, 2, 'Se fue la luz en mi apartamento, necesito un electricista que venga hoy', 'alta', 2, '2024-10-22 09:15:00', 'pendiente', 90000, FALSE),
(3, 3, 4, 'Mi aire acondicionado no enfría, hace mucho calor y tengo un bebé', 'media', 3, '2024-10-22 11:45:00', 'pendiente', 120000, FALSE),
(4, 4, 5, 'La nevera no está enfriando bien y se me puede dañar la comida', 'media', 4, '2024-10-22 16:20:00', 'pendiente', 95000, FALSE),
(5, 5, 3, 'Se me perdieron las llaves del apartamento y no puedo entrar', 'alta', 5, '2024-10-22 19:45:00', 'pendiente', 65000, FALSE),
(6, 6, 11, 'Mi computador se puso lento y no arranca bien, trabajo desde casa', 'media', 6, '2024-10-22 08:30:00', 'pendiente', 70000, FALSE),
(7, 8, 20, 'Necesito una mudanza para el próximo fin de semana, tengo apartamento de 2 habitaciones', 'baja', 9, '2024-10-22 13:10:00', 'pendiente', 300000, FALSE);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- TRABAJADORES incluye al "Carlos" del caso de uso:
-- - Carlos Mendoza: plomero con 12 años experiencia, calificación 4.8/5
-- - Ubicado en Usaquén (estrato 5), cobertura 15km  
-- - Disponible, con ARL, tarifas competitivas
-- - PERFECTO para atender a María (Chapinero, problema urgente plomería)

-- Los datos permiten probar el flujo completo A2A:
-- 1. María escribe: "Necesito plomero urgente, se rompió inodoro"
-- 2. Agente Analista → identifica oficio plomero (ID 1), urgencia alta
-- 3. Agente Recomendador → encuentra Carlos y otros cerca, los prioriza
-- 4. Agente Guardian → verifica seguridad, precios normales
-- 5. Orquestador → decide proceder, conecta María con Carlos

-- PRÓXIMAS TABLAS A POBLAR (desarrollo futuro):
-- - RECOMENDACIONES: matches calculados por el Agente Recomendador
-- - SERVICIOS: asignaciones confirmadas
-- - CALIFICACIONES: feedback post-servicio  
-- - ALERTAS: casos detectados por Agente Guardian
-- - CLASIFICACION_LOGS: historial decisiones IA

