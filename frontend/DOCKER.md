# 🐳 Guía de Docker para el Frontend

## Requisitos previos
- Docker instalado
- Docker Compose instalado (opcional, pero recomendado)

## 🚀 Opción 1: Usando Docker Compose (Recomendado - MÁS SIMPLE)

### Construir y arrancar la aplicación
```bash
docker-compose up --build
```

### Arrancar en segundo plano
```bash
docker-compose up -d
```

### Detener la aplicación
```bash
docker-compose down
```

### Ver logs
```bash
docker-compose logs -f
```

## 🔧 Opción 2: Usando Docker directamente

### Construir la imagen
```bash
docker build -t frontgaply .
```

### Ejecutar el contenedor
```bash
docker run -p 3000:3000 frontgaply
```

### Ejecutar en segundo plano
```bash
docker run -d -p 3000:3000 --name frontgaply-app frontgaply
```

### Detener el contenedor
```bash
docker stop frontgaply-app
```

### Ver logs
```bash
docker logs -f frontgaply-app
```

## 🌐 Acceder a la aplicación

Una vez iniciada, la aplicación estará disponible en:
```
http://localhost:3000
```

## 📝 Notas

- El Dockerfile usa un build multi-etapa optimizado para producción
- La imagen final es ligera (usa Alpine Linux)
- Se ejecuta con un usuario no-root por seguridad
- El modo `standalone` de Next.js reduce el tamaño de la imagen

## 🔄 Reconstruir después de cambios

```bash
docker-compose up --build
```

o

```bash
docker build -t frontgaply . && docker run -p 3000:3000 frontgaply
```

## 🛠️ Variables de entorno

Si necesitas variables de entorno, crea un archivo `.env` y descomenta las líneas en `docker-compose.yml`:

```yaml
env_file:
  - .env
```

