import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import * as petModel from "@/lib/db/models/pet";

// Utility function to calculate age from birth date
function calculateAge(birthDate: Date | string | null): number | null {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

// Transform pet data to include calculated age
function transformPetData(pet: any) {
  return {
    ...pet,
    id: pet.pet_id?.toString() || pet.id,
    dateOfBirth: pet.birth_date,
    age: calculateAge(pet.birth_date),
    ownerId: pet.owner_id?.toString() || pet.ownerId,
    microchipId: pet.microchip_id,
    profileImage: pet.profile_image,
  };
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");
    const searchTerm = searchParams.get("search") || "";
    const includeInactive = searchParams.get("includeInactive") === "true";

    let pets = [];

    // If user is a pet owner, only return their pets
    if (user.role === "pet-owner" || user.role === "customer") {
      pets = await petModel.findPetsByOwnerId(
        Number.parseInt(user.id),
        includeInactive
      );
    } else if (ownerId) {
      // If ownerId is specified, return pets for that owner
      pets = await petModel.findPetsByOwnerId(
        Number.parseInt(ownerId),
        includeInactive
      );
    } else if (searchTerm) {
      // If search term is provided, search pets
      pets = await petModel.searchPets(searchTerm, undefined, includeInactive);
    } else {
      // For staff, return all pets if no filters are applied
      // This would need pagination in a real app
      pets = await petModel.getAllPets(includeInactive);
    }

    // Transform pets to include calculated age and standardized field names
    const transformedPets = pets.map(transformPetData);

    return NextResponse.json(transformedPets);
  } catch (error) {
    console.error("Error fetching pets:", error);
    return NextResponse.json(
      { error: "Failed to fetch pets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.species) {
      return NextResponse.json(
        { error: "Name and species are required" },
        { status: 400 }
      );
    }

    // Determine owner ID
    const ownerId =
      user.role === "pet-owner" || user.role === "customer"
        ? Number.parseInt(user.id)
        : data.ownerId
        ? Number.parseInt(data.ownerId)
        : null;

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 }
      );
    }

    // Create pet with correct field names and proper date handling
    const petData: any = {
      owner_id: ownerId,
      name: data.name,
      species: data.species,
      breed: data.breed || null,
      birth_date: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split("T")[0]
        : null,
      gender: data.gender || "UNKNOWN",
      weight: data.weight || null,
      microchip_id: data.microchipId || null,
      profile_image: data.profileImage || null,
      notes: data.notes || null,
      status: "ACTIVE",
    };

    const petId = await petModel.createPet(petData);

    // Get the created pet and transform it
    const pet = await petModel.findPetById(petId);
    const transformedPet = pet ? transformPetData(pet) : null;

    return NextResponse.json(transformedPet, { status: 201 });
  } catch (error) {
    console.error("Error creating pet:", error);
    return NextResponse.json(
      { error: "Failed to create pet" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validate pet ID
    const petId = data.pet_id || data.id;
    if (!petId) {
      return NextResponse.json(
        { error: "Pet ID is required" },
        { status: 400 }
      );
    }

    // Get the pet to check ownership
    const pet = await petModel.findPetById(Number.parseInt(petId.toString()));

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Check if user is authorized to update this pet
    if (user.role === "pet-owner" || user.role === "customer") {
      if (pet.owner_id !== Number.parseInt(user.id)) {
        return NextResponse.json(
          { error: "Not authorized to update this pet" },
          { status: 403 }
        );
      }
    }

    // Create an update object with only the fields that are provided
    const updateData: any = {};

    // Only include fields that are explicitly provided in the request
    if (data.name !== undefined) updateData.name = data.name;
    if (data.species !== undefined) updateData.species = data.species;
    if (data.breed !== undefined) updateData.breed = data.breed;
    if (data.dateOfBirth !== undefined) {
      updateData.birth_date = data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split("T")[0]
        : null;
    }
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.microchipId !== undefined)
      updateData.microchip_id = data.microchipId;
    if (data.profileImage !== undefined)
      updateData.profile_image = data.profileImage;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;

    // Update pet with only the provided fields
    const success = await petModel.updatePet(
      Number.parseInt(petId.toString()),
      updateData
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update pet" },
        { status: 500 }
      );
    }

    // Get the updated pet and transform it
    const updatedPet = await petModel.findPetById(
      Number.parseInt(petId.toString())
    );
    const transformedPet = updatedPet ? transformPetData(updatedPet) : null;

    return NextResponse.json(transformedPet);
  } catch (error) {
    console.error("Error updating pet:", error);
    return NextResponse.json(
      { error: "Failed to update pet" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("id");
    const hardDelete = searchParams.get("hardDelete") === "true";

    if (!petId) {
      return NextResponse.json(
        { error: "Pet ID is required" },
        { status: 400 }
      );
    }

    // Get the pet to check ownership
    const pet = await petModel.findPetById(Number.parseInt(petId));

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Check if user is authorized to delete this pet
    if (user.role === "pet-owner" || user.role === "customer") {
      if (pet.owner_id !== Number.parseInt(user.id)) {
        return NextResponse.json(
          { error: "Not authorized to delete this pet" },
          { status: 403 }
        );
      }
    }

    let success = false;

    // Perform hard delete or soft delete based on parameter
    if (
      hardDelete &&
      (user.role === "admin" || user.role === "ADMINISTRATOR")
    ) {
      // Only admins can perform hard deletes
      success = await petModel.hardDeletePet(Number.parseInt(petId));
    } else {
      // Soft delete for regular users
      success = await petModel.deletePet(Number.parseInt(petId));
    }

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete pet" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pet:", error);
    return NextResponse.json(
      { error: "Failed to delete pet" },
      { status: 500 }
    );
  }
}
