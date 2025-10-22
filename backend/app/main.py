from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

# Importar modelos y schemas
from models import (
    SessionLocal,
    Oficio,
    Solicitud,
    SolicitudInput,
    SolicitudOutput,
    get_db
)

# Importar el servicio de LLM
from llm_service import generar_solicitud_estructurada

app = FastAPI(
    title="TaskPro Backend API",
    description="API para gestión de solicitudes de servicios profesionales con IA",
    version="1.0.0"
)


@app.get("/")
def read_root():
    """Endpoint de bienvenida"""
    return {
        "message": "Bienvenido a TaskPro Backend API",
        "version": "1.0.0",
        "endpoints": {
            "crear_solicitud": "POST /solicitudes/crear",
            "health": "GET /health"
        }
    }


@app.get("/health")
def health_check():
    """Endpoint para verificar que el servicio está funcionando"""
    return {"status": "ok", "service": "TaskPro Backend"}


@app.post("/solicitudes/crear", response_model=SolicitudOutput)
async def crear_solicitud_desde_texto(
    solicitud_input: SolicitudInput,
    db: Session = Depends(get_db)
):
    """
    Endpoint principal: recibe texto en lenguaje natural y crea una solicitud estructurada.
    
    Flujo:
    1. Consulta los oficios disponibles en la base de datos
    2. Envía el texto del usuario y los oficios al LLM (Gemini)
    3. El LLM extrae: id_oficio, urgencia y descripción estructurada
    4. Valida que el oficio exista
    5. Crea y guarda la solicitud en la base de datos
    6. Retorna la solicitud creada
    """
    
    try:
        # Paso 1: Consultar todos los oficios disponibles
        oficios = db.query(Oficio).all()
        
        if not oficios:
            raise HTTPException(
                status_code=500,
                detail="No hay oficios disponibles en la base de datos. Por favor, carga la tabla de oficios primero."
            )
        
        # Paso 2: Formatear los oficios en un string legible para el LLM
        oficios_str_list = []
        for oficio in oficios:
            oficios_str_list.append(
                f"ID: {oficio.id_oficio}, Nombre: {oficio.nombre_oficio}, "
                f"Categoría: {oficio.categoria_servicio}, Descripción: {oficio.descripcion}"
            )
        
        oficios_disponibles = "\n".join(oficios_str_list)
        
        # Paso 3: Llamar al servicio LLM para estructurar la solicitud
        solicitud_estructurada = await generar_solicitud_estructurada(
            texto_usuario_original=solicitud_input.texto_usuario,
            oficios_disponibles=oficios_disponibles
        )
        
        # Paso 4: Validar que el id_oficio devuelto por el LLM existe en la base de datos
        oficio_ids_validos = {oficio.id_oficio for oficio in oficios}
        
        if solicitud_estructurada.id_oficio not in oficio_ids_validos:
            raise HTTPException(
                status_code=400,
                detail=f"El oficio con ID {solicitud_estructurada.id_oficio} no existe. "
                       f"El LLM devolvió un ID inválido."
            )
        
        # Paso 5: Crear la nueva solicitud en la base de datos
        nueva_solicitud = Solicitud(
            id_solicitante=0,  # Valor por defecto (TODO: implementar autenticación)
            id_oficio=solicitud_estructurada.id_oficio,
            descripcion_usuario=solicitud_estructurada.descripcion_usuario,
            urgencia=solicitud_estructurada.urgencia,
            id_barrio_servicio=0,  # Valor por defecto (TODO: implementar detección de ubicación)
            estado='pendiente',
            precio_estimado_mercado=0.0,
            flag_alerta=False
        )
        
        # Paso 6: Guardar en la base de datos
        db.add(nueva_solicitud)
        db.commit()
        db.refresh(nueva_solicitud)
        
        # Paso 7: Retornar la solicitud creada
        return nueva_solicitud
        
    except HTTPException:
        # Re-lanzar las excepciones HTTP tal cual
        raise
        
    except Exception as e:
        # Capturar cualquier otro error y devolver un 500
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la solicitud: {str(e)}"
        )