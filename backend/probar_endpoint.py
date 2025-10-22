"""
Prueba del endpoint procesar-completa sin base de datos
"""
import requests
import json

# URL del endpoint
url = "http://localhost:8000/solicitudes/procesar-completa"

# Datos de prueba
data = {
    "texto_usuario": "Necesito un plomero urgente, se rompió mi inodoro, es para daniel caicedo",
    "id_barrio_usuario": 1
}

print("🚀 Probando endpoint del pipeline A2A...")
print(f"📝 Solicitud: {data['texto_usuario']}")
print(f"🔗 URL: {url}")
print("")

try:
    response = requests.post(url, json=data)
    
    print(f"📊 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Respuesta exitosa!")
        print("")
        print("🔍 ANÁLISIS:")
        analisis = result.get('analisis', {})
        print(f"   - Oficio sugerido: {analisis.get('nombre_oficio_sugerido', 'N/A')}")
        print(f"   - Urgencia: {analisis.get('urgencia_inferida', 'N/A')}")
        print(f"   - Confianza: {analisis.get('confianza', 0)}")
        print(f"   - Explicación: {analisis.get('explicacion', 'N/A')}")
        
        print("")
        print("🎯 RECOMENDACIONES:")
        recomendaciones = result.get('recomendaciones')
        if recomendaciones:
            trabajadores = recomendaciones.get('trabajadores_recomendados', [])
            for i, trabajador in enumerate(trabajadores[:3], 1):
                print(f"   {i}. {trabajador.get('nombre_completo')} (Score: {trabajador.get('score_relevancia'):.2f})")
        else:
            print("   - No disponibles")
        
        print("")
        print("🛡️ ALERTAS:")
        alertas = result.get('alertas', {})
        alertas_detectadas = alertas.get('alertas_detectadas', [])
        if alertas_detectadas:
            for alerta in alertas_detectadas:
                print(f"   - {alerta.get('tipo_alerta')}: {alerta.get('detalle')}")
        else:
            print("   - Sin alertas")
        
        print("")
        print(f"⚡ Tiempo procesamiento: {result.get('tiempo_procesamiento_ms')} ms")
        print(f"🧠 Agentes ejecutados: {', '.join(result.get('agentes_ejecutados', []))}")
        print(f"🎯 Decisión final: {result.get('decision_final')}")
        print(f"💬 Mensaje usuario: {result.get('mensaje_usuario')}")
        
    else:
        print(f"❌ Error {response.status_code}")
        try:
            error_data = response.json()
            print(f"   Detalle: {error_data.get('detail', 'Error desconocido')}")
        except:
            print(f"   Respuesta: {response.text}")

except requests.exceptions.ConnectionError:
    print("❌ No se pudo conectar al servidor backend")
    print("   ¿Está ejecutándose uvicorn en el puerto 8000?")
except Exception as e:
    print(f"❌ Error inesperado: {e}")