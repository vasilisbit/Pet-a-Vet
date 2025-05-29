"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, AlertCircle } from "lucide-react"
import { MedicalRecordForm } from "@/components/medical-record-form"
import { getMedicalRecords, type MedicalRecord } from "@/lib/services/medical-record-service"
import { getCurrentUser } from "@/lib/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MedicalRecordViewProps {
  petId: string
  appointmentId: string
  onClose?: () => void
}

export function MedicalRecordView({ petId, appointmentId, onClose }: MedicalRecordViewProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true)
      try {
        const data = await getMedicalRecords(petId, appointmentId)
        setRecords(data)
      } catch (err) {
        console.error("Error fetching medical records:", err)
        setError("Failed to load medical records")
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [petId, appointmentId])

  const handleRecordCreated = (newRecord: MedicalRecord) => {
    setRecords((prev) => [...prev, newRecord])
    setShowForm(false)
  }

  const handleRecordUpdated = (updatedRecord: MedicalRecord) => {
    setRecords((prev) => prev.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))
    setSelectedRecord(null)
  }

  const isVeterinarian = currentUser?.role === "veterinarian" || currentUser?.role === "admin"

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Medical Records</CardTitle>
          <CardDescription>Loading medical records...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Medical Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={onClose}>Back</Button>
        </CardFooter>
      </Card>
    )
  }

  if (selectedRecord) {
    return (
      <MedicalRecordForm
        petId={petId}
        appointmentId={appointmentId}
        existingRecord={selectedRecord}
        onSuccess={handleRecordUpdated}
        onCancel={() => setSelectedRecord(null)}
        readOnly={!isVeterinarian}
      />
    )
  }

  if (showForm) {
    return (
      <MedicalRecordForm
        petId={petId}
        appointmentId={appointmentId}
        onSuccess={handleRecordCreated}
        onCancel={() => setShowForm(false)}
      />
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Medical Records</CardTitle>
            <CardDescription>
              {records.length === 0
                ? "No medical records found for this appointment"
                : `${records.length} medical record(s) found`}
            </CardDescription>
          </div>
          {isVeterinarian && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No medical records available</p>
            {isVeterinarian && (
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                Create Medical Record
              </Button>
            )}
          </div>
        ) : (
          <Tabs defaultValue={records[0].id} className="w-full">
            <TabsList className="mb-4">
              {records.map((record, index) => (
                <TabsTrigger key={record.id} value={record.id}>
                  Record {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {records.map((record) => (
              <TabsContent key={record.id} value={record.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Medical Record - {new Date(record.createdAt).toLocaleDateString()}
                    </CardTitle>
                    <CardDescription>Created by {record.veterinarianName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">Diagnosis</h4>
                      <p className="text-gray-700 mt-1">{record.diagnosis}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Treatment</h4>
                      <p className="text-gray-700 mt-1">{record.treatment}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Prescription</h4>
                      <p className="text-gray-700 mt-1">{record.prescription || "None"}</p>
                    </div>
                    {record.notes && (
                      <div>
                        <h4 className="font-medium">Additional Notes</h4>
                        <p className="text-gray-700 mt-1">{record.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => setSelectedRecord(record)}>
                      {isVeterinarian ? "Edit" : "View Details"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onClose}>
          Back
        </Button>
      </CardFooter>
    </Card>
  )
}
