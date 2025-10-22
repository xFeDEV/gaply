"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wrench, Home, Search, Users, Info, UserPlus, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/buscar", label: "Buscar", icon: Search },
    { href: "/tecnicos", label: "Técnicos", icon: Users },
    { href: "/acerca", label: "Acerca de", icon: Info },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline text-balance">Reduciendo la Brecha Laboral</span>
            <span className="sm:hidden">RBL</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              )
            })}
            <Link
              href="/login-tecnico"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ml-2",
                pathname === "/login-tecnico"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-secondary/10 text-secondary-foreground hover:bg-secondary/20",
              )}
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden lg:inline">Ingresar</span>
            </Link>
            <Link
              href="/registro-tecnico"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/registro-tecnico"
                  ? "bg-accent text-accent-foreground"
                  : "bg-accent/10 text-accent-foreground hover:bg-accent/20",
              )}
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden lg:inline">Registrarme</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
