"""
Prueba del endpoint de prueba con datos simulados
"""
import requests
import json

# URL del endpoint de prueba
url = "http://localhost:8000/test/procesar-sin-bd"

# Datos de prueba
data = {
    "texto_usuario": "Necesito un plomero urgente, se me rompió el inodoro y hay agua por todos lados",
    "id_barrio_usuario": 1
}

print("🧪 Probando endpoint de PRUEBA (datos simulados)...")
print(f"📝 Solicitud: {data['texto_usuario']}")
print(f"🔗 URL: {url}")
print("")

try:
    response = requests.post(url, json=data)
    
    print(f"📊 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ ¡Pipeline A2A funcionando perfectamente!")
        print("")
        
        # Análisis detallado
        analisis = result.get('analisis', {})
        print("🔍 **AGENTE ANALISTA:**")
        print(f"   ✓ Oficio identificado: {analisis.get('nombre_oficio_sugerido')} (ID: {analisis.get('id_oficio_sugerido')})")
        print(f"   ✓ Urgencia detectada: {analisis.get('urgencia_inferida').upper()}")
        print(f"   ✓ Precio estimado: ${analisis.get('precio_mercado_estimado')} COP")
        print(f"   ✓ Confianza: {analisis.get('confianza'):.1%}")
        print(f"   📝 Descripción normalizada: {analisis.get('descripcion_normalizada')}")
        
        # Recomendaciones
        recomendaciones = result.get('recomendaciones')
        if recomendaciones:
            print("")
            print("🎯 **AGENTE RECOMENDADOR:**")
            trabajadores = recomendaciones.get('trabajadores_recomendados', [])
            print(f"   📊 Total candidatos encontrados: {recomendaciones.get('total_candidatos_encontrados')}")
            print(f"   🏆 TOP {len(trabajadores)} recomendados:")
            
            for i, trabajador in enumerate(trabajadores, 1):
                print(f"      {i}. **{trabajador.get('nombre_completo')}**")
                print(f"         • Score: {trabajador.get('score_relevancia'):.2f}/1.0")
                print(f"         • Experiencia: {trabajador.get('anos_experiencia')} años")
                print(f"         • Calificación: {trabajador.get('calificacion_promedio')}⭐")
                print(f"         • Distancia: {trabajador.get('distancia_km')} km")
                print(f"         • Precio propuesto: ${trabajador.get('precio_propuesto')} COP")
                print(f"         • Motivo: {trabajador.get('motivo_top')}")
                print(f"         • ARL: {'✅' if trabajador.get('tiene_arl') else '❌'}")
                print(f"         • Explicación: {trabajador.get('explicacion')}")
                print("")
        
        # Alertas de seguridad
        alertas = result.get('alertas', {})
        print("🛡️ **AGENTE GUARDIAN:**")
        print(f"   📊 Score de riesgo general: {alertas.get('score_riesgo_general'):.2f}/1.0")
        
        alertas_detectadas = alertas.get('alertas_detectadas', [])
        if alertas_detectadas:
            print(f"   ⚠️ Alertas detectadas ({len(alertas_detectadas)}):")
            for alerta in alertas_detectadas:
                severidad_emoji = {'critica': '🔴', 'alta': '🟠', 'media': '🟡', 'baja': '🟢'}.get(alerta.get('severidad'), '⚪')
                print(f"      {severidad_emoji} **{alerta.get('tipo_alerta')}** ({alerta.get('severidad').upper()})")
                print(f"         📝 {alerta.get('detalle')}")
                print(f"         🎯 Acción: {alerta.get('accion_recomendada')}")
        else:
            print("   ✅ Sin alertas de seguridad")
        
        # Decisión del orquestador
        print("")
        print("🧠 **AGENTE ORQUESTADOR:**")
        print(f"   ⚡ Tiempo de procesamiento: {result.get('tiempo_procesamiento_ms')} ms")
        print(f"   🔧 Agentes ejecutados: {', '.join(result.get('agentes_ejecutados', []))}")
        print(f"   🎯 Decisión final: **{result.get('decision_final').replace('_', ' ').title()}**")
        print(f"   💬 Mensaje al usuario: \"{result.get('mensaje_usuario')}\"")
        
        # Solicitud creada
        if result.get('solicitud_creada'):
            solicitud = result['solicitud_creada']
            print("")
            print("📝 **SOLICITUD CREADA:**")
            print(f"   🆔 ID: {solicitud.get('id_solicitud')}")
            print(f"   📅 Fecha: {solicitud.get('fecha_creacion')}")
            print(f"   📊 Estado: {solicitud.get('estado')}")
            print(f"   🚨 Flag alerta: {'Sí' if solicitud.get('flag_alerta') else 'No'}")
        
        print("")
        print("🎉 **¡CASO MARÍA → CARLOS RESUELTO!** 🎉")
        print("El sistema A2A conectó exitosamente la necesidad con la solución.")
        
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