"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, User } from "lucide-react"
import Link from "next/link"

export default function ConfirmacionRegistroPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const nombre = searchParams.get("nombre") || "Técnico"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          {/* Success Icon */}
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">¡Registro Exitoso, {nombre}!</h1>

          <p className="text-lg text-muted-foreground mb-8 text-balance">
            Tu solicitud ha sido recibida correctamente. Nuestro equipo revisará tu información y te contactaremos
            pronto.
          </p>

          {/* Info Cards */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left space-y-4">
            <h2 className="font-semibold text-lg mb-3">Próximos pasos:</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-sm text-muted-foreground">
                  Verificaremos tu información y documentación en las próximas 24-48 horas
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-sm text-muted-foreground">
                  Recibirás un correo de confirmación con los detalles de tu cuenta
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-sm text-muted-foreground">
                  Una vez aprobado, podrás empezar a recibir solicitudes de clientes
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8 text-sm text-left">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Importante:</strong> Revisa tu correo electrónico regularmente. Te
              enviaremos actualizaciones sobre el estado de tu registro y notificaciones cuando tengas nuevas
              solicitudes de servicio.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
            <Link href="/tecnicos">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                <User className="mr-2 h-4 w-4" />
                Ver Técnicos
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
