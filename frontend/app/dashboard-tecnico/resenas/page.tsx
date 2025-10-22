"use client"

import { Card } from "@/components/ui/card"
import { Star, MessageSquare, User, Calendar, TrendingUp } from "lucide-react"

interface Review {
  id: string
  cliente: string
  calificacion: number
  comentario: string
  fecha: string
  trabajo: string
}

export default function ResenasPage() {
  const reviews: Review[] = [
    {
      id: "1",
      cliente: "María González",
      calificacion: 5,
      comentario: "Excelente trabajo, muy profesional y puntual. Resolvió el problema eléctrico rápidamente.",
      fecha: "2024-01-15",
      trabajo: "Reparación de enchufe",
    },
    {
      id: "2",
      cliente: "Juan Pérez",
      calificacion: 5,
      comentario: "Muy recomendado. Llegó a tiempo y dejó todo impecable. Gran atención al detalle.",
      fecha: "2024-01-10",
      trabajo: "Instalación de lámpara",
    },
    {
      id: "3",
      cliente: "Ana Martínez",
      calificacion: 4,
      comentario: "Buen servicio, aunque tardó un poco más de lo esperado. El resultado final fue bueno.",
      fecha: "2024-01-05",
      trabajo: "Revisión eléctrica general",
    },
    {
      id: "4",
      cliente: "Carlos López",
      calificacion: 5,
      comentario: "Increíble profesional. Explicó todo el proceso y dio recomendaciones útiles.",
      fecha: "2023-12-28",
      trabajo: "Instalación de sistema eléctrico",
    },
  ]

  const stats = {
    promedio: 4.9,
    total: 127,
    distribucion: {
      5: 98,
      4: 23,
      3: 4,
      2: 1,
      1: 1,
    },
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
            animationDelay: "1s",
          }}
        />
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Mis Reseñas</h1>
            <p className="text-muted-foreground text-balance">Mira lo que tus clientes dicen sobre tu trabajo</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-secondary shadow-lg shadow-primary/30">
                  <Star className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Calificación Promedio</p>
                  <p className="text-3xl font-bold">{stats.promedio}</p>
                  <div className="flex gap-1 mt-1">{renderStars(Math.round(stats.promedio))}</div>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Reseñas</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Clientes satisfechos</p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 bg-gradient-to-br from-secondary/10 to-muted/10 border-secondary/20 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reseñas 5 Estrellas</p>
                  <p className="text-3xl font-bold">{stats.distribucion[5]}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((stats.distribucion[5] / stats.total) * 100)}% del total
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Rating Distribution */}
          <Card className="p-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl font-semibold mb-4">Distribución de Calificaciones</h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribucion[rating as keyof typeof stats.distribucion]
                const percentage = (count / stats.total) * 100
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    </div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              Reseñas Recientes
            </h2>
            {reviews.map((review, index) => (
              <Card
                key={review.id}
                className="p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${0.5 + index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{review.cliente}</h3>
                        <p className="text-sm text-muted-foreground">{review.trabajo}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(review.fecha).toLocaleDateString("es", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="mb-3">{renderStars(review.calificacion)}</div>
                    <p className="text-muted-foreground text-pretty">{review.comentario}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
