"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PawPrint, Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { PetForm } from "@/components/pet-form"
import { getCurrentUser } from "@/lib/auth"

interface Pet {
  id: string
  pet_id?: string
  name: string
  species: string
  breed: string
  age: number
  weight: number
  color: string
  gender: string
  microchipId?: string
  medicalConditions?: string
  allergies?: string
  medications?: string
  emergencyContact?: string
  profileImage: string
  ownerId: string
  createdAt: string
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [filteredPets, setFilteredPets] = useState<Pet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddPetOpen, setIsAddPetOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (!user) {
          setError("Please log in to view your pets")
          return
        }

        const response = await fetch("/api/pets")
        if (!response.ok) {
          throw new Error("Failed to fetch pets")
        }

        const data = await response.json()
        setPets(data)
        setFilteredPets(data)
      } catch (err) {
        console.error("Error fetching pets:", err)
        setError("Failed to load pets. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchPets()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPets(pets)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = pets.filter(
        (pet) =>
          pet.name.toLowerCase().includes(query) ||
          pet.species.toLowerCase().includes(query) ||
          (pet.breed && pet.breed.toLowerCase().includes(query)),
      )
      setFilteredPets(filtered)
    }
  }, [searchQuery, pets])

  const handleAddPet = async (petData: any) => {
    try {
      // Ensure owner name is set to current user's name
      const dataToSend = {
        ...petData,
        ownerName: currentUser.name,
        ownerId: currentUser.id,
      }

      const response = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add pet")
      }

      const newPet = await response.json()
      setPets([...pets, newPet])
      setIsAddPetOpen(false)

      toast({
        title: "Success",
        description: `${newPet.name} has been added to your pets.`,
      })
    } catch (error) {
      console.error("Error adding pet:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add pet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditPet = async (petData: any) => {
    if (!editingPet) return

    try {
      // Only send fields that have been changed
      const petId = editingPet.id || editingPet.pet_id

      const response = await fetch("/api/pets", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...petData, id: petId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update pet")
      }

      const updatedPet = await response.json()
      setPets(pets.map((pet) => ((pet.id || pet.pet_id) === petId ? updatedPet : pet)))
      setEditingPet(null)

      toast({
        title: "Success",
        description: `${updatedPet.name}'s information has been updated.`,
      })
    } catch (error) {
      console.error("Error updating pet:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update pet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePet = async () => {
    if (!deletingPet) return

    try {
      setDeleteLoading(true)
      const petId = deletingPet.id || deletingPet.pet_id

      const response = await fetch(`/api/pets?id=${petId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete pet")
      }

      setPets(pets.filter((pet) => (pet.id || pet.pet_id) !== petId))

      toast({
        title: "Success",
        description: `${deletingPet.name} has been removed from your pets.`,
      })
    } catch (error) {
      console.error("Error deleting pet:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete pet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeletingPet(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Pets</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading pets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Pets</h1>
        </div>
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Pets</h1>
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
              <DialogDescription>Add a new pet to your profile.</DialogDescription>
            </DialogHeader>
            <PetForm
              onSubmit={handleAddPet}
              initialValues={{ ownerName: currentUser?.name || "" }}
              currentUser={currentUser}
              onCancel={() => setIsAddPetOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search pets..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" className="w-auto">
          <TabsList>
            <TabsTrigger key="all" value="all" onClick={() => setSearchQuery("")}>
              All
            </TabsTrigger>
            <TabsTrigger key="dogs" value="dogs" onClick={() => setSearchQuery("dog")}>
              Dogs
            </TabsTrigger>
            <TabsTrigger key="cats" value="cats" onClick={() => setSearchQuery("cat")}>
              Cats
            </TabsTrigger>
            <TabsTrigger key="others" value="others" onClick={() => setSearchQuery("other")}>
              Others
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <Card key={pet.id || pet.pet_id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="h-40 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={pet.profileImage || "/placeholder.svg"} alt={pet.name} />
                    <AvatarFallback className="text-2xl">{pet.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-xl">{pet.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {pet.breed || pet.species} • {pet.age} years old
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {pet.species}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                    <span className="font-medium capitalize">{pet.gender}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                    <span className="font-medium">{pet.weight} kg</span>
                  </div>
                  {pet.microchipId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Microchip:</span>
                      <span className="font-medium">{pet.microchipId}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/dashboard/pets/${pet.id || pet.pet_id}/medical-history`}>Medical History</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-transparent dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800 dark:border-gray-700"
                    onClick={() => setEditingPet(pet)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/30 dark:border-gray-700 dark:hover:text-red-300"
                    onClick={() => setDeletingPet(pet)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PawPrint className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-lg font-medium">No pets found</h3>
          {searchQuery ? (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try a different search term or add a new pet.
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first pet.</p>
          )}
          <Button className="mt-4" onClick={() => setIsAddPetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Pet
          </Button>
        </div>
      )}

      {/* Edit Pet Dialog */}
      <Dialog open={!!editingPet} onOpenChange={(open) => !open && setEditingPet(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pet</DialogTitle>
            <DialogDescription>Update your pet's information.</DialogDescription>
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
      <Dialog open={!!deletingPet} onOpenChange={(open) => !open && setDeletingPet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingPet?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPet(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePet} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
