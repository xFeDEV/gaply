"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Star, MapPin, DollarSign, Filter, Search } from "lucide-react"
import Link from "next/link"

export default function TechniciansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [zoneFilter, setZoneFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")

  const allTechnicians = [
    {
      id: "1",
      name: "Carlos Rodríguez",
      specialty: "Electricidad",
      zone: "Zona Norte",
      rate: 45,
      rating: 4.9,
      reviews: 127,
    },
    {
      id: "2",
      name: "María González",
      specialty: "Electricidad",
      zone: "Zona Centro",
      rate: 50,
      rating: 5.0,
      reviews: 89,
    },
    {
      id: "3",
      name: "Jorge Martínez",
      specialty: "Electricidad",
      zone: "Zona Sur",
      rate: 40,
      rating: 4.8,
      reviews: 156,
    },
    { id: "4", name: "Luis Hernández", specialty: "Plomería", zone: "Zona Norte", rate: 42, rating: 4.7, reviews: 98 },
    { id: "5", name: "Ana Ramírez", specialty: "Carpintería", zone: "Zona Centro", rate: 38, rating: 4.9, reviews: 73 },
    { id: "6", name: "Pedro Sánchez", specialty: "Pintura", zone: "Zona Sur", rate: 35, rating: 4.6, reviews: 64 },
  ]

  const filteredTechnicians = allTechnicians.filter((tech) => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || tech.specialty === categoryFilter
    const matchesZone = zoneFilter === "all" || tech.zone === zoneFilter
    const matchesRating = ratingFilter === "all" || tech.rating >= Number.parseFloat(ratingFilter)
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "low" && tech.rate < 40) ||
      (priceFilter === "medium" && tech.rate >= 40 && tech.rate < 50) ||
      (priceFilter === "high" && tech.rate >= 50)

    return matchesSearch && matchesCategory && matchesZone && matchesRating && matchesPrice
  })

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.92 0.25 130) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle, oklch(0.15 0.01 120) 0%, transparent 70%)",
            animationDelay: "2s",
          }}
        />
      </div>

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold mb-3">Nuestros Técnicos</h1>
            <p className="text-lg text-muted-foreground">
              Profesionales verificados y calificados listos para ayudarte
            </p>
          </div>

          <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Buscar por nombre</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nombre del técnico..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Categoría</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Electricidad">Electricidad</SelectItem>
                      <SelectItem value="Plomería">Plomería</SelectItem>
                      <SelectItem value="Carpintería">Carpintería</SelectItem>
                      <SelectItem value="Pintura">Pintura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Zona</label>
                  <Select value={zoneFilter} onValueChange={setZoneFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Zona Norte">Zona Norte</SelectItem>
                      <SelectItem value="Zona Centro">Zona Centro</SelectItem>
                      <SelectItem value="Zona Sur">Zona Sur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Calificación</label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="4.8">4.8+ ⭐</SelectItem>
                      <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                      <SelectItem value="4.0">4.0+ ⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredTechnicians.length} de {allTechnicians.length} técnicos
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("all")
                    setZoneFilter("all")
                    setRatingFilter("all")
                    setPriceFilter("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredTechnicians.map((tech, index) => (
              <Card
                key={tech.id}
                className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group/card relative overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl mb-1 group-hover/card:text-primary transition-colors">
                        {tech.name}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-3 text-base">
                        <span className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <MapPin className="h-4 w-4" />
                          {tech.zone}
                        </span>
                        <span className="flex items-center gap-1 hover:text-primary transition-colors">
                          <DollarSign className="h-4 w-4" />${tech.rate}/hora
                        </span>
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="group-hover/card:bg-primary group-hover/card:text-primary-foreground transition-colors"
                    >
                      {tech.specialty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-secondary text-secondary group-hover/card:scale-125 transition-transform" />
                      <span className="font-semibold">{tech.rating}</span>
                      <span className="text-muted-foreground">({tech.reviews} reseñas)</span>
                    </div>
                    <Button asChild size="sm" className="group-hover/card:scale-110 transition-transform">
                      <Link href={`/tecnico/${tech.id}`}>Ver Perfil</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTechnicians.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  No se encontraron técnicos con los filtros seleccionados
                </p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("all")
                    setZoneFilter("all")
                    setRatingFilter("all")
                    setPriceFilter("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
