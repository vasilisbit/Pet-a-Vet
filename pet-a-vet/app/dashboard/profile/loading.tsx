import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-9 w-64 ml-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="text-center w-full">
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-48 mx-auto mb-2" />
                  <Skeleton className="h-5 w-20 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                <Skeleton className="h-12 w-full" />
                <Separator />
                <Skeleton className="h-12 w-full" />
                <Separator />
                <Skeleton className="h-12 w-full" />
              </nav>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
