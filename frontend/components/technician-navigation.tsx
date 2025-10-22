"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User, Briefcase, Star, LogOut, Menu, X, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function TechnicianNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { href: "/dashboard-tecnico/solicitudes", label: "Mis Solicitudes", icon: ClipboardList },
    { href: "/dashboard-tecnico/perfil", label: "Mi Perfil", icon: User },
    { href: "/dashboard-tecnico/experiencia", label: "Experiencia", icon: Briefcase },
    { href: "/dashboard-tecnico/resenas", label: "Reseñas", icon: Star },
  ]

  const handleLogout = () => {
    localStorage.removeItem("tecnico_auth")
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard-tecnico/perfil" className="flex items-center gap-2 font-semibold text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-secondary shadow-lg shadow-primary/30">
              <User className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline text-balance">Panel de Técnico</span>
            <span className="sm:hidden">Técnico</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-primary to-accent text-secondary shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="ml-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in-up">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-primary to-accent text-secondary shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              )
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-300"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
