"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TechnicianNavigation } from "@/components/technician-navigation"

export default function DashboardTecnicoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem("tecnico_auth")
    if (!auth) {
      router.push("/login-tecnico")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <TechnicianNavigation />
      {children}
    </div>
  )
}
