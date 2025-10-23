"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Search, Zap, Shield, Users, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [problem, setProblem] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = async () => {
    if (problem.trim()) {
      setIsSearching(true)
      try {
        // Llamar a nuestra API route que hace proxy al backend
        const response = await fetch("/api/solicitudes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            texto_usuario: problem,
            id_barrio_usuario: 0,
          }),
        })

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`)
        }

        const data = await response.json()
        
        // Validar que tenemos datos
        if (!data || !data.analisis) {
          throw new Error("Respuesta inválida del servidor")
        }

        console.log("✅ Datos recibidos:", data)
        
        // Guardar los datos en sessionStorage para usarlos en la página de resultados
        sessionStorage.setItem("searchResults", JSON.stringify(data))
        
        // Redirigir a resultados
        router.push(`/resultados?q=${encodeURIComponent(problem)}`)
      } catch (error) {
        console.error("❌ Error al procesar la solicitud:", error)
        setIsSearching(false)
        alert(
          error instanceof Error 
            ? `Error: ${error.message}` 
            : "Hubo un error al procesar tu solicitud. Por favor intenta nuevamente."
        )
      }
    }
  }

  const features = [
    {
      icon: Zap,
      title: "IA Inteligente",
      description: "Nuestro sistema detecta automáticamente qué tipo de técnico necesitas",
    },
    {
      icon: Shield,
      title: "Técnicos Verificados",
      description: "Todos los profesionales están calificados y verificados",
    },
    {
      icon: Users,
      title: "Recomendaciones Personalizadas",
      description: "Encuentra el técnico perfecto según tu ubicación y necesidades",
    },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-0 -left-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        <div
          className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.15 0.01 120) 0%, transparent 70%)",
            animationDelay: "1s",
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        />
      </div>

      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6 animate-fade-in-up">
              Conecta con el técnico perfecto en{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                segundos
              </span>
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground text-balance mb-12 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              Describe tu problema y nuestra IA encontrará los mejores profesionales para ti
            </p>

            <div
              className="bg-card border border-border rounded-xl p-6 shadow-lg relative overflow-hidden animate-fade-in-up group hover:shadow-2xl transition-all duration-300"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <label htmlFor="problem" className="block text-left text-sm font-medium mb-3 relative z-10">
                ¿Qué necesitas reparar o instalar?
              </label>
              
              {/* Mensaje informativo */}
              <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg relative z-10">
                <p className="text-xs text-muted-foreground text-pretty">
                  ⏱️ <strong>Ten en cuenta:</strong> La búsqueda puede tardar entre 30 segundos y 1 minuto y 30 segundos. 
                  Por favor, ten paciencia mientras nuestros agentes de IA trabajan para darte la mejor respuesta.
                </p>
              </div>
              
              <Textarea
                id="problem"
                placeholder="Ejemplo: Se me dañó el enchufe del cuarto y no prende la luz. IMPORTANTE: SE DEBE AGREGAR LA CIUDAD DONDE SE NECESITA EL SERVICIO PARA QUE NUESTROS AGENTES PUEDAN HACER UNA BUSQUEDA CORRECTA."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="min-h-[120px] text-base resize-none relative z-10 focus:ring-2 focus:ring-primary/50 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                disabled={isSearching}
              />
              <Button
                onClick={handleSearch}
                disabled={!problem.trim() || isSearching}
                size="lg"
                className="w-full mt-4 text-base font-semibold relative z-10 overflow-hidden group/btn hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
              >
                {isSearching ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                    Buscar Técnico
                    <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              Presiona <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> para buscar
            </p>
          </div>
        </section>

        <section className="border-t border-border relative py-16 md:py-24 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />

          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-balance">¿Cómo funciona?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-xl p-6 text-center group hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2"
                    style={{
                      animation: "fade-in-up 0.6s ease-out forwards",
                      animationDelay: `${0.4 + index * 0.1}s`,
                      opacity: 0,
                    }}
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-pretty">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group/cta min-h-[300px]">
            {/* Diagonal split background with gradient transition */}
            <div className="absolute inset-0">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="blackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.15 0.01 120)" />
                    <stop offset="100%" stopColor="oklch(0.10 0.01 120)" />
                  </linearGradient>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.92 0.25 130)" />
                    <stop offset="100%" stopColor="oklch(0.85 0.22 130)" />
                  </linearGradient>
                </defs>
                {/* Black diagonal section */}
                <polygon points="0,0 100,0 0,100" fill="url(#blackGradient)" />
                {/* Green diagonal section */}
                <polygon points="100,0 100,100 0,100" fill="url(#greenGradient)" />
              </svg>
            </div>

            {/* Animated glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-700">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-primary/30 via-white/20 to-primary/30 blur-3xl animate-pulse" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-left">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance text-white drop-shadow-lg">
                    ¿Eres un técnico calificado?
                  </h2>
                  <p className="text-lg text-white/90 text-balance max-w-xl drop-shadow">
                    Únete a nuestra plataforma y conecta con clientes que necesitan tus servicios
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <Link href="/registro-tecnico">
                    <Button
                      size="lg"
                      className="font-semibold bg-white text-secondary hover:bg-white hover:scale-110 hover:shadow-2xl hover:shadow-white/70 transition-all duration-300 group/btn relative overflow-hidden px-8 py-6 text-lg"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Registrarme como Técnico
                        <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      {/* Glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 blur-xl bg-white/50" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Decorative animated elements */}
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-4 left-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 relative z-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Reduciendo la Brecha Laboral. Conectando talento con oportunidades.</p>
        </div>
      </footer>
    </div>
  )
}
