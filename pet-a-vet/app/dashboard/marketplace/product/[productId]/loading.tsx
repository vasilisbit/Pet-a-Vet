import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function ProductLoading() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/marketplace">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <Skeleton className="h-8 w-64 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-3 gap-2">
            {Array(2)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          <Skeleton className="h-10 w-32" />

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-r-none" />
                <Skeleton className="h-10 w-12 rounded-none" />
                <Skeleton className="h-10 w-10 rounded-l-none" />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div>
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <div className="space-y-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="specifications" className="mb-12">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
        </TabsList>
        <TabsContent value="specifications" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex">
                  <Skeleton className="w-1/2 h-5 mr-4" />
                  <Skeleton className="w-1/2 h-5" />
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mb-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4">
                  <Skeleton className="h-5 w-full mb-2" />
                  <div className="flex items-center gap-1 my-2">
                    {Array(5)
                      .fill(0)
                      .map((_, j) => (
                        <Skeleton key={j} className="h-3 w-3 rounded-full" />
                      ))}
                    <Skeleton className="h-3 w-8 ml-1" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
