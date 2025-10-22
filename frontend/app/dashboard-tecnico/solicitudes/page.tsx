"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, X, MessageCircle, Clock, MapPin, Calendar, User, Phone, Mail, ClipboardList } from "lucide-react"
import { getJobRequests, updateRequestStatus, type JobRequest } from "@/lib/mock-data"

export default function SolicitudesPage() {
  const [requests, setRequests] = useState<JobRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(null)
  const [message, setMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // Get technician ID from localStorage
    const authData = localStorage.getItem("tecnico_auth")
    if (authData) {
      const { id } = JSON.parse(authData)
      setRequests(getJobRequests(id))
    }
  }, [])

  const handleAccept = (requestId: string) => {
    updateRequestStatus(requestId, "aceptada")
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "aceptada" } : req)))
  }

  const handleReject = (requestId: string) => {
    updateRequestStatus(requestId, "rechazada")
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "rechazada" } : req)))
  }

  const handleRequestInfo = () => {
    if (selectedRequest && message.trim()) {
      updateRequestStatus(selectedRequest.id, "info_solicitada", message)
      setRequests((prev) =>
        prev.map((req) => (req.id === selectedRequest.id ? { ...req, status: "info_solicitada" } : req)),
      )
      setMessage("")
      setIsDialogOpen(false)
      setSelectedRequest(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { label: "Pendiente", className: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
      aceptada: { label: "Aceptada", className: "bg-green-500/20 text-green-700 dark:text-green-400" },
      rechazada: { label: "Rechazada", className: "bg-red-500/20 text-red-700 dark:text-red-400" },
      info_solicitada: {
        label: "Info Solicitada",
        className: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
      },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const pendingRequests = requests.filter((req) => req.status === "pendiente")
  const otherRequests = requests.filter((req) => req.status !== "pendiente")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-balance bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Mis Solicitudes
          </h1>
          <p className="text-muted-foreground text-pretty">
            Gestiona las solicitudes de trabajo que has recibido de clientes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingRequests.length}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aceptadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {requests.filter((r) => r.status === "aceptada").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Solicitudes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {requests.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-2xl font-semibold">Solicitudes Pendientes</h2>
            <div className="grid gap-4">
              {pendingRequests.map((request, index) => (
                <Card
                  key={request.id}
                  className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-xl">{request.clientName}</CardTitle>
                          {getStatusBadge(request.status)}
                        </div>
                        <CardDescription className="text-pretty">{request.problem}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Client Info */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4 text-primary" />
                        <span>{request.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{request.clientPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="truncate">{request.clientEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{request.location}</span>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Fecha preferida:</span>
                        <span className="font-medium">{request.preferredDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Hora:</span>
                        <span className="font-medium">{request.preferredTime}</span>
                      </div>
                    </div>

                    {request.additionalInfo && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Información adicional:</p>
                        <p className="text-sm text-pretty">{request.additionalInfo}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        onClick={() => handleAccept(request.id)}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aceptar
                      </Button>
                      <Button
                        onClick={() => handleReject(request.id)}
                        variant="destructive"
                        className="flex-1 sm:flex-none shadow-lg shadow-destructive/30 transition-all duration-300 hover:scale-105"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                      <Dialog open={isDialogOpen && selectedRequest?.id === request.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setSelectedRequest(request)}
                            variant="outline"
                            className="flex-1 sm:flex-none border-primary/40 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Pedir Más Info
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Solicitar Más Información</DialogTitle>
                            <DialogDescription className="text-pretty">
                              Envía un mensaje al cliente solicitando información adicional sobre el trabajo.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label htmlFor="message" className="text-sm font-medium">
                                Tu mensaje
                              </label>
                              <Textarea
                                id="message"
                                placeholder="Ej: Necesito saber las dimensiones exactas del área a trabajar..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="resize-none"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleRequestInfo}
                              disabled={!message.trim()}
                              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                            >
                              Enviar Mensaje
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Requests */}
        {otherRequests.length > 0 && (
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-2xl font-semibold">Historial de Solicitudes</h2>
            <div className="grid gap-4">
              {otherRequests.map((request, index) => (
                <Card
                  key={request.id}
                  className="border-muted hover:border-muted-foreground/20 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">{request.clientName}</CardTitle>
                          {getStatusBadge(request.status)}
                        </div>
                        <CardDescription className="text-pretty">{request.problem}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{request.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{request.preferredDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {requests.length === 0 && (
          <Card className="border-dashed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tienes solicitudes</h3>
              <p className="text-muted-foreground text-pretty max-w-md">
                Cuando los clientes te contacten, sus solicitudes aparecerán aquí para que puedas gestionarlas.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
