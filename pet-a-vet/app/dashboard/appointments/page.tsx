"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  User,
  FileText,
  AlertTriangle,
  FileCheck,
  CalendarIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Appointment } from "@/lib/services/appointment-service";
import { getCurrentUser } from "@/lib/auth";
import { MedicalRecordView } from "@/components/medical-record-view";
import { usePreferences } from "@/contexts/preferences-context";

export default function AppointmentsPage() {
  const { preferences } = usePreferences();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isMedicalRecordOpen, setIsMedicalRecordOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [petsLoading, setPetsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [veterinarians, setVeterinarians] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    petId: "",
    petName: "",
    date: "",
    time: "",
    type: "",
    notes: "",
    isEmergency: false,
    veterinarianId: "",
  });
  const [selectedBookingDate, setSelectedBookingDate] = useState<
    Date | undefined
  >(undefined);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);

  // Calculate calendar size based on font size
  const getFontSizeMultiplier = () => {
    switch (preferences.fontSize) {
      case "xs":
        return 0.8;
      case "sm":
        return 0.9;
      case "base":
        return 1.0;
      case "lg":
        return 1.15;
      case "xl":
        return 1.3;
      default:
        return 1.0;
    }
  };

  // Function to fetch available time slots from API
  const fetchAvailableTimeSlots = async (
    date: string,
    veterinarianId: string
  ) => {
    if (!date || !veterinarianId) {
      setAvailableTimeSlots([]);
      return;
    }

    setTimeSlotsLoading(true);
    try {
      const response = await fetch(
        `/api/appointments/available-times?date=${date}&veterinarianId=${veterinarianId}`
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableTimeSlots(data.availableSlots || []);
      } else {
        console.error("Failed to fetch available time slots");
        setAvailableTimeSlots([]);
        toast({
          title: "Error",
          description: "Failed to load available time slots",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      setAvailableTimeSlots([]);
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      });
    } finally {
      setTimeSlotsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get current user
        const user = await getCurrentUser();
        setCurrentUser(user || { id: "user-1", role: "pet-owner" });

        // Fetch pets for the user - only active pets
        if (user) {
          setPetsLoading(true);
          const petsResponse = await fetch("/api/pets");
          if (petsResponse.ok) {
            const petsData = await petsResponse.json();
            // Filter out any pets that might not be active
            const activePets = Array.isArray(petsData)
              ? petsData.filter((pet) => pet.status === "ACTIVE")
              : [];
            setPets(activePets);
          } else {
            console.error("Failed to fetch pets:", await petsResponse.text());
            toast({
              title: "Error",
              description: "Failed to load pets. Please refresh the page.",
              variant: "destructive",
            });
          }
          setPetsLoading(false);
        }

        // Fetch veterinarians
        const vetsResponse = await fetch("/api/veterinarians");
        if (vetsResponse.ok) {
          const vetsData = await vetsResponse.json();
          setVeterinarians(vetsData.veterinarians || []);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchInitialData();
  }, []);

  // Fetch available time slots when date or veterinarian changes
  useEffect(() => {
    if (formData.date && formData.veterinarianId) {
      fetchAvailableTimeSlots(formData.date, formData.veterinarianId);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [formData.date, formData.veterinarianId]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();

        // Add date filter if a date is selected
        if (date) {
          // Create a new date object and extract the date components
          // This approach avoids timezone issues by working with local date components
          const localDate = new Date(date);
          const year = localDate.getFullYear();
          const month = String(localDate.getMonth() + 1).padStart(2, "0");
          const day = String(localDate.getDate()).padStart(2, "0");
          const formattedDate = `${year}-${month}-${day}`;

          params.append("date", formattedDate);
        }

        // Add status filter
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        // Add role-based filters
        if (
          currentUser.role === "pet-owner" ||
          currentUser.role === "customer"
        ) {
          params.append("ownerId", currentUser.id);
        } else if (currentUser.role === "veterinarian") {
          params.append("veterinarianId", currentUser.id);
        }

        const response = await fetch(`/api/appointments?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAppointments();
    }
  }, [date, statusFilter, currentUser]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setBookingError(null); // Clear any previous errors
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setBookingError(null); // Clear any previous errors

    // If selecting a pet, also set the pet name
    if (name === "petId") {
      const selectedPet = pets.find(
        (pet) =>
          pet.pet_id?.toString() === value || pet.id?.toString() === value
      );
      if (selectedPet) {
        setFormData((prev) => ({ ...prev, petName: selectedPet.name }));
      }
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
    setBookingError(null); // Clear any previous errors
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Use local date components to ensure consistent date format
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      setFormData((prev) => ({
        ...prev,
        date: formattedDate,
      }));
      setBookingError(null); // Clear any previous errors
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    try {
      // Validate form data
      if (!formData.petId) {
        setBookingError("Please select a pet");
        return;
      }

      if (!formData.type) {
        setBookingError("Please select a visit type");
        return;
      }

      if (!formData.veterinarianId) {
        setBookingError("Please select a veterinarian");
        return;
      }

      if (!formData.date) {
        setBookingError("Please select a date");
        return;
      }

      if (!formData.time) {
        setBookingError("Please select a time");
        return;
      }

      // Ensure the service type is valid for the database (MEDICAL or GROOMING)
      const serviceType = formData.type === "grooming" ? "GROOMING" : "MEDICAL";

      const appointmentData = {
        petId: formData.petId,
        veterinarianId: formData.veterinarianId,
        date: formData.date,
        time: formData.time,
        type: serviceType, // Use the validated service type
        notes: formData.notes,
        isEmergency: formData.isEmergency,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          // Conflict - duplicate appointment
          setBookingError(
            errorData.error || "This time slot is already booked"
          );
        } else {
          throw new Error(errorData.error || "Failed to book appointment");
        }
        return;
      }

      const newAppointment = await response.json();

      // Update local state
      setAppointments((prev) => [...prev, newAppointment]);

      // Update the calendar date to show the new appointment
      if (formData.date) {
        setDate(new Date(formData.date));
      }

      setIsBookingOpen(false);

      toast({
        title: "Success",
        description: formData.isEmergency
          ? "Emergency appointment request sent. The clinic will contact you shortly."
          : "Appointment booked successfully",
      });

      // Reset form
      setFormData({
        petId: "",
        petName: "",
        date: "",
        time: "",
        type: "",
        notes: "",
        isEmergency: false,
        veterinarianId: "",
      });
    } catch (error) {
      console.error("Error booking appointment:", error);
      setBookingError(
        error instanceof Error ? error.message : "Failed to book appointment"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to book appointment",
        variant: "destructive",
      });
    }
  };

  const handleApproveAppointment = async (appointment: Appointment) => {
    try {
      // In a real app, this would call an API

      // Update local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointment.id ? { ...app, status: "approved" } : app
        )
      );

      toast({
        title: "Success",
        description: "Appointment approved successfully",
      });
    } catch (error) {
      console.error("Error approving appointment:", error);
      toast({
        title: "Error",
        description: "Failed to approve appointment",
        variant: "destructive",
      });
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      // In a real app, this would call an API

      // Update local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === selectedAppointment.id
            ? { ...app, status: "rejected", rejectionReason }
            : app
        )
      );

      setIsRejectionOpen(false);
      setRejectionReason("");
      setSelectedAppointment(null);

      toast({
        title: "Success",
        description: "Appointment rejected successfully",
      });
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast({
        title: "Error",
        description: "Failed to reject appointment",
        variant: "destructive",
      });
    }
  };

  const handleRescheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      // In a real app, this would call an API

      // Update local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === selectedAppointment.id
            ? { ...app, date: formData.date, time: formData.time }
            : app
        )
      );

      setIsRescheduleOpen(false);
      setSelectedAppointment(null);

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
      });
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      // In a real app, this would call an API

      // Update local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointment.id ? { ...app, status: "cancelled" } : app
        )
      );

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  const handleCompleteAppointment = async (appointment: Appointment) => {
    try {
      // In a real app, this would call an API

      // Update local state
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointment.id ? { ...app, status: "completed" } : app
        )
      );

      toast({
        title: "Success",
        description: "Appointment marked as completed",
      });
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast({
        title: "Error",
        description: "Failed to complete appointment",
        variant: "destructive",
      });
    }
  };

  const openRejectionDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsRejectionOpen(true);
  };

  const openRescheduleDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      ...formData,
      date: appointment.date,
      time: appointment.time,
      veterinarianId: appointment.veterinarianId,
    });
    setIsRescheduleOpen(true);

    // Fetch available time slots for the appointment's date and veterinarian
    if (appointment.date && appointment.veterinarianId) {
      fetchAvailableTimeSlots(appointment.date, appointment.veterinarianId);
    }
  };

  const openMedicalRecordDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsMedicalRecordOpen(true);
  };

  // Remove client-side date filtering since API handles it
  const filteredAppointments = appointments;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isStaffOrVet =
    currentUser?.role === "admin" ||
    currentUser?.role === "veterinarian" ||
    currentUser?.role === "clinic-staff" ||
    currentUser?.role === "secretary" ||
    currentUser?.role === "pet-groomer";

  const isPetOwner = currentUser?.role === "pet-owner";
  const isVeterinarian =
    currentUser?.role === "veterinarian" || currentUser?.role === "admin";

  if (isMedicalRecordOpen && selectedAppointment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Medical Records</h1>
        </div>
        <MedicalRecordView
          petId={selectedAppointment.petId}
          appointmentId={selectedAppointment.id}
          onClose={() => {
            setIsMedicalRecordOpen(false);
            setSelectedAppointment(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Appointment Management</h1>
        <Dialog
          open={isBookingOpen}
          onOpenChange={(open) => {
            setIsBookingOpen(open);
            if (!open) {
              // Clear error and reset form when dialog is closed
              setBookingError(null);
              setSelectedBookingDate(undefined);
              setAvailableTimeSlots([]);
              setTimeSlotsLoading(false);
              setFormData({
                petId: "",
                petName: "",
                date: "",
                time: "",
                type: "",
                notes: "",
                isEmergency: false,
                veterinarianId: "",
              });
            } else {
              // Clear any previous errors when opening
              setBookingError(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule a new appointment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBookAppointment}>
              <div className="grid gap-4 py-4">
                {bookingError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 text-sm max-w-full break-words">
                    {bookingError}
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pet" className="text-right">
                    Pet
                  </Label>
                  <Select
                    name="petId"
                    onValueChange={(value) =>
                      handleSelectChange("petId", value)
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={
                          petsLoading ? "Loading pets..." : "Select pet"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {petsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading pets...
                        </SelectItem>
                      ) : pets && pets.length > 0 ? (
                        pets.map((pet) => (
                          <SelectItem
                            key={pet.pet_id || pet.id}
                            value={(pet.pet_id || pet.id).toString()}
                          >
                            {pet.name} ({pet.species})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-pets" disabled>
                          No pets found. Please add a pet first.
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Visit Type
                  </Label>
                  <Select
                    name="type"
                    onValueChange={(value) => handleSelectChange("type", value)}
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check-up">Check-up</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="dental">Dental Cleaning</SelectItem>
                      <SelectItem value="grooming">Grooming</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vet" className="text-right">
                    Veterinarian
                  </Label>
                  <Select
                    name="veterinarianId"
                    onValueChange={(value) =>
                      handleSelectChange("veterinarianId", value)
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select veterinarian" />
                    </SelectTrigger>
                    <SelectContent>
                      {veterinarians.map((vet) => (
                        <SelectItem
                          key={vet.veterinarian_id}
                          value={vet.veterinarian_id.toString()}
                        >
                          {vet.full_name} ({vet.specialization || "General"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedBookingDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 dark:opacity-70" />
                          {selectedBookingDate ? (
                            format(selectedBookingDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedBookingDate}
                          onSelect={(date) => {
                            setSelectedBookingDate(date);
                            if (date) {
                              // Use local date components to ensure consistent date format
                              const year = date.getFullYear();
                              const month = String(
                                date.getMonth() + 1
                              ).padStart(2, "0");
                              const day = String(date.getDate()).padStart(
                                2,
                                "0"
                              );
                              const formattedDate = `${year}-${month}-${day}`;

                              setFormData((prev) => ({
                                ...prev,
                                date: formattedDate,
                              }));
                            } else {
                              setFormData((prev) => ({ ...prev, date: "" }));
                            }
                          }}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Select
                    name="time"
                    onValueChange={(value) => handleSelectChange("time", value)}
                    required
                    disabled={
                      timeSlotsLoading ||
                      !formData.date ||
                      !formData.veterinarianId
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={
                          timeSlotsLoading
                            ? "Loading times..."
                            : !formData.date || !formData.veterinarianId
                            ? "Select date and veterinarian first"
                            : availableTimeSlots.length === 0
                            ? "No available times"
                            : "Select time"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.map((timeSlot) => (
                        <SelectItem key={timeSlot.value} value={timeSlot.label}>
                          {timeSlot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions or concerns"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="emergency" className="text-right">
                    Emergency
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Checkbox
                      id="emergency"
                      checked={formData.isEmergency}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("isEmergency", checked as boolean)
                      }
                    />
                    <label
                      htmlFor="emergency"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      This is an emergency case
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={petsLoading || pets.length === 0}
                >
                  Book Appointment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isRejectionOpen} onOpenChange={setIsRejectionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="col-span-3"
                placeholder="Provide a reason for rejection"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectAppointment}
              disabled={!rejectionReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={isRescheduleOpen}
        onOpenChange={(open) => {
          setIsRescheduleOpen(open);
          if (!open) {
            // Clear available time slots when dialog is closed
            setAvailableTimeSlots([]);
            setTimeSlotsLoading(false);
            setSelectedAppointment(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Please select a new date and time for this appointment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRescheduleAppointment}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reschedule-date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedBookingDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 dark:opacity-70" />
                        {selectedBookingDate ? (
                          format(selectedBookingDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedBookingDate}
                        onSelect={(date) => {
                          setSelectedBookingDate(date);
                          if (date) {
                            // Use local date components to ensure consistent date format
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const day = String(date.getDate()).padStart(2, "0");
                            const formattedDate = `${year}-${month}-${day}`;

                            setFormData((prev) => ({
                              ...prev,
                              date: formattedDate,
                            }));
                          } else {
                            setFormData((prev) => ({ ...prev, date: "" }));
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reschedule-time" className="text-right">
                  Time
                </Label>
                <Select
                  name="time"
                  value={formData.time}
                  onValueChange={(value) => handleSelectChange("time", value)}
                  required
                  disabled={
                    timeSlotsLoading ||
                    !formData.date ||
                    !formData.veterinarianId
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue
                      placeholder={
                        timeSlotsLoading
                          ? "Loading times..."
                          : !formData.date || !formData.veterinarianId
                          ? "Select date and veterinarian first"
                          : availableTimeSlots.length === 0
                          ? "No available times"
                          : "Select time"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map((timeSlot) => (
                      <SelectItem key={timeSlot.value} value={timeSlot.label}>
                        {timeSlot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Reschedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              Select a date to view appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Modern Date Filter */}
              <div>
                <Label htmlFor="date-filter">Filter by date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50 dark:opacity-70" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        // Allow deselecting by clicking the same date
                        if (
                          date &&
                          selectedDate &&
                          date.toDateString() === selectedDate.toDateString()
                        ) {
                          setDate(undefined);
                        } else {
                          // Set using the full date object to maintain consistency
                          setDate(selectedDate);
                        }
                      }}
                      initialFocus
                    />
                    {date && (
                      <div className="p-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDate(undefined)}
                          className="w-full"
                        >
                          Clear selection
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="status-filter">Filter by status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {date
                ? `Appointments for ${date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`
                : "All Appointments"}
            </CardTitle>
            <CardDescription>
              {filteredAppointments.length} appointments
              {date ? " for selected date" : " total"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list">
              <TabsList className="mb-4">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading appointments...</p>
                  </div>
                ) : filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {appointment.time} - {appointment.type}
                              </h3>
                              {appointment.isEmergency && (
                                <Badge
                                  variant="destructive"
                                  className="flex items-center gap-1"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  Emergency
                                </Badge>
                              )}
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <User className="h-3.5 w-3.5 mr-1" />
                              <span>
                                {appointment.petName} ({appointment.ownerName})
                              </span>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              <span>{appointment.veterinarianName}</span>
                            </div>
                            {appointment.notes && (
                              <div className="mt-2 text-sm">
                                <p className="font-medium">Notes:</p>
                                <p className="text-gray-600">
                                  {appointment.notes}
                                </p>
                              </div>
                            )}
                            {appointment.status === "rejected" &&
                              appointment.rejectionReason && (
                                <div className="mt-2 text-sm">
                                  <p className="font-medium text-red-600">
                                    Rejection reason:
                                  </p>
                                  <p className="text-gray-600">
                                    {appointment.rejectionReason}
                                  </p>
                                </div>
                              )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            {/* Medical Record Button - Available for completed appointments or for veterinarians */}
                            {(appointment.status === "completed" ||
                              isVeterinarian) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full flex items-center"
                                onClick={() =>
                                  openMedicalRecordDialog(appointment)
                                }
                              >
                                <FileCheck className="mr-2 h-4 w-4" />
                                Medical Record
                              </Button>
                            )}

                            {/* Staff/Vet Actions */}
                            {isStaffOrVet && (
                              <>
                                {appointment.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full"
                                      onClick={() =>
                                        handleApproveAppointment(appointment)
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full"
                                      onClick={() =>
                                        openRejectionDialog(appointment)
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {appointment.status === "approved" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full"
                                      onClick={() =>
                                        handleCompleteAppointment(appointment)
                                      }
                                    >
                                      Complete
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full"
                                      onClick={() =>
                                        openRescheduleDialog(appointment)
                                      }
                                    >
                                      Reschedule
                                    </Button>
                                  </>
                                )}
                              </>
                            )}

                            {/* Pet Owner Actions */}
                            {isPetOwner && (
                              <>
                                {(appointment.status === "pending" ||
                                  appointment.status === "approved") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() =>
                                      handleCancelAppointment(appointment)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </>
                            )}

                            {/* Common Actions */}
                            {(appointment.status === "pending" ||
                              appointment.status === "approved") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openRescheduleDialog(appointment)
                                }
                              >
                                Reschedule
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No appointments scheduled for this date
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => setIsBookingOpen(true)}
                    >
                      Book Appointment
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timeline">
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 ml-6"></div>
                  <div className="space-y-8 relative">
                    {loading ? (
                      <div className="text-center py-8 pl-16">
                        <p className="text-gray-500">Loading appointments...</p>
                      </div>
                    ) : filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex">
                          <div className="flex-none w-12 text-right text-sm text-gray-500 pt-1">
                            {appointment.time}
                          </div>
                          <div
                            className={`flex-none mx-4 w-4 h-4 rounded-full relative top-1.5 ${
                              appointment.status === "approved"
                                ? "bg-green-500"
                                : appointment.status === "rejected"
                                ? "bg-red-500"
                                : appointment.status === "completed"
                                ? "bg-blue-500"
                                : appointment.status === "cancelled"
                                ? "bg-gray-500"
                                : "bg-yellow-500"
                            }`}
                          ></div>
                          <div className="flex-grow">
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium">
                                        {appointment.type}
                                      </h3>
                                      {appointment.isEmergency && (
                                        <Badge
                                          variant="destructive"
                                          className="flex items-center gap-1"
                                        >
                                          <AlertTriangle className="h-3 w-3" />
                                          Emergency
                                        </Badge>
                                      )}
                                      {getStatusBadge(appointment.status)}
                                    </div>
                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                      <User className="h-3.5 w-3.5 mr-1" />
                                      <span>
                                        {appointment.petName} (
                                        {appointment.ownerName})
                                      </span>
                                    </div>
                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                      <FileText className="h-3.5 w-3.5 mr-1" />
                                      <span>
                                        {appointment.veterinarianName}
                                      </span>
                                    </div>
                                    {appointment.notes && (
                                      <div className="mt-2 text-sm">
                                        <p className="font-medium">Notes:</p>
                                        <p className="text-gray-600">
                                          {appointment.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col space-y-2">
                                    {/* Medical Record Button */}
                                    {(appointment.status === "completed" ||
                                      isVeterinarian) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full flex items-center"
                                        onClick={() =>
                                          openMedicalRecordDialog(appointment)
                                        }
                                      >
                                        <FileCheck className="mr-2 h-4 w-4" />
                                        Medical Record
                                      </Button>
                                    )}

                                    {/* Staff/Vet Actions */}
                                    {isStaffOrVet && (
                                      <>
                                        {appointment.status === "pending" && (
                                          <>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="w-full"
                                              onClick={() =>
                                                handleApproveAppointment(
                                                  appointment
                                                )
                                              }
                                            >
                                              Approve
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="w-full"
                                              onClick={() =>
                                                openRejectionDialog(appointment)
                                              }
                                            >
                                              Reject
                                            </Button>
                                          </>
                                        )}
                                        {appointment.status === "approved" && (
                                          <>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="w-full"
                                              onClick={() =>
                                                handleCompleteAppointment(
                                                  appointment
                                                )
                                              }
                                            >
                                              Complete
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="w-full"
                                              onClick={() =>
                                                openRescheduleDialog(
                                                  appointment
                                                )
                                              }
                                            >
                                              Reschedule
                                            </Button>
                                          </>
                                        )}
                                      </>
                                    )}

                                    {/* Pet Owner Actions */}
                                    {isPetOwner && (
                                      <>
                                        {(appointment.status === "pending" ||
                                          appointment.status ===
                                            "approved") && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() =>
                                              handleCancelAppointment(
                                                appointment
                                              )
                                            }
                                          >
                                            Cancel
                                          </Button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 pl-16">
                        <p className="text-gray-500">
                          No appointments scheduled for this date
                        </p>
                        <Button
                          className="mt-4"
                          onClick={() => setIsBookingOpen(true)}
                        >
                          Book Appointment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
