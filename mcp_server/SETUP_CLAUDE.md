# 🤖 Configuración del Servidor MCP para Claude Desktop

## Paso 1: Instalar el Servidor MCP

Abre PowerShell en el directorio del proyecto y ejecuta:

```powershell
cd mcp_server
pip install -e .
```

## Paso 2: Verificar que el Backend esté corriendo

```powershell
# Inicia el backend si no está corriendo
cd ..
docker-compose -f docker-compose.local.yml up -d

# Verifica que esté funcionando
curl http://localhost:8000/health
```

Deberías ver: `{"status":"ok","service":"TaskPro Backend"}`

## Paso 3: Configurar Claude Desktop

### Ubicar el archivo de configuración

En Windows, el archivo está en:
```
%APPDATA%\Claude\claude_desktop_config.json
```

Ruta completa típica:
```
C:\Users\[TuUsuario]\AppData\Roaming\Claude\claude_desktop_config.json
```

### Editar el archivo de configuración

Si el archivo no existe, créalo. Agrega esta configuración:

```json
{
  "mcpServers": {
    "taskpro": {
      "command": "python",
      "args": [
        "C:\\Users\\santi\\OneDrive\\Documentos\\GitHub\\gaply\\mcp_server\\server.py"
      ],
      "env": {
        "BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}
```

**⚠️ IMPORTANTE:** Reemplaza la ruta con la ruta absoluta a tu `server.py`

### Encontrar tu ruta

En PowerShell, ejecuta:
```powershell
cd C:\Users\santi\OneDrive\Documentos\GitHub\gaply\mcp_server
(Get-Location).Path + "\server.py"
```

Copia el resultado completo (con barras invertidas dobles `\\`) y pégalo en el archivo de configuración.

## Paso 4: Reiniciar Claude Desktop

1. Cierra completamente Claude Desktop (menú > Salir)
2. Vuelve a abrir Claude Desktop
3. Verifica que el servidor esté activo:
   - Busca el ícono de herramientas (🔨) en la interfaz
   - Deberías ver "taskpro" listado como servidor disponible

## Paso 5: Probar las Herramientas

### Herramienta 1: `analyze_solicitud`

Pregunta a Claude:

> "Analiza esta solicitud: 'Necesito un plomero urgente, se me rompió un caño en la cocina y está saliendo agua por todos lados'"

Claude debería:
- Usar automáticamente la herramienta `analyze_solicitud`
- Mostrar: oficio (Plomero), urgencia (Alta), precio estimado, explicación

### Herramienta 2: `create_solicitud`

Después del análisis, confirma:

> "Perfecto, crea la solicitud"

Claude debería:
- Usar automáticamente la herramienta `create_solicitud`
- Crear el registro en la base de datos
- Mostrar ID de solicitud generado y detalles

## Troubleshooting

### ❌ Claude no detecta el servidor

**Problema:** No aparece el ícono de herramientas

**Soluciones:**
1. Verifica que la ruta en `claude_desktop_config.json` sea correcta y use `\\`
2. Asegúrate de haber reiniciado Claude completamente (no minimizar, sino cerrar)
3. Revisa los logs de Claude en: `%APPDATA%\Claude\logs\mcp-server-taskpro.log`

### ❌ Error: "Connection refused"

**Problema:** El servidor MCP no puede conectar con el backend

**Soluciones:**
1. Verifica que el backend esté corriendo: `docker ps`
2. Prueba manualmente: `curl http://localhost:8000/health`
3. Si usas WSL o Docker Desktop, asegúrate de que los puertos estén expuestos

### ❌ Error: "No module named 'mcp'"

**Problema:** Las dependencias del servidor MCP no están instaladas

**Solución:**
```powershell
cd mcp_server
pip install -e .
```

### ❌ Claude ejecuta la herramienta pero no obtiene respuesta

**Problema:** El backend no tiene datos cargados

**Solución:**
```powershell
# Cargar datos de ejemplo
docker exec -i gaply-postgres-1 psql -U taskpro_user -d taskpro_db < backend/datos_ejemplo.sql
```

## Verificar que todo funciona

### Test completo

1. **Backend corriendo:**
   ```powershell
   curl http://localhost:8000/health
   ```
   ✅ Debería retornar: `{"status":"ok",...}`

2. **Datos cargados:**
   ```powershell
   curl http://localhost:8000/solicitudes/analizar -Method Post -ContentType "application/json" -Body '{"texto_usuario":"plomero urgente"}'
   ```
   ✅ Debería retornar JSON con análisis

3. **Claude Desktop configurado:**
   - Abre Claude Desktop
   - Busca el ícono 🔨 en la interfaz
   - Deberías ver "taskpro" listado

4. **Herramientas funcionando:**
   - Pide a Claude: "analiza esta solicitud: plomero urgente"
   - Claude debería usar la herramienta automáticamente

## Comandos Útiles

### Ver logs del servidor MCP
```powershell
Get-Content "$env:APPDATA\Claude\logs\mcp-server-taskpro.log" -Tail 50
```

### Probar el servidor MCP manualmente (avanzado)
```powershell
cd mcp_server
python server.py
# Debería esperar entrada en stdin (Ctrl+C para salir)
```

### Ver configuración actual de Claude
```powershell
Get-Content "$env:APPDATA\Claude\claude_desktop_config.json"
```

## Próximos Pasos

Una vez configurado, puedes:

1. **Probar casos de uso complejos:**
   - "Analiza: necesito un técnico de aires acondicionados, el mío no prende y hace ruidos raros"
   - "Crea una solicitud para reparar mi nevera que no enfría"

2. **Explorar capacidades del Agente Analista:**
   - Detección de urgencia (palabras clave)
   - Estimación de precios
   - Identificación de señales de alerta
   - Preguntas aclaratorias

3. **Flujo completo A2A:**
   - Análisis previo → Revisión del usuario → Confirmación → Creación en BD

## Documentación Adicional

- **README principal:** `../README.md`
- **README del servidor MCP:** `README.md` (en este directorio)
- **Documentación de MCP:** https://modelcontextprotocol.io/
- **Gemini API:** https://ai.google.dev/

---

**¿Todo listo?** 🎉 ¡Empieza a usar TaskPro con Claude Desktop!
