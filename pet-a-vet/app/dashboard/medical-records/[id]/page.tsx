"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, User, Stethoscope, Pill, FileText, Paperclip } from "lucide-react"
import { getMedicalRecordById, type MedicalRecord } from "@/lib/services/medical-record-service"

export default function MedicalRecordDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMedicalRecord() {
      if (id) {
        setLoading(true)
        const data = await getMedicalRecordById(id as string)
        setRecord(data)
        setLoading(false)
      }
    }

    loadMedicalRecord()
  }, [id])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!record) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Medical Record Not Found</h2>
          <p className="mt-2 text-gray-600">
            The medical record you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold ml-4">Medical Record Details</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{record.diagnosis}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Diagnosis
                </h3>
                <p className="mt-1 text-gray-700">{record.diagnosis}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Treatment
                </h3>
                <p className="mt-1 text-gray-700">{record.treatment}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Pill className="h-5 w-5 mr-2" />
                  Prescription
                </h3>
                <p className="mt-1 text-gray-700">{record.prescription || "No prescription provided"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Veterinarian
                </h3>
                <p className="mt-1 text-gray-700">{record.veterinarianName}</p>
              </div>

              {record.notes && (
                <div>
                  <h3 className="text-lg font-semibold">Additional Notes</h3>
                  <p className="mt-1 text-gray-700">{record.notes}</p>
                </div>
              )}

              {record.attachments && record.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Paperclip className="h-5 w-5 mr-2" />
                    Attachments
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {record.attachments.map((attachment, index) => (
                      <li key={index}>
                        <a
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Attachment {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button variant="outline">Print Record</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-9 w-64 ml-4" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="w-full">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                  </div>
                ))}
            </div>
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}
