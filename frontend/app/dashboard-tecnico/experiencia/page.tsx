"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, Briefcase, Calendar, Trash2, Save, X } from "lucide-react"

interface Experience {
  id: string
  titulo: string
  empresa: string
  fecha_inicio: string
  fecha_fin: string
  descripcion: string
  actual: boolean
}

export default function ExperienciaPage() {
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      titulo: "Electricista Senior",
      empresa: "Instalaciones Eléctricas S.A.",
      fecha_inicio: "2018-01",
      fecha_fin: "2024-12",
      descripcion:
        "Responsable de instalaciones eléctricas residenciales y comerciales. Supervisión de equipo de 5 técnicos.",
      actual: true,
    },
    {
      id: "2",
      titulo: "Técnico Electricista",
      empresa: "Servicios Técnicos Ltda.",
      fecha_inicio: "2013-03",
      fecha_fin: "2017-12",
      descripcion: "Reparación y mantenimiento de sistemas eléctricos residenciales.",
      actual: false,
    },
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newExperience, setNewExperience] = useState<Omit<Experience, "id">>({
    titulo: "",
    empresa: "",
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
    actual: false,
  })

  const handleAdd = () => {
    const experience: Experience = {
      id: Date.now().toString(),
      ...newExperience,
    }
    setExperiences([experience, ...experiences])
    setNewExperience({
      titulo: "",
      empresa: "",
      fecha_inicio: "",
      fecha_fin: "",
      descripcion: "",
      actual: false,
    })
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id))
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.85 0.22 130) 0%, transparent 70%)",
            animationDelay: "0.5s",
          }}
        />
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-balance">Mi Experiencia</h1>
              {!isAdding && (
                <Button
                  onClick={() => setIsAdding(true)}
                  className="group hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Agregar Experiencia
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-balance">
              Gestiona tu historial laboral y experiencia profesional
            </p>
          </div>

          {/* Add New Experience Form */}
          {isAdding && (
            <Card className="p-6 mb-6 border-primary/30 animate-fade-in-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Nueva Experiencia
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título del Cargo</Label>
                    <Input
                      id="titulo"
                      value={newExperience.titulo}
                      onChange={(e) => setNewExperience({ ...newExperience, titulo: e.target.value })}
                      placeholder="Ej: Electricista Senior"
                    />
                  </div>
                  <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={newExperience.empresa}
                      onChange={(e) => setNewExperience({ ...newExperience, empresa: e.target.value })}
                      placeholder="Ej: Instalaciones S.A."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                    <Input
                      id="fecha_inicio"
                      type="month"
                      value={newExperience.fecha_inicio}
                      onChange={(e) => setNewExperience({ ...newExperience, fecha_inicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                    <Input
                      id="fecha_fin"
                      type="month"
                      value={newExperience.fecha_fin}
                      onChange={(e) => setNewExperience({ ...newExperience, fecha_fin: e.target.value })}
                      disabled={newExperience.actual}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="actual"
                        checked={newExperience.actual}
                        onChange={(e) => setNewExperience({ ...newExperience, actual: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="actual" className="font-normal cursor-pointer">
                        Trabajo actual
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={newExperience.descripcion}
                    onChange={(e) => setNewExperience({ ...newExperience, descripcion: e.target.value })}
                    placeholder="Describe tus responsabilidades y logros..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setIsAdding(false)} variant="outline" className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAdd}
                    className="flex-1 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
                    disabled={!newExperience.titulo || !newExperience.empresa}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Experience List */}
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <Card
                key={exp.id}
                className="p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">{exp.titulo}</h3>
                        <p className="text-muted-foreground font-medium">{exp.empresa}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(exp.fecha_inicio).toLocaleDateString("es", { year: "numeric", month: "long" })}
                            {" - "}
                            {exp.actual
                              ? "Presente"
                              : new Date(exp.fecha_fin).toLocaleDateString("es", { year: "numeric", month: "long" })}
                          </span>
                          {exp.actual && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                              Actual
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-pretty">{exp.descripcion}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {experiences.length === 0 && !isAdding && (
              <Card className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No has agregado experiencia laboral aún</p>
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Experiencia
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
