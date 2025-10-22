"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, MapPin, DollarSign, Phone, Mail, Calendar, Award, CheckCircle2, Send, MessageSquare } from "lucide-react"
import { getTechnicianById } from "@/lib/mock-data"

export default function TechnicianDetailPage() {
  const params = useParams()
  const router = useRouter()
  const technicianId = params.id as string
  const technician = getTechnicianById(technicianId)
  const [message, setMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!technician) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <p>Técnico no encontrado</p>
        </main>
      </div>
    )
  }

  const handleRequestService = () => {
    router.push(`/confirmacion?techId=${technicianId}`)
  }

  const handleSendMessage = () => {
    // Simulate sending message
    console.log("[v0] Sending message to technician:", message)
    setIsDialogOpen(false)
    setMessage("")
    // In real app, would send to backend
  }

  const defaultMessage = `Hola ${technician.name.split(" ")[0]}, estoy interesado en contratar tus servicios de ${technician.specialty.toLowerCase()}. ¿Podrías ayudarme con un proyecto? Me gustaría conocer más detalles sobre tu disponibilidad y tarifas.`

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 -right-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.15 0.01 120) 0%, transparent 70%)",
            animationDelay: "1.5s",
          }}
        />
      </div>

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 relative overflow-hidden group/card hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative z-10">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20 ring-4 ring-primary/20 group-hover/card:ring-primary/40 transition-all duration-300 group-hover/card:scale-110">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {technician.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <CardTitle className="text-3xl mb-2 group-hover/card:text-primary transition-colors">
                        {technician.name}
                      </CardTitle>
                      <CardDescription className="text-lg">{technician.specialty}</CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-base px-3 py-1 animate-fade-in-up"
                      style={{ animationDelay: "0.1s" }}
                    >
                      Verificado
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <MapPin className="h-5 w-5" />
                      <span>{technician.zone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <DollarSign className="h-5 w-5" />
                      <span className="font-semibold text-foreground">${technician.rate}/hora</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors">
                      <Star className="h-5 w-5 fill-secondary text-secondary" />
                      <span className="font-semibold text-foreground">{technician.rating}</span>
                      <span>({technician.reviews} reseñas)</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Calendar className="h-5 w-5" />
                      <span>{technician.experience} años de experiencia</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <Card
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <CardHeader>
                  <CardTitle>Sobre mí</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{technician.description}</p>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <CardHeader>
                  <CardTitle>Servicios que ofrezco</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {technician.services.map((service, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 group/item hover:translate-x-2 transition-transform"
                      >
                        <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                        <span className="group-hover/item:text-foreground transition-colors">{service}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {technician.certifications.map((cert, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card
                className="hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <CardHeader>
                  <CardTitle>Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm hover:text-primary transition-colors cursor-pointer">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{technician.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm hover:text-primary transition-colors cursor-pointer">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="break-all">{technician.email}</span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="relative overflow-hidden group/message hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover/message:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Enviar Mensaje
                  </CardTitle>
                  <CardDescription>Contacta directamente al técnico</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 bg-transparent"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Escribir Mensaje
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Enviar mensaje a {technician.name}</DialogTitle>
                        <DialogDescription>Escribe tu mensaje o usa la plantilla sugerida</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tu mensaje:</label>
                          <Textarea
                            placeholder="Escribe tu mensaje aquí..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[150px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Mensaje sugerido:</label>
                          <div className="bg-muted p-3 rounded-lg text-sm">
                            <p className="text-muted-foreground italic">{defaultMessage}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMessage(defaultMessage)}
                            className="w-full"
                          >
                            Usar mensaje sugerido
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                          Cancelar
                        </Button>
                        <Button onClick={handleSendMessage} disabled={!message.trim()} className="flex-1">
                          <Send className="mr-2 h-4 w-4" />
                          Enviar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card
                className="relative overflow-hidden group/action animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover/action:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-primary-foreground">¿Listo para contratar?</CardTitle>
                  <CardDescription className="text-primary-foreground/90">
                    Solicita el servicio ahora y recibe una respuesta rápida
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Button
                    onClick={handleRequestService}
                    variant="secondary"
                    size="lg"
                    className="w-full font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-300 group/btn relative overflow-hidden"
                  >
                    <span className="relative z-10">Solicitar Servicio</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.5s" }}
              >
                <CardHeader>
                  <CardTitle className="text-base">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center group/stat hover:translate-x-1 transition-transform">
                    <span className="text-sm text-muted-foreground">Trabajos completados</span>
                    <span className="font-semibold group-hover/stat:text-primary transition-colors">
                      {technician.completedJobs}
                    </span>
                  </div>
                  <div className="flex justify-between items-center group/stat hover:translate-x-1 transition-transform">
                    <span className="text-sm text-muted-foreground">Tasa de respuesta</span>
                    <span className="font-semibold group-hover/stat:text-primary transition-colors">
                      {technician.responseRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center group/stat hover:translate-x-1 transition-transform">
                    <span className="text-sm text-muted-foreground">Tiempo de respuesta</span>
                    <span className="font-semibold group-hover/stat:text-primary transition-colors">
                      {technician.responseTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
