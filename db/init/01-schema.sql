-- GAPLY – Esquema relacional (PostgreSQL)
-- Adaptado del DDL original: DATETIME → TIMESTAMP

-- Limpieza (orden por dependencias)
DROP TABLE IF EXISTS clasificacion_logs;
DROP TABLE IF EXISTS alertas;
DROP TABLE IF EXISTS calificaciones;
DROP TABLE IF EXISTS servicios;
DROP TABLE IF EXISTS recomendaciones;
DROP TABLE IF EXISTS solicitudes;
DROP TABLE IF EXISTS tarifas_mercado;
DROP TABLE IF EXISTS trabajador_oficio;
DROP TABLE IF EXISTS trabajadores;
DROP TABLE IF EXISTS solicitantes;
DROP TABLE IF EXISTS oficios;
DROP TABLE IF EXISTS barrios;
DROP TABLE IF EXISTS ciudades;

-- =========================
-- MAESTROS
-- =========================
CREATE TABLE ciudades (
  id_ciudad            INT PRIMARY KEY,
  nombre_ciudad        VARCHAR(80) NOT NULL,
  departamento         VARCHAR(80) NOT NULL,
  region               VARCHAR(40) NOT NULL,
  codigo_postal_base   INT NOT NULL
);
CREATE INDEX idx_ciudades_nombre ON ciudades (nombre_ciudad);

CREATE TABLE barrios (
  id_barrio    INT PRIMARY KEY,
  id_ciudad    INT NOT NULL,
  nombre_barrio VARCHAR(100) NOT NULL,
  estrato      INT NOT NULL,
  CONSTRAINT fk_barrios_ciudad FOREIGN KEY (id_ciudad) REFERENCES ciudades(id_ciudad)
);
CREATE INDEX idx_barrios_ciudad ON barrios (id_ciudad, nombre_barrio);

CREATE TABLE oficios (
  id_oficio          INT PRIMARY KEY,
  nombre_oficio      VARCHAR(100) NOT NULL UNIQUE,
  categoria_servicio VARCHAR(60) NOT NULL,
  descripcion        VARCHAR(300) NULL
);
CREATE INDEX idx_oficios_categoria ON oficios (categoria_servicio);

-- =========================
-- USUARIOS
-- =========================
CREATE TABLE solicitantes (
  id_solicitante   INT PRIMARY KEY,
  nombre_completo  VARCHAR(150) NOT NULL,
  cedula           VARCHAR(20) NOT NULL UNIQUE,
  telefono         VARCHAR(20) NOT NULL,
  email            VARCHAR(150) NULL UNIQUE,
  id_barrio        INT NOT NULL,
  direccion        VARCHAR(120) NOT NULL,
  acepta_habeas    BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro   DATE NOT NULL,
  CONSTRAINT fk_solicitantes_barrio FOREIGN KEY (id_barrio) REFERENCES barrios(id_barrio)
);
CREATE INDEX idx_solicitantes_barrio ON solicitantes (id_barrio);
CREATE INDEX idx_solicitantes_email ON solicitantes (email);

CREATE TABLE trabajadores (
  id_trabajador         INT PRIMARY KEY,
  nombre_completo       VARCHAR(150) NOT NULL,
  identificacion        VARCHAR(20) NOT NULL UNIQUE,
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
  CONSTRAINT fk_trabajadores_barrio FOREIGN KEY (id_barrio) REFERENCES barrios(id_barrio),
  CONSTRAINT ck_trabajadores_rating CHECK (calificacion_promedio BETWEEN 1 AND 5)
);
CREATE INDEX idx_trabajadores_barrio ON trabajadores (id_barrio);
CREATE INDEX idx_trabajadores_dispon ON trabajadores (disponibilidad);
CREATE INDEX idx_trabajadores_rating ON trabajadores (calificacion_promedio DESC);

CREATE TABLE trabajador_oficio (
  id_trab_oficio        INT PRIMARY KEY,
  id_trabajador         INT NOT NULL,
  id_oficio             INT NOT NULL,
  tarifa_hora_promedio  INT NOT NULL,
  tarifa_visita         INT NOT NULL,
  certificaciones       VARCHAR(120) NULL,
  CONSTRAINT fk_to_trab FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id_trabajador),
  CONSTRAINT fk_to_oficio FOREIGN KEY (id_oficio) REFERENCES oficios(id_oficio),
  CONSTRAINT uq_to UNIQUE (id_trabajador, id_oficio)
);

CREATE TABLE tarifas_mercado (
  id_tarifa   INT PRIMARY KEY,
  id_oficio   INT NOT NULL,
  ciudad      VARCHAR(80) NOT NULL,
  precio_min  INT NOT NULL,
  precio_max  INT NOT NULL,
  fuente      VARCHAR(120) NOT NULL,
  CONSTRAINT fk_tarifa_oficio FOREIGN KEY (id_oficio) REFERENCES oficios(id_oficio)
);
CREATE INDEX idx_tarifas_oficio_ciudad ON tarifas_mercado (id_oficio, ciudad);

-- =========================
-- OPERACIÓN
-- =========================
CREATE TABLE solicitudes (
  id_solicitud            INT PRIMARY KEY,
  id_solicitante          INT NOT NULL,
  id_oficio               INT NOT NULL,
  descripcion_usuario     VARCHAR(400) NOT NULL,
  urgencia                VARCHAR(10) NOT NULL,
  id_barrio_servicio      INT NOT NULL,
  fecha_creacion          TIMESTAMP NOT NULL,
  estado                  VARCHAR(15) NOT NULL,
  precio_estimado_mercado INT NOT NULL,
  flag_alerta             BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_sol_solicitante FOREIGN KEY (id_solicitante) REFERENCES solicitantes(id_solicitante),
  CONSTRAINT fk_sol_oficio FOREIGN KEY (id_oficio) REFERENCES oficios(id_oficio),
  CONSTRAINT fk_sol_barrio FOREIGN KEY (id_barrio_servicio) REFERENCES barrios(id_barrio)
);
CREATE INDEX idx_solicitudes_estado ON solicitudes (estado, urgencia);
CREATE INDEX idx_solicitudes_barrio ON solicitudes (id_barrio_servicio);

CREATE TABLE recomendaciones (
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
  CONSTRAINT fk_rec_sol FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id_solicitud),
  CONSTRAINT fk_rec_trab FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id_trabajador)
);
CREATE INDEX idx_recs_solicitud ON recomendaciones (id_solicitud);
CREATE INDEX idx_recs_trabajador ON recomendaciones (id_trabajador);
CREATE INDEX idx_recs_score ON recomendaciones (score_relevancia DESC);

CREATE TABLE servicios (
  id_servicio          INT PRIMARY KEY,
  id_solicitud         INT NOT NULL,
  id_trabajador        INT NOT NULL,
  fecha_asignacion     TIMESTAMP NOT NULL,
  fecha_cierre         TIMESTAMP NULL,
  costo_final_cop      INT NOT NULL,
  aplica_iva           BOOLEAN NOT NULL DEFAULT FALSE,
  valor_iva_cop        INT NOT NULL DEFAULT 0,
  retencion_fuente_cop INT NOT NULL DEFAULT 0,
  estado               VARCHAR(15) NOT NULL,
  CONSTRAINT fk_srv_sol FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id_solicitud),
  CONSTRAINT fk_srv_trab FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id_trabajador)
);
CREATE INDEX idx_servicios_estados ON servicios (estado, fecha_asignacion);

CREATE TABLE calificaciones (
  id_calificacion  INT PRIMARY KEY,
  id_servicio      INT NOT NULL,
  quien_califica   VARCHAR(15) NOT NULL,
  puntaje          DECIMAL(2,1) NOT NULL,
  comentario       VARCHAR(500) NULL,
  fecha            DATE NOT NULL,
  CONSTRAINT fk_cal_serv FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
  CONSTRAINT ck_cal_puntaje CHECK (puntaje BETWEEN 1 AND 5)
);
CREATE INDEX idx_calificaciones_servicio ON calificaciones (id_servicio);

CREATE TABLE alertas (
  id_alerta        INT PRIMARY KEY,
  id_solicitud     INT NULL,
  id_recomendacion INT NULL,
  tipo_alerta      VARCHAR(30) NOT NULL,
  severidad        VARCHAR(10) NOT NULL,
  detalle          VARCHAR(400) NOT NULL,
  fecha            DATE NOT NULL,
  CONSTRAINT fk_alerta_sol FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id_solicitud),
  CONSTRAINT fk_alerta_rec FOREIGN KEY (id_recomendacion) REFERENCES recomendaciones(id_recomendacion)
);
CREATE INDEX idx_alertas_tipo ON alertas (tipo_alerta, severidad);

CREATE TABLE clasificacion_logs (
  id_log             INT PRIMARY KEY,
  id_solicitud       INT NOT NULL,
  texto_original     VARCHAR(500) NOT NULL,
  id_oficio_predicho INT NOT NULL,
  confianza          DECIMAL(4,3) NOT NULL,
  modelo_version     VARCHAR(40) NOT NULL,
  CONSTRAINT fk_logs_sol FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id_solicitud),
  CONSTRAINT fk_logs_ofi FOREIGN KEY (id_oficio_predicho) REFERENCES oficios(id_oficio)
);
CREATE INDEX idx_logs_solicitud ON clasificacion_logs (id_solicitud);
CREATE INDEX idx_logs_confianza ON clasificacion_logs (confianza DESC);
