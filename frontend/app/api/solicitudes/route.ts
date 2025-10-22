import { NextRequest, NextResponse } from 'next/server'

// URL del backend dentro de la red de Docker
// En producción usa el nombre del servicio Docker, en desarrollo usa localhost
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:8000' 
  : 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔄 Enviando petición al backend:', BACKEND_URL)
    console.log('📦 Body:', JSON.stringify(body))
    
    // Hacer la petición al backend usando el nombre del servicio Docker
    const response = await fetch(`${BACKEND_URL}/solicitudes/procesar-completa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Aumentar el timeout porque el LLM puede tardar
      signal: AbortSignal.timeout(120000), // 2 minutos
    })

    if (!response.ok) {
      console.error('❌ Error del backend:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      return NextResponse.json(
        { error: errorText || 'Error del servidor' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Respuesta del backend recibida')
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('💥 Error al procesar la solicitud:', error)
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
