import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <div className="mb-6">
              <Skeleton className="h-6 w-40 mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-6 w-20 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
