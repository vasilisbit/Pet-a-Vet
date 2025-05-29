"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileText } from "lucide-react"
import { createMedicalRecord, updateMedicalRecord, type MedicalRecord } from "@/lib/services/medical-record-service"

interface MedicalRecordFormProps {
  petId: string
  appointmentId: string
  existingRecord?: MedicalRecord
  onSuccess?: (record: MedicalRecord) => void
  onCancel?: () => void
  readOnly?: boolean
}

export function MedicalRecordForm({
  petId,
  appointmentId,
  existingRecord,
  onSuccess,
  onCancel,
  readOnly = false,
}: MedicalRecordFormProps) {
  const [formData, setFormData] = useState({
    diagnosis: existingRecord?.diagnosis || "",
    treatment: existingRecord?.treatment || "",
    prescription: existingRecord?.prescription || "",
    notes: existingRecord?.notes || "",
  })
  const [errors, setErrors] = useState({
    diagnosis: false,
    treatment: false,
    prescription: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: false }))
  }

  const validateForm = () => {
    const newErrors = {
      diagnosis: !formData.diagnosis.trim(),
      treatment: !formData.treatment.trim(),
      prescription: false, // Prescription is optional
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!validateForm()) {
      setErrorMessage("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)

    try {
      let result

      if (existingRecord) {
        result = await updateMedicalRecord(existingRecord.id, {
          ...formData,
        })
      } else {
        result = await createMedicalRecord({
          petId,
          appointmentId,
          ...formData,
        })
      }

      if (result) {
        onSuccess?.(result)
      } else {
        setErrorMessage("Failed to save medical record. Please try again.")
      }
    } catch (error) {
      console.error("Error saving medical record:", error)
      setErrorMessage("An error occurred while saving the medical record.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          {existingRecord ? "Medical Record" : "New Medical Record"}
        </CardTitle>
        <CardDescription>
          {readOnly
            ? "View the medical record details"
            : existingRecord
              ? "Update the medical record details"
              : "Enter the medical record details for this appointment"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="diagnosis" className="required">
              Diagnosis
            </Label>
            <Textarea
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              placeholder="Enter diagnosis"
              className={errors.diagnosis ? "border-red-500" : ""}
              disabled={readOnly}
              required
            />
            {errors.diagnosis && <p className="text-sm text-red-500">Diagnosis is required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment" className="required">
              Treatment
            </Label>
            <Textarea
              id="treatment"
              name="treatment"
              value={formData.treatment}
              onChange={handleInputChange}
              placeholder="Enter treatment details"
              className={errors.treatment ? "border-red-500" : ""}
              disabled={readOnly}
              required
            />
            {errors.treatment && <p className="text-sm text-red-500">Treatment is required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescription">Prescription</Label>
            <Textarea
              id="prescription"
              name="prescription"
              value={formData.prescription}
              onChange={handleInputChange}
              placeholder="Enter prescription details"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              placeholder="Enter any additional notes"
              disabled={readOnly}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            {readOnly ? "Back" : "Cancel"}
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : existingRecord ? "Update Record" : "Save Record"}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
