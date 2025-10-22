"""
Pruebas de casos de uso con datos faltantes o incompletos
"""
import requests
import json

base_url = "http://localhost:8000"

def probar_caso(titulo, endpoint, datos, descripcion=""):
    """Función auxiliar para probar casos"""
    print(f"\n{'='*50}")
    print(f"🧪 {titulo}")
    print(f"📝 {descripcion}")
    print(f"🔗 {endpoint}")
    print(f"📊 Datos: {json.dumps(datos, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(f"{base_url}{endpoint}", json=datos)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Mostrar información relevante
            if 'analisis' in result:
                analisis = result['analisis']
                print(f"🔍 Oficio: {analisis.get('nombre_oficio_sugerido', 'N/A')}")
                print(f"🚨 Urgencia: {analisis.get('urgencia_inferida', 'N/A')}")
                print(f"📊 Confianza: {analisis.get('confianza', 0)}")
            
            if 'alertas' in result:
                alertas = result['alertas']['alertas_detectadas']
                if alertas:
                    print("🚨 ALERTAS DETECTADAS:")
                    for alerta in alertas:
                        print(f"   • {alerta['tipo_alerta']}: {alerta['detalle']}")
                else:
                    print("✅ Sin alertas")
            
            if 'solicitud_creada' in result and result['solicitud_creada']:
                solicitud = result['solicitud_creada']
                print(f"📝 Solicitud ID: {solicitud['id_solicitud']}")
                print(f"🎯 Estado: {solicitud['estado']}")
            
            print(f"🎯 Decisión: {result.get('decision_final', 'N/A')}")
            print(f"💬 Mensaje: {result.get('mensaje_usuario', 'N/A')}")
            
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

# =============================================================================
# CASOS DE PRUEBA
# =============================================================================

print("🚀 PROBANDO MANEJO DE DATOS FALTANTES EN PIPELINE A2A")

# CASO 1: Sin ubicación del usuario
probar_caso(
    "CASO 1: Sin Ubicación",
    "/solicitudes/procesar-completa",
    {
        "texto_usuario": "Necesito un plomero urgente, se me rompió la ducha",
        # id_barrio_usuario: FALTA
    },
    "El usuario no proporcionó su ubicación"
)

# CASO 2: Sin nombre identificable
probar_caso(
    "CASO 2: Sin Nombre Identificable", 
    "/solicitudes/procesar-completa",
    {
        "texto_usuario": "Mi aire acondicionado no funciona, necesito técnico",
        "id_barrio_usuario": 1
    },
    "No se puede identificar el nombre del usuario en el texto"
)

# CASO 3: Descripción muy vaga (confianza baja)
probar_caso(
    "CASO 3: Descripción Muy Vaga",
    "/solicitudes/procesar-completa", 
    {
        "texto_usuario": "Algo no funciona en casa",
        "id_barrio_usuario": 1
    },
    "Descripción extremadamente vaga que debería generar confianza baja"
)

# CASO 4: Con todos los datos (caso exitoso)
probar_caso(
    "CASO 4: Datos Completos",
    "/solicitudes/procesar-completa",
    {
        "texto_usuario": "Hola, soy María González y necesito un plomero urgente, se me rompió el inodoro",
        "id_barrio_usuario": 1
    },
    "Caso exitoso con nombre identificable y ubicación"
)

# CASO 5: Intentar guardar sin ubicación (debería fallar)
probar_caso(
    "CASO 5: Guardar Sin Ubicación",
    "/solicitudes/procesar-y-guardar",
    {
        "texto_usuario": "Necesito un electricista, soy Pedro López"
        # id_barrio_usuario: FALTA
    },
    "Intentar guardar en BD sin ubicación (debería fallar)"
)

# CASO 6: Guardar con todos los datos
probar_caso(
    "CASO 6: Guardar Completo",
    "/solicitudes/procesar-y-guardar", 
    {
        "texto_usuario": "Soy Ana Martínez, necesito un técnico de aires acondicionados urgente",
        "id_barrio_usuario": 1
    },
    "Guardar en BD con datos completos (debería crear solicitud real)"
)

print(f"\n{'='*50}")
print("🏁 PRUEBAS COMPLETADAS")
print("📋 Verificar que el sistema maneja correctamente:")
print("   • Datos faltantes con alertas apropiadas")
print("   • Extracción de nombres del texto")
print("   • Validación antes de guardar en BD")
print("   • IDs simulados vs reales")