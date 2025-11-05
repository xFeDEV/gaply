═══════════════════════════════════════════════════════════════════════════════
SISTEMA: TASKPRO – Conexión de Servicios Técnicos (Colombia)
Contexto: Marketplace que reduce la fricción entre necesidades urgentes y trabajadores
calificados, con enfoque en clasificación (NLP), recomendación y señales de alerta.
Zona horaria: COT (UTC-5). Moneda: COP. Codificación: UTF-8.
═══════════════════════════════════════════════════════════════════════════════

ENTIDAD: CIUDADES
Descripción: Catálogo de ciudades colombianas habilitadas.
Columnas
───────────────────────────────────────────────────────────────────────────────
id_ciudad               INTEGER         PK
nombre_ciudad           VARCHAR(80)     NOT NULL
departamento            VARCHAR(80)     NOT NULL
region                  VARCHAR(40)     NOT NULL CHECK (region IN ('Andina','Caribe','Pacífico','Eje Cafetero'))
codigo_postal_base      INTEGER         NOT NULL

Índices:
  - idx_ciudades_nombre (nombre_ciudad)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: BARRIOS
Descripción: Barrios/localidades por ciudad y estrato.
Columnas
───────────────────────────────────────────────────────────────────────────────
id_barrio               INTEGER         PK
id_ciudad               INTEGER         FK → CIUDADES.id_ciudad
nombre_barrio           VARCHAR(100)    NOT NULL
estrato                 INTEGER         NOT NULL CHECK (estrato BETWEEN 1 AND 6)

Índices:
  - idx_barrios_ciudad (id_ciudad, nombre_barrio)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: OFICIOS
Descripción: Catálogo de oficios técnicos y su categoría de servicio.
Columnas
───────────────────────────────────────────────────────────────────────────────
id_oficio               INTEGER         PK
nombre_oficio           VARCHAR(100)    NOT NULL UNIQUE
categoria_servicio      VARCHAR(60)     NOT NULL
descripcion             VARCHAR(300)    NULL

Índices:
  - idx_oficios_categoria (categoria_servicio)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: SOLICITANTES
Descripción: Usuarios que demandan servicios (Habeas Data Ley 1581).
Columnas
───────────────────────────────────────────────────────────────────────────────
id_solicitante          INTEGER         PK
nombre_completo         VARCHAR(150)    NOT NULL
cedula                  VARCHAR(20)     UNIQUE NOT NULL
telefono                VARCHAR(20)     NOT NULL
email                   VARCHAR(150)    NULL UNIQUE
id_barrio               INTEGER         FK → BARRIOS.id_barrio
direccion               VARCHAR(120)    NOT NULL
acepta_habeas           BOOLEAN         NOT NULL DEFAULT TRUE
fecha_registro          DATE            NOT NULL

Índices:
  - idx_solicitantes_barrio (id_barrio)
  - idx_solicitantes_email (email)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: TRABAJADORES
Descripción: Ofertantes de servicios (PN o empresa). Señala formalidad (ARL).
Columnas
───────────────────────────────────────────────────────────────────────────────
id_trabajador           INTEGER         PK
nombre_completo         VARCHAR(150)    NOT NULL
identificacion          VARCHAR(20)     UNIQUE NOT NULL  -- cédula/NIT simulado
tipo_persona            VARCHAR(20)     NOT NULL CHECK (tipo_persona IN ('PN','SAS','Ltda','Persona Natural'))
telefono                VARCHAR(20)     NOT NULL
email                   VARCHAR(150)    NULL UNIQUE
id_barrio               INTEGER         FK → BARRIOS.id_barrio
direccion               VARCHAR(120)    NOT NULL
anos_experiencia        INTEGER         NOT NULL CHECK (anos_experiencia >= 0)
calificacion_promedio   DECIMAL(3,2)    NOT NULL CHECK (calificacion_promedio BETWEEN 1 AND 5)
disponibilidad          VARCHAR(15)     NOT NULL CHECK (disponibilidad IN ('INMEDIATA','HOY','PROGRAMADA'))
cobertura_km            INTEGER         NOT NULL CHECK (cobertura_km BETWEEN 1 AND 50)
tiene_arl               BOOLEAN         NOT NULL DEFAULT FALSE
fecha_registro          DATE            NOT NULL

Índices:
  - idx_trabajadores_barrio (id_barrio)
  - idx_trabajadores_dispon (disponibilidad)
  - idx_trabajadores_rating (calificacion_promedio DESC)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: TRABAJADOR_OFICIO
Descripción: Capacidades específicas por trabajador y oficio con tarifas.
Columnas
───────────────────────────────────────────────────────────────────────────────
id_trab_oficio          INTEGER         PK
id_trabajador           INTEGER         FK → TRABAJADORES.id_trabajador
id_oficio               INTEGER         FK → OFICIOS.id_oficio
tarifa_hora_promedio    INTEGER         NOT NULL CHECK (tarifa_hora_promedio >= 0)
tarifa_visita           INTEGER         NOT NULL CHECK (tarifa_visita >= 0)
certificaciones         VARCHAR(120)    NULL

Índices:
  - idx_to_trab_oficio (id_trabajador, id_oficio) UNIQUE

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: TARIFAS_MERCADO
Descripción: Rango de precios por oficio y ciudad (referencia mercado).
Columnas
───────────────────────────────────────────────────────────────────────────────
id_tarifa               INTEGER         PK
id_oficio               INTEGER         FK → OFICIOS.id_oficio
ciudad                  VARCHAR(80)     NOT NULL
precio_min              INTEGER         NOT NULL
precio_max              INTEGER         NOT NULL
fuente                  VARCHAR(120)    NOT NULL

Índices:
  - idx_tarifas_oficio_ciudad (id_oficio, ciudad)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: SOLICITUDES
Descripción: Requerimientos de servicio clasificados por oficio.
Columnas
───────────────────────────────────────────────────────────────────────────────
id_solicitud            INTEGER         PK
id_solicitante          INTEGER         FK → SOLICITANTES.id_solicitante
id_oficio               INTEGER         FK → OFICIOS.id_oficio
descripcion_usuario     VARCHAR(400)    NOT NULL
urgencia                VARCHAR(10)     NOT NULL CHECK (urgencia IN ('ALTA','MEDIA','BAJA'))
id_barrio_servicio      INTEGER         FK → BARRIOS.id_barrio
fecha_creacion          DATETIME        NOT NULL
estado                  VARCHAR(15)     NOT NULL CHECK (estado IN ('ABIERTA','EN_PROCESO','CERRADA','CANCELADA'))
precio_estimado_mercado INTEGER         NOT NULL
flag_alerta             BOOLEAN         NOT NULL DEFAULT FALSE

Índices:
  - idx_solicitudes_estado (estado, urgencia)
  - idx_solicitudes_barrio (id_barrio_servicio)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: RECOMENDACIONES
Descripción: Motor de matching y ranking (explicabilidad).
Columnas
───────────────────────────────────────────────────────────────────────────────
id_recomendacion        INTEGER         PK
id_solicitud            INTEGER         FK → SOLICITUDES.id_solicitud
id_trabajador           INTEGER         FK → TRABAJADORES.id_trabajador
score_relevancia        DECIMAL(4,3)    NOT NULL CHECK (score_relevancia BETWEEN 0 AND 1)
distancia_km            DECIMAL(5,2)    NOT NULL
motivo_top              VARCHAR(20)     NOT NULL CHECK (motivo_top IN ('cercania','experiencia','calificacion','tarifa'))
precio_estimado         INTEGER         NOT NULL
precio_propuesto        INTEGER         NOT NULL
explicacion             VARCHAR(500)    NULL
es_asignado             BOOLEAN         NOT NULL DEFAULT FALSE

Índices:
  - idx_recs_solicitud (id_solicitud)
  - idx_recs_trabajador (id_trabajador)
  - idx_recs_score (score_relevancia DESC)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: SERVICIOS
Descripción: Asignación y ejecución del servicio (cierre y costos).
Columnas
───────────────────────────────────────────────────────────────────────────────
id_servicio             INTEGER         PK
id_solicitud            INTEGER         FK → SOLICITUDES.id_solicitud
id_trabajador           INTEGER         FK → TRABAJADORES.id_trabajador
fecha_asignacion        DATETIME        NOT NULL
fecha_cierre            DATETIME        NULL
costo_final_cop         INTEGER         NOT NULL
aplica_iva              BOOLEAN         NOT NULL DEFAULT FALSE
valor_iva_cop           INTEGER         NOT NULL DEFAULT 0
retencion_fuente_cop    INTEGER         NOT NULL DEFAULT 0
estado                  VARCHAR(15)     NOT NULL CHECK (estado IN ('ASIGNADO','EJECUCION','FINALIZADO','CANCELADO'))

Índices:
  - idx_servicios_estados (estado, fecha_asignacion)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: CALIFICACIONES
Descripción: Evaluaciones de calidad de ambas partes.
Columnas
───────────────────────────────────────────────────────────────────────────────
id_calificacion         INTEGER         PK
id_servicio             INTEGER         FK → SERVICIOS.id_servicio
quien_califica          VARCHAR(15)     NOT NULL CHECK (quien_califica IN ('SOLICITANTE','TRABAJADOR'))
puntaje                 DECIMAL(2,1)    NOT NULL CHECK (puntaje BETWEEN 1 AND 5)
comentario              VARCHAR(500)    NULL
fecha                   DATE            NOT NULL

Índices:
  - idx_calificaciones_servicio (id_servicio)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: ALERTAS
Descripción: Señales de riesgo/anomalías detectadas.
Columnas
───────────────────────────────────────────────────────────────────────────────
id_alerta               INTEGER         PK
id_solicitud            INTEGER         NULL FK → SOLICITUDES.id_solicitud
id_recomendacion        INTEGER         NULL FK → RECOMENDACIONES.id_recomendacion
tipo_alerta             VARCHAR(30)     NOT NULL CHECK (tipo_alerta IN ('PRECIO_ANOMALO','TEXTO_RIESGO','UBICACION_INCONSISTENTE'))
severidad               VARCHAR(10)     NOT NULL CHECK (severidad IN ('BAJA','MEDIA','ALTA'))
detalle                 VARCHAR(400)    NOT NULL
fecha                   DATE            NOT NULL

Índices:
  - idx_alertas_tipo (tipo_alerta, severidad)

───────────────────────────────────────────────────────────────────────────────
ENTIDAD: CLASIFICACION_LOGS
Descripción: Trazabilidad de la clasificación (NLP) por solicitud.
Columnas
───────────────────────────────────────────────────────────────────────────────
id_log                  INTEGER         PK
id_solicitud            INTEGER         FK → SOLICITUDES.id_solicitud
texto_original          VARCHAR(500)    NOT NULL
id_oficio_predicho      INTEGER         FK → OFICIOS.id_oficio
confianza               DECIMAL(4,3)    NOT NULL CHECK (confianza BETWEEN 0 AND 1)
modelo_version          VARCHAR(40)     NOT NULL

Índices:
  - idx_logs_solicitud (id_solicitud)
  - idx_logs_confianza (confianza DESC)

═══════════════════════════════════════════════════════════════════════════════
RELACIONES ENTRE ENTIDADES
═══════════════════════════════════════════════════════════════════════════════
(1) CIUDADES 1:N BARRIOS
    FK: BARRIOS.id_ciudad → CIUDADES.id_ciudad
    Una ciudad tiene muchos barrios.

(2) BARRIOS 1:N SOLICITANTES
    FK: SOLICITANTES.id_barrio → BARRIOS.id_barrio

(3) BARRIOS 1:N TRABAJADORES
    FK: TRABAJADORES.id_barrio → BARRIOS.id_barrio

(4) OFICIOS 1:N TRABAJADOR_OFICIO
    FK: TRABAJADOR_OFICIO.id_oficio → OFICIOS.id_oficio

(5) TRABAJADORES 1:N TRABAJADOR_OFICIO
    FK: TRABAJADOR_OFICIO.id_trabajador → TRABAJADORES.id_trabajador

(6) SOLICITANTES 1:N SOLICITUDES
    FK: SOLICITUDES.id_solicitante → SOLICITANTES.id_solicitante

(7) OFICIOS 1:N SOLICITUDES
    FK: SOLICITUDES.id_oficio → OFICIOS.id_oficio

(8) BARRIOS 1:N SOLICITUDES
    FK: SOLICITUDES.id_barrio_servicio → BARRIOS.id_barrio

(9) SOLICITUDES 1:N RECOMENDACIONES
    FK: RECOMENDACIONES.id_solicitud → SOLICITUDES.id_solicitud

(10) TRABAJADORES 1:N RECOMENDACIONES
     FK: RECOMENDACIONES.id_trabajador → TRABAJADORES.id_trabajador

(11) SOLICITUDES 1:N SERVICIOS
     FK: SERVICIOS.id_solicitud → SOLICITUDES.id_solicitud

(12) TRABAJADORES 1:N SERVICIOS
     FK: SERVICIOS.id_trabajador → TRABAJADORES.id_trabajador

(13) SERVICIOS 1:N CALIFICACIONES
     FK: CALIFICACIONES.id_servicio → SERVICIOS.id_servicio

(14) SOLICITUDES 1:N CLASIFICACION_LOGS
     FK: CLASIFICACION_LOGS.id_solicitud → SOLICITUDES.id_solicitud

(15) OFICIOS 1:N CLASIFICACION_LOGS
     FK: CLASIFICACION_LOGS.id_oficio_predicho → OFICIOS.id_oficio

(16) SOLICITUDES 1:N ALERTAS (opcional)
     FK opcional: ALERTAS.id_solicitud → SOLICITUDES.id_solicitud

(17) RECOMENDACIONES 1:N ALERTAS (opcional)
     FK opcional: ALERTAS.id_recomendacion → RECOMENDACIONES.id_recomendacion

───────────────────────────────────────────────────────────────────────────────
DIAGRAMA ASCII (simplificado)
───────────────────────────────────────────────────────────────────────────────
[CIUDADES] 1───N [BARRIOS] ──1───N [SOLICITANTES]
                      │                  │
                      │                  └──1───N [SOLICITUDES] ─1──N [RECOMENDACIONES] ─┐
                      │                                │          │                       │
                      └──1───N [TRABAJADORES] ─1───N [TRABAJADOR_OFICIO]                  │
                                   │                         │                            │
                                   └──────────────► [OFICIOS] ◄───────────── [CLASIFICACION_LOGS]
                                                    │
                                                    └─(ref) [TARIFAS_MERCADO]
[RECOMENDACIONES] ──(opc)──► [ALERTAS] ◄──(opc)── [SOLICITUDES]
[RECOMENDACIONES] ──1───N [SERVICIOS] ─1───N [CALIFICACIONES]

───────────────────────────────────────────────────────────────────────────────
REGLAS DE NEGOCIO
───────────────────────────────────────────────────────────────────────────────
- Una SOLICITUD debe pertenecer a un SOLICITANTE, a un BARRIO y a un OFICIO.
- Una RECOMENDACIÓN siempre referencia una SOLICITUD y un TRABAJADOR; guarda score,
  distancia, precios y explicación del porqué (XAI mínima).
- Un SERVICIO nace de una RECOMENDACIÓN aceptada (no se impone FK directa para flexibilidad);
  siempre referencia SOLICITUD y TRABAJADOR.
- CALIFICACIONES se registran por servicio y pueden ser de cualquiera de las partes.
- ALERTAS pueden asociarse a SOLICITUDES o RECOMENDACIONES (o ambas). Una alerta no bloquea,
  pero debe ser visible en el flujo.
- TARIFAS_MERCADO sirve para validar y explicar estimaciones y anomalías de precios por ciudad.
- CLASIFICACION_LOGS permite trazabilidad de decisiones de NLP (texto, etiqueta y confianza).
- Cumplimiento Ley 1581 (Habeas Data): SOLICITANTES.acepta_habeas controla comunicaciones.
- SARLAFT ligero: TRABAJADORES.tiene_arl y tipo_persona ayudan a perfilar formalidad.

───────────────────────────────────────────────────────────────────────────────
NOTAS TÉCNICAS
───────────────────────────────────────────────────────────────────────────────
- Fechas en formato ISO: DATE (YYYY-MM-DD), DATETIME (YYYY-MM-DD HH:MM:SS).
- Booleans: compatibles con PostgreSQL/MySQL/SQL Server.
- Teléfonos en formato móvil Colombia (3xx).
- Direcciones: Calle/Carrera/Transversal/Diagonal # N-NN.
- Identificación: cédula/NIT simulados; no corresponden a personas reales.
- Moneda: COP sin separadores; IVA al 19% cuando aplica.
- Índices optimizan búsquedas por estado/urgencia, score y geografía.
