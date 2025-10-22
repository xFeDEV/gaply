"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, Zap, Shield } from "lucide-react"

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const values = [
    {
      icon: Target,
      title: "Nuestra Misión",
      description:
        "Reducir la brecha laboral conectando personas que necesitan servicios con trabajadores calificados, creando oportunidades de empleo digno.",
      gradient: "from-primary/20 to-accent/20",
    },
    {
      icon: Users,
      title: "Inclusión",
      description:
        "Creemos en dar oportunidades a todos los profesionales, sin importar su origen, para que puedan mostrar su talento y habilidades.",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Zap,
      title: "Tecnología IA",
      description:
        "Utilizamos inteligencia artificial para hacer coincidir las necesidades de los clientes con los técnicos más adecuados de forma rápida y precisa.",
      gradient: "from-yellow-500/20 to-orange-500/20",
    },
    {
      icon: Shield,
      title: "Confianza",
      description:
        "Todos nuestros técnicos son verificados y calificados, garantizando servicios de calidad y seguridad para nuestros usuarios.",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-1/4 left-1/4 w-[700px] h-[700px] rounded-full opacity-15 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        <div
          className="absolute top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.15 0.01 120) 0%, transparent 70%)",
            animationDelay: "1s",
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
            animationDelay: "2s",
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        />
      </div>

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Reduciendo la Brecha Laboral
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Una plataforma que conecta talento con oportunidades, usando tecnología para crear un futuro más inclusivo
            </p>
          </div>

          <Card
            className="mb-8 relative overflow-hidden group/story hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover/story:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl group-hover/story:text-primary transition-colors">
                Nuestra Historia
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none relative z-10">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nace de la necesidad de crear un puente entre personas que requieren servicios técnicos y profesionales
                calificados que buscan oportunidades de trabajo. Muchas veces, encontrar un técnico confiable es
                difícil, y al mismo tiempo, muchos trabajadores calificados no tienen acceso a suficientes clientes.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos inteligencia artificial y automatización (n8n) para hacer este proceso más eficiente, justo y
                accesible para todos. Nuestra plataforma no solo conecta, sino que también verifica, califica y
                recomienda a los mejores profesionales según las necesidades específicas de cada cliente.
              </p>
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Nuestros Valores
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <Card
                    key={index}
                    className="relative overflow-hidden group/value hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover/value:opacity-100 transition-opacity duration-500`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent opacity-0 group-hover/value:opacity-100 transition-opacity duration-500" />

                    <CardHeader className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-primary group-hover/value:scale-110 group-hover/value:rotate-6 transition-all duration-300 group-hover/value:shadow-lg">
                          <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl group-hover/value:text-primary transition-colors">
                          {value.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-muted-foreground leading-relaxed group-hover/value:text-foreground transition-colors">
                        {value.description}
                      </p>
                    </CardContent>

                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover/value:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/value:translate-x-full transition-transform duration-1000" />
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <Card className="relative overflow-hidden group/stats animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute inset-0 opacity-0 group-hover/stats:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>

            <CardContent className="pt-8 pb-8 relative z-10">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="group/stat hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl md:text-4xl font-bold mb-1 text-primary-foreground group-hover/stat:scale-110 transition-transform">
                    500+
                  </div>
                  <div className="text-sm text-primary-foreground/90">Técnicos Registrados</div>
                </div>
                <div className="group/stat hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl md:text-4xl font-bold mb-1 text-primary-foreground group-hover/stat:scale-110 transition-transform">
                    2,000+
                  </div>
                  <div className="text-sm text-primary-foreground/90">Servicios Completados</div>
                </div>
                <div className="group/stat hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl md:text-4xl font-bold mb-1 text-primary-foreground group-hover/stat:scale-110 transition-transform">
                    4.8★
                  </div>
                  <div className="text-sm text-primary-foreground/90">Calificación Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
