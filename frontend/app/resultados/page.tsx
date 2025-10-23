"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users
} from "lucide-react"

interface Trabajador {
  id_trabajador: number
  nombre_completo: string
  score_relevancia: number
  distancia_km: number
  motivo_top: string
  precio_propuesto: number
  anos_experiencia: number
  calificacion_promedio: number
  explicacion: string
  tiene_arl: boolean
}

interface Alerta {
  tipo_alerta: string
  severidad: string
  detalle: string
  entidad_afectada: string
  id_entidad: number | null
  accion_recomendada: string
}

interface SearchResults {
  analisis: {
    texto_usuario_original: string
    id_oficio_sugerido: number
    nombre_oficio_sugerido: string
    urgencia_inferida: string
    descripcion_normalizada: string
    explicacion: string
    preguntas_aclaratorias: string[]
    confianza: number
  }
  recomendaciones: {
    total_candidatos_encontrados: number
    trabajadores_recomendados: Trabajador[]
    explicacion_algoritmo: string
    confianza_recomendaciones: number
  }
  alertas: {
    alertas_detectadas: Alerta[]
    score_riesgo_general: number
    requiere_revision_manual: boolean
    explicacion_evaluacion: string
  }
  tiempo_procesamiento_ms: number
  decision_final: string
  mensaje_usuario: string
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const handleSolicitarServicio = (trabajadorNombre: string) => {
    toast({
      title: "¡Solicitud enviada con éxito!",
      description: `${trabajadorNombre} ha sido notificado sobre tu solicitud de servicio. Te contactará pronto.`,
      duration: 5000,
    })
  }

  useEffect(() => {
    // Obtener los resultados del sessionStorage
    const storedResults = sessionStorage.getItem("searchResults")
    console.log("📦 Datos en sessionStorage:", storedResults ? "Sí" : "No")
    
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults)
        console.log("✅ Resultados parseados:", parsedResults)
        setResults(parsedResults)
      } catch (error) {
        console.error("❌ Error al parsear resultados:", error)
      }
    } else {
      console.warn("⚠️ No hay resultados en sessionStorage")
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando resultados...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No hay resultados</AlertTitle>
            <AlertDescription>
              No se encontraron resultados para tu búsqueda. Por favor intenta nuevamente.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  const { analisis, recomendaciones, alertas } = results
  
  // Manejar caso cuando no hay recomendaciones (solicitud bloqueada)
  const hasRecommendations = recomendaciones && recomendaciones.trabajadores_recomendados && recomendaciones.trabajadores_recomendados.length > 0
  
  const getMotivoIcon = (motivo: string) => {
    switch (motivo) {
      case "disponibilidad":
        return Clock
      case "proximidad":
        return MapPin
      case "experiencia":
        return Briefcase
      case "precio":
        return DollarSign
      default:
        return Star
    }
  }

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case "ALTA":
        return "destructive"
      case "MEDIA":
        return "warning"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
          }}
        />
      </div>

      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header con análisis */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">Resultados de tu búsqueda</h1>
          <p className="text-muted-foreground mb-4">&quot;{query}&quot;</p>
          
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Análisis de tu solicitud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Servicio detectado</p>
                  <p className="text-lg font-semibold">{analisis.nombre_oficio_sugerido || "No detectado"}</p>
                </div>
                {analisis.urgencia_inferida && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Urgencia</p>
                    <Badge variant={analisis.urgencia_inferida === "alta" ? "destructive" : "secondary"} className="text-sm">
                      {analisis.urgencia_inferida.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Interpretación</p>
                <p className="text-sm">{analisis.descripcion_normalizada}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">¿Por qué este servicio?</p>
                <p className="text-sm">{analisis.explicacion}</p>
              </div>
              {analisis.preguntas_aclaratorias && analisis.preguntas_aclaratorias.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Preguntas para mayor precisión:</p>
                  <ul className="space-y-1">
                    {analisis.preguntas_aclaratorias.map((pregunta, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground ml-4">• {pregunta}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alertas si existen */}
        {alertas.alertas_detectadas && alertas.alertas_detectadas.length > 0 && (
          <div className="mb-8 space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {alertas.alertas_detectadas.map((alerta, idx) => (
              <Alert key={idx} variant={getSeveridadColor(alerta.severidad) as any}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-semibold">
                  {alerta.tipo_alerta.replace(/_/g, " ")} - Severidad: {alerta.severidad}
                </AlertTitle>
                <AlertDescription className="space-y-2 mt-2">
                  <p>{alerta.detalle}</p>
                  <p className="text-sm"><strong>Recomendación:</strong> {alerta.accion_recomendada}</p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Trabajadores recomendados */}
        {hasRecommendations ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Users className="h-8 w-8 text-primary" />
                  Técnicos Recomendados
                </h2>
                <p className="text-muted-foreground mt-1">
                  {recomendaciones.total_candidatos_encontrados} candidato(s) encontrado(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Confianza de recomendaciones</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {(recomendaciones.confianza_recomendaciones * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

          {/* Info del algoritmo */}
          <Card className="mb-6 bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Criterios de selección:</strong> {recomendaciones.explicacion_algoritmo}
              </p>
            </CardContent>
          </Card>

          {/* Tarjetas de trabajadores */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recomendaciones.trabajadores_recomendados.map((trabajador, idx) => {
              const MotivoIcon = getMotivoIcon(trabajador.motivo_top)
              const isBlocked = alertas.alertas_detectadas.some(
                a => a.id_entidad === trabajador.id_trabajador
              )
              
              return (
                <Card 
                  key={trabajador.id_trabajador}
                  className={`group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden animate-fade-in-up ${
                    isBlocked ? 'border-2 border-destructive/50 bg-destructive/5' : 'border-2 border-transparent hover:border-primary/50'
                  }`}
                  style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                >
                  {/* Badge de ranking */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="font-bold">
                      #{idx + 1}
                    </Badge>
                  </div>

                  {/* Indicador si está bloqueado */}
                  {isBlocked && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Bloqueado
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl mb-2">{trabajador.nombre_completo}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base">
                      <MotivoIcon className="h-4 w-4" />
                      <span className="font-medium capitalize">Destaca por: {trabajador.motivo_top}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Rating y experiencia */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{trabajador.calificacion_promedio.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{trabajador.anos_experiencia} años</span>
                      </div>
                    </div>

                    {/* Precio y distancia */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Precio propuesto</span>
                        <span className="text-lg font-bold text-primary">
                          ${trabajador.precio_propuesto.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Distancia aprox.</span>
                        <span className="text-sm font-medium">{trabajador.distancia_km} km</span>
                      </div>
                    </div>

                    {/* ARL Badge */}
                    {trabajador.tiene_arl && (
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Con ARL
                      </Badge>
                    )}

                    {/* Explicación */}
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {trabajador.explicacion}
                      </p>
                    </div>

                    {/* Score de relevancia */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-500"
                          style={{ width: `${trabajador.score_relevancia * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {(trabajador.score_relevancia * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Botón de acción */}
                    <Button 
                      className="w-full" 
                      disabled={isBlocked}
                      variant={isBlocked ? "outline" : "default"}
                      onClick={() => handleSolicitarServicio(trabajador.nombre_completo)}
                    >
                      {isBlocked ? 'No disponible' : 'Solicitar servicio'}
                    </Button>
                  </CardContent>

                  {/* Efecto de brillo en hover */}
                  {!isBlocked && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
        ) : (
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No se pudieron generar recomendaciones de técnicos debido a las alertas detectadas en la solicitud.
            </AlertDescription>
          </Alert>
        )}

        {/* Info adicional */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Tiempo de procesamiento: {(results.tiempo_procesamiento_ms / 1000).toFixed(2)}s</span>
              <span>Decisión: <Badge variant="outline">{results.decision_final}</Badge></span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando resultados...</p>
            </div>
          </main>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
