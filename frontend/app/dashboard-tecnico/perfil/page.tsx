"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { User, Mail, Phone, MapPin, Briefcase, Star, Edit2, Save, X } from "lucide-react"

export default function PerfilTecnicoPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    nombre_completo: "Carlos Rodríguez",
    documento: "1234567890",
    email: "carlos.rodriguez@email.com",
    telefono: "+57 300 123 4567",
    barrio: "Chapinero",
    direccion: "Calle 45 # 12-34",
    anos_experiencia: "12",
    especialidad: "Electricidad",
    descripcion: "Electricista certificado con amplia experiencia en instalaciones residenciales y comerciales.",
    calificacion_promedio: 4.9,
    trabajos_completados: 543,
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("[v0] Profile updated:", profileData)
    setIsSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
          }}
        />
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-balance">Mi Perfil</h1>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="group hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
                >
                  <Edit2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Editar Perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(false)} variant="outline" disabled={isSaving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-balance">Gestiona tu información personal y profesional</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calificación</p>
                  <p className="text-2xl font-bold">{profileData.calificacion_promedio}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trabajos</p>
                  <p className="text-2xl font-bold">{profileData.trabajos_completados}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-secondary/10 to-muted/10 border-secondary/20 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experiencia</p>
                  <p className="text-2xl font-bold">{profileData.anos_experiencia} años</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Form */}
          <Card className="p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Información Personal
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre_completo">Nombre Completo</Label>
                      <Input
                        id="nombre_completo"
                        value={profileData.nombre_completo}
                        onChange={(e) => setProfileData({ ...profileData, nombre_completo: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="documento">Documento</Label>
                      <Input id="documento" value={profileData.documento} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        value={profileData.telefono}
                        onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Ubicación
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="barrio">Barrio</Label>
                      <Input
                        id="barrio"
                        value={profileData.barrio}
                        onChange={(e) => setProfileData({ ...profileData, barrio: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        value={profileData.direccion}
                        onChange={(e) => setProfileData({ ...profileData, direccion: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Información Profesional
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="especialidad">Especialidad</Label>
                      <Input
                        id="especialidad"
                        value={profileData.especialidad}
                        onChange={(e) => setProfileData({ ...profileData, especialidad: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="anos_experiencia">Años de Experiencia</Label>
                      <Input
                        id="anos_experiencia"
                        type="number"
                        value={profileData.anos_experiencia}
                        onChange={(e) => setProfileData({ ...profileData, anos_experiencia: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="descripcion">Descripción Profesional</Label>
                    <Textarea
                      id="descripcion"
                      value={profileData.descripcion}
                      onChange={(e) => setProfileData({ ...profileData, descripcion: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
