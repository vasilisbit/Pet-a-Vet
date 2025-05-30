import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-32 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <Skeleton className="w-full h-[400px] mb-4 rounded-lg" />
          <div className="flex gap-2">
            {[1, 2, 3].map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-6" />

          <div className="mb-6">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-5 w-36" />
          </div>

          <Skeleton className="h-12 w-full mb-6" />

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      <Skeleton className="h-12 w-full mb-6" />
      <Skeleton className="h-40 w-full mb-12" />

      <Skeleton className="h-10 w-48 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-32 w-full mb-3" />
              <Skeleton className="h-5 w-3/4 mb-1" />
              <Skeleton className="h-5 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
