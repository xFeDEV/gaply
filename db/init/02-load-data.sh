#!/bin/bash
set -e

# Script para cargar los CSVs en la BD
# Se ejecuta automáticamente por docker-entrypoint-initdb.d/
# después del schema (01-schema.sql) gracias al orden alfabético.

PGUSER="${POSTGRES_USER:-gaply}"
PGDB="${POSTGRES_DB:-gaplyTester}"
CSV_DIR="/csv-data"

echo "================================================"
echo "  Cargando datos CSV en la base de datos..."
echo "================================================"

# Orden de carga respetando dependencias de FK
TABLES=(
  "ciudades"
  "barrios"
  "oficios"
  "solicitantes"
  "trabajadores"
  "trabajador_oficio"
  "tarifas_mercado"
  "solicitudes"
  "recomendaciones"
  "servicios"
  "calificaciones"
  "alertas"
  "clasificacion_logs"
)

for TABLE in "${TABLES[@]}"; do
  CSV_FILE="${CSV_DIR}/${TABLE}.csv"
  if [ -f "$CSV_FILE" ]; then
    echo "→ Cargando ${TABLE}..."
    psql -U "$PGUSER" -d "$PGDB" -c "\COPY ${TABLE} FROM '${CSV_FILE}' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
    COUNT=$(psql -U "$PGUSER" -d "$PGDB" -t -c "SELECT COUNT(*) FROM ${TABLE};")
    echo "  ✓ ${TABLE}: ${COUNT} registros"
  else
    echo "  ⚠ Archivo no encontrado: ${CSV_FILE}"
  fi
done

echo ""
echo "================================================"
echo "  ✅ Carga de datos completada"
echo "================================================"
