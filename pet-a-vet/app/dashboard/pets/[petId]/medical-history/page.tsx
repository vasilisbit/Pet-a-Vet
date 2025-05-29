"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getMedicalRecords, type MedicalRecord } from "@/lib/services/medical-record-service"

export default function PetMedicalHistoryPage() {
  const { petId } = useParams()
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function loadMedicalRecords() {
      if (petId) {
        setLoading(true)
        const records = await getMedicalRecords(petId as string)
        setMedicalRecords(records)
        setLoading(false)
      }
    }

    loadMedicalRecords()
  }, [petId])

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Pet Medical History</h1>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <MedicalRecordSkeleton count={3} />
          ) : medicalRecords.length > 0 ? (
            <div className="grid gap-6">
              {medicalRecords.map((record) => (
                <MedicalRecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <EmptyState message="No medical records found for this pet." />
          )}
        </TabsContent>

        <TabsContent value="vaccinations" className="mt-6">
          {loading ? (
            <MedicalRecordSkeleton count={2} />
          ) : medicalRecords.filter((r) => r.treatment.toLowerCase().includes("vaccine")).length > 0 ? (
            <div className="grid gap-6">
              {medicalRecords
                .filter((r) => r.treatment.toLowerCase().includes("vaccine"))
                .map((record) => (
                  <MedicalRecordCard key={record.id} record={record} />
                ))}
            </div>
          ) : (
            <EmptyState message="No vaccination records found for this pet." />
          )}
        </TabsContent>

        <TabsContent value="treatments" className="mt-6">
          {loading ? (
            <MedicalRecordSkeleton count={2} />
          ) : medicalRecords.filter((r) => !r.treatment.toLowerCase().includes("vaccine")).length > 0 ? (
            <div className="grid gap-6">
              {medicalRecords
                .filter((r) => !r.treatment.toLowerCase().includes("vaccine"))
                .map((record) => (
                  <MedicalRecordCard key={record.id} record={record} />
                ))}
            </div>
          ) : (
            <EmptyState message="No treatment records found for this pet." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MedicalRecordCard({ record }: { record: MedicalRecord }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{record.diagnosis}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(record.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/medical-records/${record.id}`}>
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div>
            <h4 className="font-semibold text-sm">Treatment:</h4>
            <p className="text-sm text-gray-600">{record.treatment}</p>
          </div>
          {record.prescription && (
            <div>
              <h4 className="font-semibold text-sm">Prescription:</h4>
              <p className="text-sm text-gray-600">{record.prescription}</p>
            </div>
          )}
          <div className="mt-2 text-sm text-gray-500">Veterinarian: {record.veterinarianName}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 border rounded-lg">
      <FileText className="h-12 w-12 mx-auto text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">No Records Found</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
  )
}

function MedicalRecordSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
