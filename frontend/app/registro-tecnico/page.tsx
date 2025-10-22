"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, CheckCircle2, AlertCircle } from "lucide-react"

export default function RegistroTecnicoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre_completo: "",
    identificacion: "",
    tipo_persona: "natural",
    telefono: "",
    email: "",
    barrio: "",
    direccion: "",
    anos_experiencia: "",
    disponibilidad: "tiempo_completo",
    cobertura_km: "",
    tiene_arl: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = "El nombre completo es requerido"
    }

    if (!formData.identificacion.trim()) {
      newErrors.identificacion = "La identificación es requerida"
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido"
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\s/g, ""))) {
      newErrors.telefono = "Ingresa un teléfono válido de 10 dígitos"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido"
    }

    if (!formData.barrio.trim()) {
      newErrors.barrio = "El barrio es requerido"
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida"
    }

    if (!formData.anos_experiencia) {
      newErrors.anos_experiencia = "Los años de experiencia son requeridos"
    } else if (Number.parseInt(formData.anos_experiencia) < 0) {
      newErrors.anos_experiencia = "Ingresa un valor válido"
    }

    if (!formData.cobertura_km) {
      newErrors.cobertura_km = "La cobertura en km es requerida"
    } else if (Number.parseInt(formData.cobertura_km) < 1) {
      newErrors.cobertura_km = "Ingresa un valor válido (mínimo 1 km)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create registration data with defaults
    const registrationData = {
      ...formData,
      calificacion_promedio: 0, // New technicians start with 0
      fecha_registro: new Date().toISOString(),
    }

    console.log("[v0] Technician registration data:", registrationData)

    // Redirect to confirmation page
    router.push(`/registro-tecnico/confirmacion?nombre=${encodeURIComponent(formData.nombre_completo)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <UserPlus className="h-8 w-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">Registro de Técnico</h1>
            <p className="text-lg text-muted-foreground text-balance">
              Completa el formulario para unirte a nuestra red de profesionales
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-lg">
            <div className="space-y-6">
              {/* Información Personal */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  Información Personal
                </h2>
                <div className="space-y-4 ml-10">
                  <div>
                    <Label htmlFor="nombre_completo">
                      Nombre Completo <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={(e) => handleChange("nombre_completo", e.target.value)}
                      placeholder="Juan Pérez García"
                      className={errors.nombre_completo ? "border-destructive" : ""}
                    />
                    {errors.nombre_completo && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.nombre_completo}
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="identificacion">
                        Identificación <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="identificacion"
                        value={formData.identificacion}
                        onChange={(e) => handleChange("identificacion", e.target.value)}
                        placeholder="1234567890"
                        className={errors.identificacion ? "border-destructive" : ""}
                      />
                      {errors.identificacion && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.identificacion}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>
                        Tipo de Persona <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.tipo_persona}
                        onValueChange={(value) => handleChange("tipo_persona", value)}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="natural" id="natural" />
                          <Label htmlFor="natural" className="font-normal cursor-pointer">
                            Natural
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="juridica" id="juridica" />
                          <Label htmlFor="juridica" className="font-normal cursor-pointer">
                            Jurídica
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  Información de Contacto
                </h2>
                <div className="space-y-4 ml-10">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefono">
                        Teléfono <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleChange("telefono", e.target.value)}
                        placeholder="3001234567"
                        className={errors.telefono ? "border-destructive" : ""}
                      />
                      {errors.telefono && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.telefono}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="juan@ejemplo.com"
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="barrio">
                      Barrio <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="barrio"
                      value={formData.barrio}
                      onChange={(e) => handleChange("barrio", e.target.value)}
                      placeholder="Chapinero"
                      className={errors.barrio ? "border-destructive" : ""}
                    />
                    {errors.barrio && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.barrio}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="direccion">
                      Dirección <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => handleChange("direccion", e.target.value)}
                      placeholder="Calle 45 # 12-34, Apto 501"
                      className={errors.direccion ? "border-destructive" : ""}
                      rows={2}
                    />
                    {errors.direccion && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.direccion}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información Profesional */}
              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  Información Profesional
                </h2>
                <div className="space-y-4 ml-10">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="anos_experiencia">
                        Años de Experiencia <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="anos_experiencia"
                        type="number"
                        min="0"
                        value={formData.anos_experiencia}
                        onChange={(e) => handleChange("anos_experiencia", e.target.value)}
                        placeholder="5"
                        className={errors.anos_experiencia ? "border-destructive" : ""}
                      />
                      {errors.anos_experiencia && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.anos_experiencia}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="disponibilidad">
                        Disponibilidad <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.disponibilidad}
                        onValueChange={(value) => handleChange("disponibilidad", value)}
                      >
                        <SelectTrigger id="disponibilidad">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tiempo_completo">Tiempo Completo</SelectItem>
                          <SelectItem value="medio_tiempo">Medio Tiempo</SelectItem>
                          <SelectItem value="fines_semana">Fines de Semana</SelectItem>
                          <SelectItem value="por_proyecto">Por Proyecto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cobertura_km">
                      Cobertura (kilómetros) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cobertura_km"
                      type="number"
                      min="1"
                      value={formData.cobertura_km}
                      onChange={(e) => handleChange("cobertura_km", e.target.value)}
                      placeholder="10"
                      className={errors.cobertura_km ? "border-destructive" : ""}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Distancia máxima que estás dispuesto a desplazarte
                    </p>
                    {errors.cobertura_km && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.cobertura_km}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start space-x-3 bg-muted/50 p-4 rounded-lg">
                    <Checkbox
                      id="tiene_arl"
                      checked={formData.tiene_arl}
                      onCheckedChange={(checked) => handleChange("tiene_arl", checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="tiene_arl"
                        className="font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tengo ARL (Aseguradora de Riesgos Laborales)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Contar con ARL aumenta tu confiabilidad ante los clientes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">Nota importante</p>
                  <p className="text-muted-foreground">
                    Como técnico nuevo, tu calificación inicial será 0. Esta aumentará a medida que completes trabajos y
                    recibas valoraciones positivas de los clientes.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Completar Registro
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
