"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { TechnicianResults } from "@/components/technician-results"

function ResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <TechnicianResults query={query} />
      </main>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">Cargando resultados...</div>
          </main>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
