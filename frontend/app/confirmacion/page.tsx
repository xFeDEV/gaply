"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Calendar, MapPin, DollarSign, ArrowRight, Home } from "lucide-react"
import { getTechnicianById } from "@/lib/mock-data"

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const techId = searchParams.get("techId") || ""
  const technician = getTechnicianById(techId)

  if (!technician) {
    return <div>Técnico no encontrado</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent mb-4">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">¡Solicitud Enviada!</h1>
            <p className="text-lg text-muted-foreground text-balance">
              Tu solicitud ha sido enviada exitosamente al técnico
            </p>
          </div>

          {/* Confirmation Card */}
          <Card className="mb-6">
            <CardHeader className="bg-muted/30">
              <CardTitle>Resumen del Emparejamiento</CardTitle>
              <CardDescription>Detalles de tu solicitud de servicio</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Technician Info */}
              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Técnico Asignado
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-semibold text-lg mb-1">{technician.name}</p>
                  <p className="text-muted-foreground mb-3">{technician.specialty}</p>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{technician.zone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${technician.rate}/hora</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Próximos Pasos
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">El técnico revisará tu solicitud</p>
                      <p className="text-sm text-muted-foreground">
                        Tiempo estimado de respuesta: {technician.responseTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Recibirás una confirmación</p>
                      <p className="text-sm text-muted-foreground">Te contactaremos por correo y teléfono</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Coordina la visita</p>
                      <p className="text-sm text-muted-foreground">Acuerda fecha, hora y detalles del servicio</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-accent-foreground mb-1">Información de contacto enviada</p>
                    <p className="text-sm text-accent-foreground/80">
                      Hemos compartido tu información con {technician.name.split(" ")[0]} para que pueda contactarte
                      directamente.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/buscar">
                Buscar Otro Técnico
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            ¿Necesitas ayuda? Contáctanos en{" "}
            <a href="mailto:soporte@rblab.com" className="text-primary hover:underline">
              soporte@rblab.com
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 py-12">
            <div className="text-center">Cargando confirmación...</div>
          </main>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
