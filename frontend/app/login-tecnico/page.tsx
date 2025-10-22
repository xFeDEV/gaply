"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react"
import Link from "next/link"

export default function LoginTecnicoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    documento: "",
    clave: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

    if (!formData.documento.trim()) {
      newErrors.documento = "El documento es requerido"
    }

    if (!formData.clave.trim()) {
      newErrors.clave = "La clave es requerida"
    } else if (formData.clave.length < 6) {
      newErrors.clave = "La clave debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoggingIn(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simple mock authentication - in production this would validate against a database
    console.log("[v0] Login attempt:", { documento: formData.documento })

    // Store auth token in localStorage (mock)
    localStorage.setItem(
      "tecnico_auth",
      JSON.stringify({
        documento: formData.documento,
        loginTime: new Date().toISOString(),
      }),
    )

    // Redirect to dashboard
    router.push("/dashboard-tecnico/perfil")
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-0 -left-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.15 0.01 120) 0%, transparent 70%)",
            animationDelay: "1s",
          }}
        />
      </div>

      <Navigation />

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-secondary mb-4 shadow-lg shadow-primary/50">
              <LogIn className="h-8 w-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">Iniciar Sesión</h1>
            <p className="text-lg text-muted-foreground text-balance">Accede a tu panel de técnico</p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden group animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="space-y-5 relative z-10">
              <div>
                <Label htmlFor="documento">
                  Documento de Identidad <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => handleChange("documento", e.target.value)}
                  placeholder="1234567890"
                  className={errors.documento ? "border-destructive" : ""}
                  disabled={isLoggingIn}
                  autoFocus
                />
                {errors.documento && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.documento}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="clave">
                  Clave <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="clave"
                    type={showPassword ? "text" : "password"}
                    value={formData.clave}
                    onChange={(e) => handleChange("clave", e.target.value)}
                    placeholder="••••••••"
                    className={errors.clave ? "border-destructive pr-10" : "pr-10"}
                    disabled={isLoggingIn}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmit(e)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoggingIn}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.clave && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.clave}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/recuperar-clave"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  ¿Olvidaste tu clave?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full text-base font-semibold relative overflow-hidden group/btn hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
                disabled={isLoggingIn}
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                    Iniciar Sesión
                  </>
                )}
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              </Button>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/registro-tecnico"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
          </form>

          {/* Info card */}
          <div
            className="mt-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <p className="text-sm text-center text-muted-foreground">
              <span className="font-semibold text-foreground">Tip:</span> Usa el documento que registraste al crear tu
              cuenta
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
