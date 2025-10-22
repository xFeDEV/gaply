"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, DollarSign, Sparkles, ArrowRight } from "lucide-react"
import { detectCategory, getRecommendedTechnicians } from "@/lib/mock-data"

interface TechnicianResultsProps {
  query: string
}

export function TechnicianResults({ query }: TechnicianResultsProps) {
  const [category, setCategory] = useState("")
  const [technicians, setTechnicians] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate AI processing
    setIsLoading(true)
    setTimeout(() => {
      const detectedCategory = detectCategory(query)
      const recommendedTechs = getRecommendedTechnicians(detectedCategory)
      setCategory(detectedCategory)
      setTechnicians(recommendedTechs)
      setIsLoading(false)
    }, 1500)
  }, [query])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-64 mb-2 animate-pulse" />
          <div className="h-6 bg-muted rounded w-96 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-48 mb-2" />
                <div className="h-4 bg-muted rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Problem Summary */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resultados de búsqueda</h1>
        <p className="text-muted-foreground mb-4">
          Tu problema: <span className="text-foreground italic">&quot;{query}&quot;</span>
        </p>

        {/* Detected Category */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-accent-foreground">Categoría detectada por IA:</p>
            <p className="text-lg font-semibold text-accent-foreground">{category}</p>
          </div>
        </div>
      </div>

      {/* Technicians List */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Técnicos recomendados ({technicians.length})</h2>
      </div>

      <div className="space-y-4">
        {technicians.map((tech) => (
          <Card key={tech.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">{tech.name}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-3 text-base">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {tech.zone}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />${tech.rate}/hora
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      {tech.rating} ({tech.reviews} reseñas)
                    </span>
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {tech.specialty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Por qué lo recomendamos:
                </p>
                <p className="text-sm text-foreground">{tech.aiReason}</p>
              </div>

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/tecnico/${tech.id}`}>
                    Ver Perfil Completo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
