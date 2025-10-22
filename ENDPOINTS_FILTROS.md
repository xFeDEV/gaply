# Endpoints para Filtros Coordinados de Trabajadores

## 📋 Resumen

Se implementaron 4 endpoints para gestionar el listado y filtrado de trabajadores con **selects coordinados** que se actualizan dinámicamente según las opciones seleccionadas.

---

## 🎯 Endpoints Disponibles

### 1. **GET /trabajadores** - Listar trabajadores con filtros

Lista trabajadores ordenados por calificación (mayor a menor).

**Query Parameters (todos opcionales):**
- `ciudad_id` (int): Filtrar por ciudad
- `oficio_id` (int): Filtrar por oficio
- `calificacion_min` (float): Calificación mínima (1-5)
- `disponibilidad` (string): Estado de disponibilidad
- `tiene_arl` (boolean): Si tiene o no ARL

**Ejemplo:**
```bash
GET /trabajadores?ciudad_id=1&oficio_id=8&calificacion_min=4.0
```

**Respuesta:**
```json
{
  "total": 5,
  "filtros_aplicados": {
    "ciudad_id": 1,
    "oficio_id": 8,
    "calificacion_min": 4.0
  },
  "trabajadores": [
    {
      "id_trabajador": 195,
      "nombre_completo": "Santiago Rojas Castro",
      "telefono": "3126188664",
      "email": "santiago.rojas@gmail.com",
      "anos_experiencia": 11,
      "calificacion_promedio": 5.0,
      "disponibilidad": "HOY",
      "cobertura_km": 15,
      "tiene_arl": true,
      "tipo_persona": "Natural",
      "barrio": {
        "id_barrio": 1,
        "nombre_barrio": "Teusaquillo",
        "estrato": 3,
        "ciudad": "Bogotá",
        "departamento": "Cundinamarca",
        "region": "Andina"
      },
      "oficios": [
        {
          "id_oficio": 8,
          "nombre_oficio": "Mudanzas",
          "tarifa_hora_promedio": 45000,
          "tarifa_visita": 80000,
          "certificaciones": "Certificado transporte carga"
        }
      ]
    }
  ]
}
```

---

### 2. **GET /ciudades** - Listar ciudades con trabajadores

Lista todas las ciudades que tienen trabajadores registrados.

**Query Parameters:**
- `con_trabajadores` (boolean, default=true): Solo ciudades con trabajadores

**Ejemplo:**
```bash
GET /ciudades
```

**Respuesta:**
```json
{
  "total": 10,
  "ciudades": [
    {
      "id_ciudad": 1,
      "nombre_ciudad": "Bogotá",
      "departamento": "Cundinamarca",
      "region": "Andina",
      "total_trabajadores": 23
    },
    {
      "id_ciudad": 2,
      "nombre_ciudad": "Medellín",
      "departamento": "Antioquia",
      "region": "Andina",
      "total_trabajadores": 18
    }
  ]
}
```

---

### 3. **GET /oficios** - Listar oficios disponibles

Lista todos los oficios que tienen trabajadores registrados.

**Query Parameters:**
- `ciudad_id` (int, opcional): Filtrar oficios disponibles en esta ciudad
- `con_trabajadores` (boolean, default=true): Solo oficios con trabajadores

**Ejemplo (oficios en Bogotá):**
```bash
GET /oficios?ciudad_id=1
```

**Respuesta:**
```json
{
  "total": 11,
  "oficios": [
    {
      "id_oficio": 1,
      "nombre_oficio": "Plomería",
      "categoria_servicio": "Hogar",
      "descripcion": "Servicios de plomería para hogares/negocios.",
      "total_trabajadores": 3
    },
    {
      "id_oficio": 8,
      "nombre_oficio": "Mudanzas",
      "categoria_servicio": "Transporte",
      "descripcion": "Servicios de mudanzas locales y nacionales.",
      "total_trabajadores": 7
    }
  ]
}
```

---

### 4. **GET /trabajadores/filtros/disponibles** - Opciones dinámicas según filtros

Retorna las opciones disponibles para cada filtro basándose en los filtros ya aplicados.

**Query Parameters:**
- `ciudad_id` (int, opcional): Si se especifica, retorna oficios disponibles en esa ciudad
- `oficio_id` (int, opcional): Si se especifica, retorna ciudades donde hay trabajadores de ese oficio

**Ejemplo (después de seleccionar Bogotá):**
```bash
GET /trabajadores/filtros/disponibles?ciudad_id=1
```

**Respuesta:**
```json
{
  "ciudades_disponibles": [...],
  "oficios_disponibles": [
    {
      "id_oficio": 1,
      "nombre_oficio": "Plomería",
      "categoria_servicio": "Hogar",
      "descripcion": "Servicios de plomería...",
      "total_trabajadores": 3
    }
  ],
  "calificacion_min_sugerida": 3.17,
  "calificacion_max_disponible": 5.0,
  "disponibilidades": ["HOY", "INMEDIATA", "PROGRAMADA"],
  "tiene_arl_count": {
    "con_arl": 19,
    "sin_arl": 4
  }
}
```

---

## 🎨 Flujo de Uso en el Frontend

### Flujo Recomendado: Selects Coordinados

```javascript
// 1. Al cargar la página, obtener ciudades
const ciudades = await fetch('/ciudades').then(r => r.json());
// Poblar select de ciudades

// 2. Cuando el usuario selecciona una ciudad
const onCiudadChange = async (ciudadId) => {
  // Actualizar oficios disponibles en esa ciudad
  const oficios = await fetch(`/oficios?ciudad_id=${ciudadId}`).then(r => r.json());
  // Actualizar select de oficios
  
  // También obtener rangos de calificación disponibles
  const filtros = await fetch(`/trabajadores/filtros/disponibles?ciudad_id=${ciudadId}`)
    .then(r => r.json());
  // Actualizar slider de calificación con min/max reales
};

// 3. Cuando el usuario selecciona un oficio (y ya hay ciudad)
const onOficioChange = async (ciudadId, oficioId) => {
  // Buscar trabajadores con esos filtros
  const trabajadores = await fetch(
    `/trabajadores?ciudad_id=${ciudadId}&oficio_id=${oficioId}`
  ).then(r => r.json());
  // Mostrar lista de trabajadores
};

// 4. Aplicar filtros adicionales (calificación, ARL, etc.)
const onFiltrosChange = async (filtros) => {
  const params = new URLSearchParams(filtros);
  const trabajadores = await fetch(`/trabajadores?${params}`).then(r => r.json());
  // Actualizar lista
};
```

### Flujo Alternativo: Selects Independientes

```javascript
// Cargar todas las opciones al inicio
const [ciudades, oficios] = await Promise.all([
  fetch('/ciudades').then(r => r.json()),
  fetch('/oficios').then(r => r.json())
]);

// Aplicar filtros cuando el usuario haga submit
const onBuscar = async (filtros) => {
  const params = new URLSearchParams(filtros);
  const trabajadores = await fetch(`/trabajadores?${params}`).then(r => r.json());
  // Mostrar resultados
};
```

---

## 🧪 Ejemplos de Prueba con cURL / PowerShell

### PowerShell (Windows)

```powershell
# Listar todas las ciudades con trabajadores
curl http://localhost:8000/ciudades | ConvertFrom-Json

# Listar oficios disponibles en Bogotá (id=1)
curl "http://localhost:8000/oficios?ciudad_id=1" | ConvertFrom-Json

# Buscar electricistas en Medellín con calificación >= 4.5
curl "http://localhost:8000/trabajadores?ciudad_id=2&oficio_id=2&calificacion_min=4.5" | ConvertFrom-Json

# Obtener filtros disponibles después de seleccionar ciudad
curl "http://localhost:8000/trabajadores/filtros/disponibles?ciudad_id=1" | ConvertFrom-Json
```

### cURL (Linux/Mac)

```bash
# Listar todas las ciudades con trabajadores
curl http://localhost:8000/ciudades | jq

# Listar oficios disponibles en Bogotá (id=1)
curl "http://localhost:8000/oficios?ciudad_id=1" | jq

# Buscar electricistas en Medellín con calificación >= 4.5
curl "http://localhost:8000/trabajadores?ciudad_id=2&oficio_id=2&calificacion_min=4.5" | jq

# Obtener filtros disponibles después de seleccionar ciudad
curl "http://localhost:8000/trabajadores/filtros/disponibles?ciudad_id=1" | jq
```

---

## 📊 Ventajas de Este Enfoque

### ✅ Backend hace el trabajo pesado
- El frontend solo consume datos listos para usar
- No necesita lógica compleja de filtrado
- Menos código en JavaScript

### ✅ Selects coordinados
- Al elegir ciudad → se actualizan oficios disponibles en esa ciudad
- Al elegir oficio → se actualizan ciudades donde hay trabajadores
- Rango de calificación se ajusta según datos reales

### ✅ Performance optimizada
- Queries SQL eficientes con JOINs y GROUP BY
- El backend cuenta los registros disponibles
- Frontend solo muestra opciones válidas

### ✅ UX mejorada
- Usuario nunca ve opciones vacías
- Los contadores (`total_trabajadores`) ayudan a tomar decisiones
- Feedback instantáneo de cuántos resultados habrá

---

## 🔄 Resumen de Responsabilidades

| Responsabilidad | Backend | Frontend |
|----------------|---------|----------|
| **Filtrado de datos** | ✅ Queries SQL con WHERE/JOIN | ❌ |
| **Ordenamiento** | ✅ ORDER BY calificación DESC | ❌ |
| **Conteo de opciones** | ✅ Retorna `total_trabajadores` | ❌ |
| **Validación de filtros** | ✅ Solo retorna datos válidos | ❌ |
| **UI/UX (selects, inputs)** | ❌ | ✅ |
| **Actualización dinámica** | ❌ | ✅ Llamadas API según interacción |
| **Formateo/presentación** | ❌ | ✅ Tarjetas, tablas, etc. |

---

## 🚀 Próximos Pasos Recomendados

1. **Paginación:** Agregar `?page=1&limit=20` al endpoint `/trabajadores`
2. **Búsqueda por texto:** Agregar `?search=nombre` para buscar por nombre
3. **Ordenamiento flexible:** Agregar `?order_by=experiencia` o `?order_by=precio`
4. **Caché:** Implementar caché en endpoints de ciudades/oficios (cambian poco)
5. **Geolocalización:** Filtrar por distancia desde ubicación del usuario

---

## 📞 Endpoints Relacionados

- `GET /` - Documentación de todos los endpoints disponibles
- `GET /health` - Health check del servicio
- `GET /docs` - Documentación interactiva de Swagger/OpenAPI

---

**Última actualización:** 22 de octubre de 2025
