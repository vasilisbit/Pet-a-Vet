"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  PawPrint,
  Plus,
  Heart,
  Activity,
  Clock,
  Edit,
  Trash2,
  AlertTriangle,
  Users,
  ShoppingBag,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { PetForm } from "@/components/pet-form";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth-utils";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  color: string;
  gender: string;
  microchipId?: string;
  medicalConditions?: string;
  allergies?: string;
  medications?: string;
  emergencyContact?: string;
  profileImage: string;
  ownerId: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  petId: string;
  petName: string;
  date: string;
  time: string;
  type: string;
  status: string;
  veterinarianName: string;
}

export default function HomePage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [stats, setStats] = useState({
    totalPets: 0,
    totalCustomers: 0,
    totalAppointments: 0,
    totalProducts: 0,
    recentSales: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (!user) {
          setError("Please log in to view your dashboard");
          return;
        }

        // Fetch pets
        const petsResponse = await fetch("/api/pets");
        if (!petsResponse.ok) {
          throw new Error("Failed to fetch pets");
        }
        const petsData = await petsResponse.json();
        setPets(petsData);

        // Fetch appointments
        const appointmentsResponse = await fetch("/api/appointments");
        if (!appointmentsResponse.ok) {
          throw new Error("Failed to fetch appointments");
        }
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);

        // Fetch dashboard stats if admin
        if (isAdmin(user.role)) {
          const statsResponse = await fetch("/api/dashboard/stats");
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats((prevStats) => ({
              ...prevStats,
              ...statsData,
              // Ensure all expected fields are numbers
              totalCustomers: Number(statsData.totalCustomers || 0),
              totalAppointments: Number(statsData.totalAppointments || 0),
              totalProducts: Number(statsData.totalProducts || 0),
              recentSales: Number(statsData.recentSales || 0),
              pendingOrders: Number(statsData.pendingOrders || 0),
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddPet = async (petData: any) => {
    try {
      // Ensure owner name is set to current user's name
      const dataToSend = {
        ...petData,
        ownerName: currentUser.name,
        ownerId: currentUser.id,
      };

      const response = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add pet");
      }

      const newPet = await response.json();
      setPets([...pets, newPet]);
      setIsAddPetOpen(false);
    } catch (error) {
      console.error("Error adding pet:", error);
      setError("Failed to add pet. Please try again.");
    }
  };

  const handleEditPet = async (petData: any) => {
    if (!editingPet) return;

    try {
      const response = await fetch("/api/pets", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...petData, id: editingPet.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update pet");
      }

      const updatedPet = await response.json();
      setPets(pets.map((pet) => (pet.id === editingPet.id ? updatedPet : pet)));
      setEditingPet(null);
    } catch (error) {
      console.error("Error updating pet:", error);
      setError("Failed to update pet. Please try again.");
    }
  };

  const handleDeletePet = async () => {
    if (!deletingPet) return;

    try {
      const response = await fetch(`/api/pets?id=${deletingPet.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete pet");
      }

      setPets(pets.filter((pet) => pet.id !== deletingPet.id));
      setDeletingPet(null);
    } catch (error) {
      console.error("Error deleting pet:", error);
      setError("Failed to delete pet. Please try again.");
    }
  };

  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter((appointment) => {
      const appointmentDate = new Date(
        `${appointment.date}T${appointment.time}`
      );
      const now = new Date();
      // Include scheduled, approved, and pending appointments
      const validStatuses = ["scheduled", "approved", "pending"];
      return (
        appointmentDate > now &&
        validStatuses.includes(appointment.status.toLowerCase())
      );
    })
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() -
        new Date(`${b.date}T${b.time}`).getTime()
    )
    .slice(0, 3);

  // Get recent appointments
  const recentAppointments = appointments
    .filter((appointment) => appointment.status === "completed")
    .sort(
      (a, b) =>
        new Date(`${b.date}T${b.time}`).getTime() -
        new Date(`${a.date}T${a.time}`).getTime()
    )
    .slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Home Page</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Home Page</h1>
        </div>
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Render different content based on user role
  const renderRoleBasedContent = () => {
    const userRole = currentUser?.role?.toUpperCase();

    // Admin view
    if (isAdmin(currentUser?.role)) {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalCustomers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered customers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Appointments
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalAppointments || 0}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground">In inventory</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(stats.recentSales || 0).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/reports">View Reports</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Orders awaiting processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingOrders || 0}
                </div>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/warehouse/orders">View Orders</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    // Veterinarian view
    else if (userRole === "VETERINARIAN") {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Appointments
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    appointments.filter(
                      (a) =>
                        new Date(a.date).toDateString() ===
                        new Date().toDateString()
                    ).length
                  }
                </div>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/dashboard/appointments">View Schedule</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Medical Records
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/dashboard/medical-records">View Records</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Patients
                </CardTitle>
                <PawPrint className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pets.length}</div>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/dashboard/pets">View Patients</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    // Secretary view
    else if (userRole === "SECRETARY") {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Appointments
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    appointments.filter(
                      (a) =>
                        new Date(a.date).toDateString() ===
                        new Date().toDateString()
                    ).length
                  }
                </div>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/dashboard/appointments">
                    Manage Appointments
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Registered Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalCustomers || "--"}
                </div>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/dashboard/customers">Manage Customers</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Orders
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingOrders || "--"}
                </div>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/dashboard/warehouse/orders">View Orders</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    // Pet Groomer view
    else if (userRole === "PETGROOMER") {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Grooming Appointments
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    appointments.filter(
                      (a) =>
                        new Date(a.date).toDateString() ===
                          new Date().toDateString() && a.type === "GROOMING"
                    ).length
                  }
                </div>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/dashboard/appointments">View Schedule</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Grooming Supplies
                </CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/dashboard/warehouse">Check Inventory</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    // Default Customer view
    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pets.length}</div>
              <p className="text-xs text-muted-foreground">Registered pets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upcomingAppointments.length}
              </div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Health Status
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Good</div>
              <p className="text-xs text-muted-foreground">
                Overall pet health
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Treatments
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  pets.filter(
                    (pet) => pet.medications && pet.medications.trim() !== ""
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Ongoing medications
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* My Pets */}
          <Card>
            <CardHeader>
              <CardTitle>My Pets</CardTitle>
              <CardDescription>Manage your registered pets</CardDescription>
            </CardHeader>
            <CardContent>
              {pets.length > 0 ? (
                <div className="space-y-4">
                  {pets.slice(0, 3).map((pet) => (
                    <div
                      key={pet.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={pet.profileImage || "/placeholder.svg"}
                            alt={pet.name}
                          />
                          <AvatarFallback>
                            {pet.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{pet.name}</p>
                          <p className="text-sm text-gray-500">
                            {pet.breed} • {pet.age} years old
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPet(pet)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingPet(pet)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pets.length > 3 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/pets">
                        View All Pets ({pets.length})
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PawPrint className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">
                    No pets registered
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Get started by adding your first pet.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsAddPetOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled visits</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.petName}</p>
                          <p className="text-sm text-gray-500">
                            {appointment.type} •{" "}
                            {new Date(appointment.date).toLocaleDateString()} at{" "}
                            {appointment.time}
                          </p>
                          <p className="text-xs text-gray-400">
                            Dr. {appointment.veterinarianName}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/appointments">
                      View All Appointments
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">
                    No upcoming appointments
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Schedule your next visit.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/dashboard/appointments">
                      <Plus className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and completed appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="appointments">
                  Recent Appointments
                </TabsTrigger>
                <TabsTrigger value="health">Health Updates</TabsTrigger>
              </TabsList>
              <TabsContent value="appointments" className="space-y-4">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {appointment.petName} - {appointment.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleDateString()} with
                          Dr. {appointment.veterinarianName}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Completed
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-sm text-gray-500">
                      No recent appointments
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="health" className="space-y-4">
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-sm text-gray-500">
                    Health updates will appear here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Home Page</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {currentUser?.name || "User"}!
          </p>
        </div>
        {currentUser?.role?.toUpperCase() === "CUSTOMER" && (
          <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Pet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Pet</DialogTitle>
                <DialogDescription>
                  Add a new pet to your profile.
                </DialogDescription>
              </DialogHeader>
              <PetForm
                onSubmit={handleAddPet}
                initialValues={{ ownerName: currentUser?.name || "" }}
                currentUser={currentUser}
                onCancel={() => setIsAddPetOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {renderRoleBasedContent()}

      {/* Edit Pet Dialog */}
      <Dialog open={!!editingPet} onOpenChange={() => setEditingPet(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pet</DialogTitle>
            <DialogDescription>
              Update your pet's information.
            </DialogDescription>
          </DialogHeader>
          {editingPet && (
            <PetForm
              onSubmit={handleEditPet}
              initialValues={editingPet}
              currentUser={currentUser}
              onCancel={() => setEditingPet(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Pet Dialog */}
      <Dialog open={!!deletingPet} onOpenChange={() => setDeletingPet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingPet?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPet(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePet}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
