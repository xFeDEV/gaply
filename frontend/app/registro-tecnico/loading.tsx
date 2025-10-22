import { Navigation } from "@/components/navigation"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-8 w-64 bg-muted rounded mx-auto mb-3 animate-pulse" />
            <div className="h-6 w-96 bg-muted rounded mx-auto animate-pulse" />
          </div>
          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
