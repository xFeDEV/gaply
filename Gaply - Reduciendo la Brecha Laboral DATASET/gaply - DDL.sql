-- TASKPRO – Esquema relacional (PostgreSQL/MySQL/SQL Server friendly)
-- Notas: Usar UTF-8. Ajustar tipos DATETIME a TIMESTAMP en PostgreSQL si se desea.

-- Limpieza (orden por dependencias)
DROP TABLE IF EXISTS CLASIFICACION_LOGS;
DROP TABLE IF EXISTS ALERTAS;
DROP TABLE IF EXISTS CALIFICACIONES;
DROP TABLE IF EXISTS SERVICIOS;
DROP TABLE IF EXISTS RECOMENDACIONES;
DROP TABLE IF EXISTS SOLICITUDES;
DROP TABLE IF EXISTS TARIFAS_MERCADO;
DROP TABLE IF EXISTS TRABAJADOR_OFICIO;
DROP TABLE IF EXISTS TRABAJADORES;
DROP TABLE IF EXISTS SOLICITANTES;
DROP TABLE IF EXISTS OFICIOS;
DROP TABLE IF EXISTS BARRIOS;
DROP TABLE IF EXISTS CIUDADES;

-- =========================
-- MAESTROS
-- =========================
CREATE TABLE CIUDADES (
  id_ciudad            INT PRIMARY KEY,
  nombre_ciudad        VARCHAR(80) NOT NULL,
  departamento         VARCHAR(80) NOT NULL,
  region               VARCHAR(40) NOT NULL,
  codigo_postal_base   INT NOT NULL
);
CREATE INDEX idx_ciudades_nombre ON CIUDADES (nombre_ciudad);

CREATE TABLE BARRIOS (
  id_barrio    INT PRIMARY KEY,
  id_ciudad    INT NOT NULL,
  nombre_barrio VARCHAR(100) NOT NULL,
  estrato      INT NOT NULL,
  CONSTRAINT fk_barrios_ciudad FOREIGN KEY (id_ciudad) REFERENCES CIUDADES(id_ciudad)
);
CREATE INDEX idx_barrios_ciudad ON BARRIOS (id_ciudad, nombre_barrio);

CREATE TABLE OFICIOS (
  id_oficio          INT PRIMARY KEY,
  nombre_oficio      VARCHAR(100) NOT NULL UNIQUE,
  categoria_servicio VARCHAR(60) NOT NULL,
  descripcion        VARCHAR(300) NULL
);
CREATE INDEX idx_oficios_categoria ON OFICIOS (categoria_servicio);

-- =========================
-- USUARIOS
-- =========================
CREATE TABLE SOLICITANTES (
  id_solicitante   INT PRIMARY KEY,
  nombre_completo  VARCHAR(150) NOT NULL,
  cedula           VARCHAR(20) NOT NULL UNIQUE,
  telefono         VARCHAR(20) NOT NULL,
  email            VARCHAR(150) NULL UNIQUE,
  id_barrio        INT NOT NULL,
  direccion        VARCHAR(120) NOT NULL,
  acepta_habeas    BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro   DATE NOT NULL,
  CONSTRAINT fk_solicitantes_barrio FOREIGN KEY (id_barrio) REFERENCES BARRIOS(id_barrio)
);
CREATE INDEX idx_solicitantes_barrio ON SOLICITANTES (id_barrio);
CREATE INDEX idx_solicitantes_email ON SOLICITANTES (email);

CREATE TABLE TRABAJADORES (
  id_trabajador         INT PRIMARY KEY,
  nombre_completo       VARCHAR(150) NOT NULL,
  identificacion        VARCHAR(20) NOT NULL UNIQUE, -- cédula/NIT simulado
  tipo_persona          VARCHAR(20) NOT NULL,
  telefono              VARCHAR(20) NOT NULL,
  email                 VARCHAR(150) NULL UNIQUE,
  id_barrio             INT NOT NULL,
  direccion             VARCHAR(120) NOT NULL,
  anos_experiencia      INT NOT NULL,
  calificacion_promedio DECIMAL(3,2) NOT NULL,
  disponibilidad        VARCHAR(15) NOT NULL,
  cobertura_km          INT NOT NULL,
  tiene_arl             BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_registro        DATE NOT NULL,
  CONSTRAINT fk_trabajadores_barrio FOREIGN KEY (id_barrio) REFERENCES BARRIOS(id_barrio),
  CONSTRAINT ck_trabajadores_rating CHECK (calificacion_promedio BETWEEN 1 AND 5)
);
CREATE INDEX idx_trabajadores_barrio ON TRABAJADORES (id_barrio);
CREATE INDEX idx_trabajadores_dispon ON TRABAJADORES (disponibilidad);
CREATE INDEX idx_trabajadores_rating ON TRABAJADORES (calificacion_promedio DESC);

CREATE TABLE TRABAJADOR_OFICIO (
  id_trab_oficio        INT PRIMARY KEY,
  id_trabajador         INT NOT NULL,
  id_oficio             INT NOT NULL,
  tarifa_hora_promedio  INT NOT NULL,
  tarifa_visita         INT NOT NULL,
  certificaciones       VARCHAR(120) NULL,
  CONSTRAINT fk_to_trab FOREIGN KEY (id_trabajador) REFERENCES TRABAJADORES(id_trabajador),
  CONSTRAINT fk_to_oficio FOREIGN KEY (id_oficio) REFERENCES OFICIOS(id_oficio),
  CONSTRAINT uq_to UNIQUE (id_trabajador, id_oficio)
);

CREATE TABLE TARIFAS_MERCADO (
  id_tarifa   INT PRIMARY KEY,
  id_oficio   INT NOT NULL,
  ciudad      VARCHAR(80) NOT NULL,
  precio_min  INT NOT NULL,
  precio_max  INT NOT NULL,
  fuente      VARCHAR(120) NOT NULL,
  CONSTRAINT fk_tarifa_oficio FOREIGN KEY (id_oficio) REFERENCES OFICIOS(id_oficio)
);
CREATE INDEX idx_tarifas_oficio_ciudad ON TARIFAS_MERCADO (id_oficio, ciudad);

-- =========================
-- OPERACIÓN
-- =========================
CREATE TABLE SOLICITUDES (
  id_solicitud            INT PRIMARY KEY,
  id_solicitante          INT NOT NULL,
  id_oficio               INT NOT NULL,
  descripcion_usuario     VARCHAR(400) NOT NULL,
  urgencia                VARCHAR(10) NOT NULL,
  id_barrio_servicio      INT NOT NULL,
  fecha_creacion          DATETIME NOT NULL,
  estado                  VARCHAR(15) NOT NULL,
  precio_estimado_mercado INT NOT NULL,
  flag_alerta             BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_sol_solicitante FOREIGN KEY (id_solicitante) REFERENCES SOLICITANTES(id_solicitante),
  CONSTRAINT fk_sol_oficio FOREIGN KEY (id_oficio) REFERENCES OFICIOS(id_oficio),
  CONSTRAINT fk_sol_barrio FOREIGN KEY (id_barrio_servicio) REFERENCES BARRIOS(id_barrio)
);
CREATE INDEX idx_solicitudes_estado ON SOLICITUDES (estado, urgencia);
CREATE INDEX idx_solicitudes_barrio ON SOLICITUDES (id_barrio_servicio);

CREATE TABLE RECOMENDACIONES (
  id_recomendacion   INT PRIMARY KEY,
  id_solicitud       INT NOT NULL,
  id_trabajador      INT NOT NULL,
  score_relevancia   DECIMAL(4,3) NOT NULL,
  distancia_km       DECIMAL(5,2) NOT NULL,
  motivo_top         VARCHAR(20) NOT NULL,
  precio_estimado    INT NOT NULL,
  precio_propuesto   INT NOT NULL,
  explicacion        VARCHAR(500) NULL,
  es_asignado        BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_rec_sol FOREIGN KEY (id_solicitud) REFERENCES SOLICITUDES(id_solicitud),
  CONSTRAINT fk_rec_trab FOREIGN KEY (id_trabajador) REFERENCES TRABAJADORES(id_trabajador)
);
CREATE INDEX idx_recs_solicitud ON RECOMENDACIONES (id_solicitud);
CREATE INDEX idx_recs_trabajador ON RECOMENDACIONES (id_trabajador);
CREATE INDEX idx_recs_score ON RECOMENDACIONES (score_relevancia DESC);

CREATE TABLE SERVICIOS (
  id_servicio          INT PRIMARY KEY,
  id_solicitud         INT NOT NULL,
  id_trabajador        INT NOT NULL,
  fecha_asignacion     DATETIME NOT NULL,
  fecha_cierre         DATETIME NULL,
  costo_final_cop      INT NOT NULL,
  aplica_iva           BOOLEAN NOT NULL DEFAULT FALSE,
  valor_iva_cop        INT NOT NULL DEFAULT 0,
  retencion_fuente_cop INT NOT NULL DEFAULT 0,
  estado               VARCHAR(15) NOT NULL,
  CONSTRAINT fk_srv_sol FOREIGN KEY (id_solicitud) REFERENCES SOLICITUDES(id_solicitud),
  CONSTRAINT fk_srv_trab FOREIGN KEY (id_trabajador) REFERENCES TRABAJADORES(id_trabajador)
);
CREATE INDEX idx_servicios_estados ON SERVICIOS (estado, fecha_asignacion);

CREATE TABLE CALIFICACIONES (
  id_calificacion  INT PRIMARY KEY,
  id_servicio      INT NOT NULL,
  quien_califica   VARCHAR(15) NOT NULL,
  puntaje          DECIMAL(2,1) NOT NULL,
  comentario       VARCHAR(500) NULL,
  fecha            DATE NOT NULL,
  CONSTRAINT fk_cal_serv FOREIGN KEY (id_servicio) REFERENCES SERVICIOS(id_servicio),
  CONSTRAINT ck_cal_puntaje CHECK (puntaje BETWEEN 1 AND 5)
);
CREATE INDEX idx_calificaciones_servicio ON CALIFICACIONES (id_servicio);

CREATE TABLE ALERTAS (
  id_alerta        INT PRIMARY KEY,
  id_solicitud     INT NULL,
  id_recomendacion INT NULL,
  tipo_alerta      VARCHAR(30) NOT NULL,
  severidad        VARCHAR(10) NOT NULL,
  detalle          VARCHAR(400) NOT NULL,
  fecha            DATE NOT NULL,
  CONSTRAINT fk_alerta_sol FOREIGN KEY (id_solicitud) REFERENCES SOLICITUDES(id_solicitud),
  CONSTRAINT fk_alerta_rec FOREIGN KEY (id_recomendacion) REFERENCES RECOMENDACIONES(id_recomendacion)
);
CREATE INDEX idx_alertas_tipo ON ALERTAS (tipo_alerta, severidad);

CREATE TABLE CLASIFICACION_LOGS (
  id_log             INT PRIMARY KEY,
  id_solicitud       INT NOT NULL,
  texto_original     VARCHAR(500) NOT NULL,
  id_oficio_predicho INT NOT NULL,
  confianza          DECIMAL(4,3) NOT NULL,
  modelo_version     VARCHAR(40) NOT NULL,
  CONSTRAINT fk_logs_sol FOREIGN KEY (id_solicitud) REFERENCES SOLICITUDES(id_solicitud),
  CONSTRAINT fk_logs_ofi FOREIGN KEY (id_oficio_predicho) REFERENCES OFICIOS(id_oficio)
);
CREATE INDEX idx_logs_solicitud ON CLASIFICACION_LOGS (id_solicitud);
CREATE INDEX idx_logs_confianza ON CLASIFICACION_LOGS (confianza DESC);

-- Comentarios (opcional según motor)
-- CIUDADES.region: Andina/Caribe/Pacífico/Eje Cafetero
-- Moneda: COP. IVA: 19% aplicado en SERVICIOS cuando aplica.
-- Datos sintéticos respetan Ley 1581 (Habeas Data) en estructura (campo acepta_habeas).
