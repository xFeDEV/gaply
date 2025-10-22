"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Zap, Droplet, Hammer, Paintbrush, Sparkles } from "lucide-react"

export default function SearchPage() {
  const [problem, setProblem] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

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

  const categories = [
    {
      name: "Electricidad",
      icon: Zap,
      example: "Se dañó el enchufe del cuarto",
      color: "from-yellow-500/20 to-orange-500/20",
    },
    { name: "Plomería", icon: Droplet, example: "Hay una fuga en el baño", color: "from-blue-500/20 to-cyan-500/20" },
    {
      name: "Carpintería",
      icon: Hammer,
      example: "Necesito reparar una puerta",
      color: "from-amber-500/20 to-brown-500/20",
    },
    { name: "Pintura", icon: Paintbrush, example: "Quiero pintar mi sala", color: "from-purple-500/20 to-pink-500/20" },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.15 0.01 120) 0%, transparent 70%)",
            animationDelay: "1.5s",
          }}
        />
      </div>

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold mb-3">Buscar Técnico</h1>
            <p className="text-lg text-muted-foreground text-balance">
              Describe tu problema y encontraremos al profesional perfecto
            </p>
          </div>

          <Card
            className="mb-8 relative overflow-hidden group/search hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover/search:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                ¿Qué necesitas?
              </CardTitle>
              <CardDescription>Describe tu problema con tus propias palabras</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Textarea
                placeholder="Ejemplo: Se me dañó el enchufe del cuarto y no prende la luz. También hace un ruido extraño cuando intento usarlo..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="min-h-[150px] text-base resize-none mb-4 focus:ring-2 focus:ring-primary/50 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
              />
              <Button
                onClick={handleSearch}
                disabled={!problem.trim() || isSearching}
                size="lg"
                className="w-full text-base font-semibold group/btn hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isSearching ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      Procesando solicitud...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                      Buscar Técnico Ahora
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              </Button>
            </CardContent>
          </Card>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Categorías Populares
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {categories.map((category, index) => {
                const Icon = category.icon
                return (
                  <Card
                    key={category.name}
                    className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group/cat relative overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    onClick={() => {
                      setProblem(category.example)
                    }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover/cat:opacity-100 transition-opacity duration-500`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover/cat:opacity-50 transition-opacity duration-500" />

                    <CardHeader className="relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-primary group-hover/cat:scale-110 group-hover/cat:rotate-6 transition-all duration-300 group-hover/cat:shadow-lg">
                          <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg group-hover/cat:text-primary transition-colors">
                          {category.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-sm text-muted-foreground group-hover/cat:text-foreground transition-colors">
                        Ejemplo: {category.example}
                      </p>
                    </CardContent>

                    {/* Decorative shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover/cat:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/cat:translate-x-full transition-transform duration-1000" />
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
