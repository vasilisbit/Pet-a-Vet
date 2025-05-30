import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CategoryLoading() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/marketplace">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <div className="space-y-2">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-sm" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <div className="space-y-2">
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-sm" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <Skeleton className="h-10 w-full md:w-64 mb-4 md:mb-0" />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Skeleton className="h-10 w-full md:w-[180px]" />
              <Skeleton className="h-10 w-10 md:hidden" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="flex items-center gap-1 mb-2">
                      {Array(5)
                        .fill(0)
                        .map((_, j) => (
                          <Skeleton key={j} className="h-4 w-4 rounded-full" />
                        ))}
                      <Skeleton className="h-4 w-8 ml-1" />
                    </div>
                    <Skeleton className="h-8 w-24 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
