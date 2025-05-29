import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import * as medicalRecordModel from "@/lib/db/models/medicalRecord"
import * as petModel from "@/lib/db/models/pet"
import * as userModel from "@/lib/db/models/user"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const petId = searchParams.get("petId")
  const appointmentId = searchParams.get("appointmentId")
  const id = searchParams.get("id")

  // Get current user for authorization
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let medicalRecords

    if (id) {
      // Get specific medical record
      const record = await medicalRecordModel.getMedicalRecordById(Number.parseInt(id))
      medicalRecords = record ? [record] : []
    } else if (petId) {
      // Get medical records for a specific pet
      medicalRecords = await medicalRecordModel.getMedicalRecordsByPetId(Number.parseInt(petId))
    } else if (appointmentId) {
      // Get medical records for a specific appointment
      medicalRecords = await medicalRecordModel.getMedicalRecordsByAppointmentId(Number.parseInt(appointmentId))
    } else {
      // Get all medical records (for authorized users)
      if (currentUser.role === "veterinarian" || currentUser.role === "admin") {
        medicalRecords = await medicalRecordModel.getAllMedicalRecords()
      } else {
        // Pet owners can only see records for their pets
        const userPets = await petModel.getPetsByOwnerId(currentUser.id)
        const petIds = userPets.map((pet) => pet.pet_id)
        medicalRecords = []
        for (const petId of petIds) {
          const records = await medicalRecordModel.getMedicalRecordsByPetId(petId)
          medicalRecords.push(...records)
        }
      }
    }

    // Transform data for frontend
    const transformedRecords = await Promise.all(
      medicalRecords.map(async (record) => {
        const veterinarian = await userModel.findUserById(record.veterinarian_id)
        return {
          id: record.record_id.toString(),
          petId: record.pet_id.toString(),
          appointmentId: record.appointment_id.toString(),
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          prescription: record.prescription || "",
          notes: record.notes,
          attachments: record.attachments ? JSON.parse(record.attachments) : null,
          createdAt: record.created_at,
          updatedAt: record.updated_at,
          veterinarianId: record.veterinarian_id.toString(),
          veterinarianName: veterinarian?.full_name || "Unknown Veterinarian",
        }
      }),
    )

    return NextResponse.json(transformedRecords)
  } catch (error) {
    console.error("Error fetching medical records:", error)
    return NextResponse.json({ error: "Failed to fetch medical records" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only veterinarians and admins can create medical records
  if (currentUser.role !== "veterinarian" && currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.petId || !data.appointmentId || !data.diagnosis || !data.treatment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create medical record
    const recordId = await medicalRecordModel.createMedicalRecord({
      pet_id: Number.parseInt(data.petId),
      appointment_id: Number.parseInt(data.appointmentId),
      veterinarian_id: currentUser.id,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      prescription: data.prescription || null,
      notes: data.notes || null,
      attachments: data.attachments ? JSON.stringify(data.attachments) : null,
    })

    // Get the created record
    const newRecord = await medicalRecordModel.getMedicalRecordById(recordId)
    if (!newRecord) {
      throw new Error("Failed to create medical record")
    }

    // Transform data for frontend
    const transformedRecord = {
      id: newRecord.record_id.toString(),
      petId: newRecord.pet_id.toString(),
      appointmentId: newRecord.appointment_id.toString(),
      diagnosis: newRecord.diagnosis,
      treatment: newRecord.treatment,
      prescription: newRecord.prescription || "",
      notes: newRecord.notes,
      attachments: newRecord.attachments ? JSON.parse(newRecord.attachments) : null,
      createdAt: newRecord.created_at,
      updatedAt: newRecord.updated_at,
      veterinarianId: newRecord.veterinarian_id.toString(),
      veterinarianName: currentUser.name,
    }

    return NextResponse.json(transformedRecord)
  } catch (error) {
    console.error("Error creating medical record:", error)
    return NextResponse.json({ error: "Failed to create medical record" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only veterinarians and admins can update medical records
  if (currentUser.role !== "veterinarian" && currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Medical record ID is required" }, { status: 400 })
  }

  try {
    const data = await request.json()

    // Get existing record
    const existingRecord = await medicalRecordModel.getMedicalRecordById(Number.parseInt(id))
    if (!existingRecord) {
      return NextResponse.json({ error: "Medical record not found" }, { status: 404 })
    }

    // Update the record
    await medicalRecordModel.updateMedicalRecord(Number.parseInt(id), {
      diagnosis: data.diagnosis || existingRecord.diagnosis,
      treatment: data.treatment || existingRecord.treatment,
      prescription: data.prescription !== undefined ? data.prescription : existingRecord.prescription,
      notes: data.notes !== undefined ? data.notes : existingRecord.notes,
      attachments: data.attachments ? JSON.stringify(data.attachments) : existingRecord.attachments,
    })

    // Get updated record
    const updatedRecord = await medicalRecordModel.getMedicalRecordById(Number.parseInt(id))
    if (!updatedRecord) {
      throw new Error("Failed to get updated medical record")
    }

    // Get veterinarian info
    const veterinarian = await userModel.findUserById(updatedRecord.veterinarian_id)

    // Transform data for frontend
    const transformedRecord = {
      id: updatedRecord.record_id.toString(),
      petId: updatedRecord.pet_id.toString(),
      appointmentId: updatedRecord.appointment_id.toString(),
      diagnosis: updatedRecord.diagnosis,
      treatment: updatedRecord.treatment,
      prescription: updatedRecord.prescription || "",
      notes: updatedRecord.notes,
      attachments: updatedRecord.attachments ? JSON.parse(updatedRecord.attachments) : null,
      createdAt: updatedRecord.created_at,
      updatedAt: updatedRecord.updated_at,
      veterinarianId: updatedRecord.veterinarian_id.toString(),
      veterinarianName: veterinarian?.full_name || "Unknown Veterinarian",
    }

    return NextResponse.json(transformedRecord)
  } catch (error) {
    console.error("Error updating medical record:", error)
    return NextResponse.json({ error: "Failed to update medical record" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only veterinarians and admins can delete medical records
  if (currentUser.role !== "veterinarian" && currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Medical record ID is required" }, { status: 400 })
  }

  try {
    // Check if record exists
    const existingRecord = await medicalRecordModel.getMedicalRecordById(Number.parseInt(id))
    if (!existingRecord) {
      return NextResponse.json({ error: "Medical record not found" }, { status: 404 })
    }

    // Delete the record
    await medicalRecordModel.deleteMedicalRecord(Number.parseInt(id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting medical record:", error)
    return NextResponse.json({ error: "Failed to delete medical record" }, { status: 500 })
  }
}
