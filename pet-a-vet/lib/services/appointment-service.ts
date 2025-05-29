// Appointment service for handling API calls

export interface Appointment {
  id: string
  petId: string
  petName: string
  ownerId: string
  ownerName: string
  veterinarianId: string
  veterinarianName: string
  date: string
  time: string
  type: string
  notes: string
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled"
  isEmergency: boolean
  rejectionReason: string | null
  notificationSent: boolean
  createdAt: string
}

export async function getAppointments(params: Record<string, string> = {}) {
  // Convert params object to query string
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&")

  const response = await fetch(`/api/appointments${queryString ? `?${queryString}` : ""}`)

  if (!response.ok) {
    throw new Error("Failed to fetch appointments")
  }

  return response.json() as Promise<Appointment[]>
}

export async function createAppointment(appointmentData: Partial<Appointment>) {
  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointmentData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create appointment")
  }

  return response.json() as Promise<Appointment>
}

export async function updateAppointment(appointmentData: Partial<Appointment>) {
  if (!appointmentData.id) {
    throw new Error("Appointment ID is required")
  }

  const response = await fetch("/api/appointments", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointmentData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update appointment")
  }

  return response.json() as Promise<Appointment>
}

export async function deleteAppointment(id: string) {
  const response = await fetch(`/api/appointments?id=${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete appointment")
  }

  return response.json()
}

export async function approveAppointment(id: string) {
  return updateAppointment({
    id,
    status: "approved",
  })
}

export async function rejectAppointment(id: string, rejectionReason: string) {
  return updateAppointment({
    id,
    status: "rejected",
    rejectionReason,
  })
}

export async function completeAppointment(id: string) {
  return updateAppointment({
    id,
    status: "completed",
  })
}

export async function cancelAppointment(id: string) {
  return updateAppointment({
    id,
    status: "cancelled",
  })
}
