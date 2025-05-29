import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CartLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-40 mb-6" />
      <Skeleton className="h-10 w-64 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="p-0">
              {[1, 2].map((_, i) => (
                <div key={i} className="p-4 md:p-6 border-b border-gray-100">
                  <div className="flex items-center">
                    <Skeleton className="w-20 h-20 flex-shrink-0" />
                    <div className="ml-4 flex-grow">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex flex-col items-end ml-4">
                      <Skeleton className="h-5 w-20 mb-2" />
                      <Skeleton className="h-8 w-28" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
