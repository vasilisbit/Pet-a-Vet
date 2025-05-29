// Medical record service for handling API calls

export interface MedicalRecord {
  id: string
  petId: string
  appointmentId: string
  diagnosis: string
  treatment: string
  prescription: string
  notes: string | null
  attachments: string[] | null
  createdAt: string
  updatedAt: string
  veterinarianId: string
  veterinarianName: string
}

export async function getMedicalRecords(petId?: string, appointmentId?: string): Promise<MedicalRecord[]> {
  try {
    const params = new URLSearchParams()
    if (petId) params.append("petId", petId)
    if (appointmentId) params.append("appointmentId", appointmentId)

    const response = await fetch(`/api/medical-records?${params.toString()}`)

    if (!response.ok) {
      throw new Error("Failed to fetch medical records")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching medical records:", error)
    return []
  }
}

export async function getMedicalRecordById(id: string): Promise<MedicalRecord | null> {
  try {
    const response = await fetch(`/api/medical-records/${id}`)

    if (!response.ok) {
      throw new Error("Failed to fetch medical record")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching medical record:", error)
    return null
  }
}

export async function createMedicalRecord(data: Partial<MedicalRecord>): Promise<MedicalRecord | null> {
  try {
    const response = await fetch("/api/medical-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create medical record")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating medical record:", error)
    return null
  }
}

export async function updateMedicalRecord(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord | null> {
  try {
    const response = await fetch(`/api/medical-records/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update medical record")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating medical record:", error)
    return null
  }
}

export async function deleteMedicalRecord(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/medical-records/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete medical record")
    }

    return true
  } catch (error) {
    console.error("Error deleting medical record:", error)
    return false
  }
}
