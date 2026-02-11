"use client"

import { useState, useEffect } from "react"
import { Brain, MapPin, Users, Shield, Sparkles, CheckCircle2, Loader2 } from "lucide-react"

interface PipelineStage {
    id: string
    icon: React.ElementType
    title: string
    thoughts: string[]
    duration: number // ms before moving to next stage
}

const PIPELINE_STAGES: PipelineStage[] = [
    {
        id: "analyzing",
        icon: Brain,
        title: "Agente Analista",
        thoughts: [
            "Leyendo tu solicitud...",
            "Identificando el tipo de servicio que necesitas...",
            "Clasificando la urgencia del problema...",
            "Analizando posibles riesgos y señales de alerta...",
            "Generando informe de análisis completo...",
        ],
        duration: 25000,
    },
    {
        id: "location",
        icon: MapPin,
        title: "Detectando Ubicación",
        thoughts: [
            "Buscando tu ciudad en el mensaje...",
            "Verificando cobertura de servicio en tu zona...",
            "Mapeando barrios y zonas cercanas...",
        ],
        duration: 5000,
    },
    {
        id: "matching",
        icon: Users,
        title: "Agente Recomendador",
        thoughts: [
            "Filtrando técnicos disponibles en tu ciudad...",
            "Evaluando experiencia y calificaciones...",
            "Calculando distancia y cobertura de cada técnico...",
            "Comparando tarifas y disponibilidad...",
            "Seleccionando los 5 mejores candidatos...",
            "Generando recomendaciones personalizadas...",
        ],
        duration: 30000,
    },
    {
        id: "safety",
        icon: Shield,
        title: "Agente Guardian",
        thoughts: [
            "Verificando seguridad de la transacción...",
            "Evaluando precios vs mercado...",
            "Detectando posibles anomalías...",
            "Validando certificaciones y ARL...",
            "Generando reporte de seguridad...",
        ],
        duration: 20000,
    },
    {
        id: "finishing",
        icon: Sparkles,
        title: "Preparando Resultados",
        thoughts: [
            "Compilando toda la información...",
            "Preparando la vista de resultados...",
        ],
        duration: 10000,
    },
]

export function PipelineLoader() {
    const [currentStageIndex, setCurrentStageIndex] = useState(0)
    const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0)
    const [displayedText, setDisplayedText] = useState("")
    const [elapsedTime, setElapsedTime] = useState(0)

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    // Stage progression
    useEffect(() => {
        if (currentStageIndex >= PIPELINE_STAGES.length) return

        const stage = PIPELINE_STAGES[currentStageIndex]
        const timer = setTimeout(() => {
            if (currentStageIndex < PIPELINE_STAGES.length - 1) {
                setCurrentStageIndex((prev) => prev + 1)
                setCurrentThoughtIndex(0)
                setDisplayedText("")
            }
        }, stage.duration)

        return () => clearTimeout(timer)
    }, [currentStageIndex])

    // Thought progression within a stage
    useEffect(() => {
        if (currentStageIndex >= PIPELINE_STAGES.length) return

        const stage = PIPELINE_STAGES[currentStageIndex]
        const thoughtInterval = stage.duration / stage.thoughts.length

        const timer = setTimeout(() => {
            if (currentThoughtIndex < stage.thoughts.length - 1) {
                setCurrentThoughtIndex((prev) => prev + 1)
                setDisplayedText("")
            }
        }, thoughtInterval)

        return () => clearTimeout(timer)
    }, [currentStageIndex, currentThoughtIndex])

    // Typewriter effect
    useEffect(() => {
        if (currentStageIndex >= PIPELINE_STAGES.length) return

        const stage = PIPELINE_STAGES[currentStageIndex]
        const fullText = stage.thoughts[currentThoughtIndex] || ""

        if (displayedText.length < fullText.length) {
            const timer = setTimeout(() => {
                setDisplayedText(fullText.slice(0, displayedText.length + 1))
            }, 30)
            return () => clearTimeout(timer)
        }
    }, [displayedText, currentStageIndex, currentThoughtIndex])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const currentStage = PIPELINE_STAGES[currentStageIndex] || PIPELINE_STAGES[PIPELINE_STAGES.length - 1]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl animate-pulse"
                    style={{
                        background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
                    }}
                />
                <div
                    className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-15 blur-3xl animate-pulse"
                    style={{
                        background: "radial-gradient(circle, oklch(0.15 0.01 120) 0%, transparent 70%)",
                        animationDelay: "1s",
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-lg mx-4">
                {/* Main card */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 relative">
                            <currentStage.icon className="w-8 h-8 text-primary animate-pulse" />
                            <div className="absolute -inset-1 rounded-2xl bg-primary/20 animate-ping opacity-30" />
                        </div>
                        <h2 className="text-xl font-bold mb-1">Procesando tu solicitud</h2>
                        <p className="text-sm text-muted-foreground">
                            Nuestros agentes de IA están trabajando • {formatTime(elapsedTime)}
                        </p>
                    </div>

                    {/* Pipeline stages */}
                    <div className="space-y-3 mb-8">
                        {PIPELINE_STAGES.map((stage, index) => {
                            const Icon = stage.icon
                            const isActive = index === currentStageIndex
                            const isCompleted = index < currentStageIndex
                            const isPending = index > currentStageIndex

                            return (
                                <div
                                    key={stage.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${isActive
                                            ? "bg-primary/10 border border-primary/30 shadow-sm"
                                            : isCompleted
                                                ? "bg-muted/50 opacity-70"
                                                : "opacity-30"
                                        }`}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-500 ${isActive
                                                ? "bg-primary text-primary-foreground"
                                                : isCompleted
                                                    ? "bg-primary/30 text-primary"
                                                    : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : isActive ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm font-medium transition-colors ${isActive ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground"
                                                }`}
                                        >
                                            {stage.title}
                                        </p>
                                        {isActive && (
                                            <p className="text-xs text-primary mt-0.5 truncate">
                                                {displayedText}
                                                <span className="animate-pulse">▌</span>
                                            </p>
                                        )}
                                        {isCompleted && (
                                            <p className="text-xs text-muted-foreground mt-0.5">Completado ✓</p>
                                        )}
                                    </div>

                                    {/* Status dot */}
                                    {isActive && (
                                        <div className="flex-shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Progress bar */}
                    <div className="relative">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-linear"
                                style={{
                                    width: `${((currentStageIndex) / PIPELINE_STAGES.length) * 100 +
                                        (1 / PIPELINE_STAGES.length) * (currentThoughtIndex / (currentStage.thoughts.length || 1)) * 100}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Tip */}
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        💡 Tip: Incluye tu ciudad en el mensaje para resultados más precisos
                    </p>
                </div>
            </div>
        </div>
    )
}
