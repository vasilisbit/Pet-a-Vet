"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

// Define the schema with proper handling for optional fields
const petFormSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional().nullable(),
  dateOfBirth: z.date().optional().nullable(),
  gender: z.string().optional().nullable(),
  microchipId: z.string().optional().nullable(),
  ownerName: z.string().min(1, "Owner name is required"),
  weight: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  // We'll handle these fields separately with proper null handling
  allergies: z.array(z.string()).default([]).optional().nullable(),
  medications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        startDate: z.date().optional().nullable(),
      })
    )
    .default([])
    .optional()
    .nullable(),
  vaccinations: z
    .array(
      z.object({
        name: z.string(),
        date: z.date().optional().nullable(),
        veterinarian: z.string(),
      })
    )
    .default([])
    .optional()
    .nullable(),
});

type PetFormValues = z.infer<typeof petFormSchema>;

interface PetFormProps {
  onSubmit: (data: PetFormValues) => void;
  onCancel?: () => void;
  initialValues?: Partial<PetFormValues>;
  currentUser?: any;
}

export function PetForm({
  onSubmit,
  onCancel,
  initialValues = {},
  currentUser,
}: PetFormProps) {
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: undefined as Date | undefined,
  });
  const [newVaccination, setNewVaccination] = useState({
    name: "",
    date: undefined as Date | undefined,
    veterinarian: "",
  });

  // Ensure initialValues has safe defaults for arrays
  const safeInitialValues = {
    ...initialValues,
    allergies: initialValues.allergies || [],
    medications: initialValues.medications || [],
    vaccinations: initialValues.vaccinations || [],
  };

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      ownerName: currentUser?.name || "",
      weight: "",
      color: "",
      notes: "",
      ...safeInitialValues,
    },
  });

  // Set initial values when they change (for edit mode)
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      // Set each field individually with null/undefined handling
      if (initialValues.name !== undefined)
        form.setValue("name", initialValues.name);
      if (initialValues.species !== undefined)
        form.setValue("species", initialValues.species);
      if (initialValues.breed !== undefined)
        form.setValue("breed", initialValues.breed || "");
      if (initialValues.dateOfBirth !== undefined)
        form.setValue("dateOfBirth", initialValues.dateOfBirth || null);
      if (initialValues.gender !== undefined)
        form.setValue("gender", initialValues.gender || "");
      if (initialValues.microchipId !== undefined)
        form.setValue("microchipId", initialValues.microchipId || "");
      if (initialValues.weight !== undefined)
        form.setValue("weight", initialValues.weight || "");
      if (initialValues.color !== undefined)
        form.setValue("color", initialValues.color || "");
      if (initialValues.notes !== undefined)
        form.setValue("notes", initialValues.notes || "");

      // Handle arrays with special care
      if (initialValues.allergies)
        form.setValue(
          "allergies",
          Array.isArray(initialValues.allergies) ? initialValues.allergies : []
        );
      if (initialValues.medications)
        form.setValue(
          "medications",
          Array.isArray(initialValues.medications)
            ? initialValues.medications
            : []
        );
      if (initialValues.vaccinations)
        form.setValue(
          "vaccinations",
          Array.isArray(initialValues.vaccinations)
            ? initialValues.vaccinations
            : []
        );
    }

    // Always set owner name from current user if available
    if (currentUser?.name && !initialValues.ownerName) {
      form.setValue("ownerName", currentUser.name);
    }
  }, [initialValues, form, currentUser]);

  const handleSubmit = (data: PetFormValues) => {
    try {
      // Sanitize data before submission
      const sanitizedData = {
        ...data,
        allergies: data.allergies || [],
        medications: data.medications || [],
        vaccinations: data.vaccinations || [],
      };

      onSubmit(sanitizedData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          "There was a problem submitting the form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() !== "") {
      const currentAllergies = form.getValues("allergies") || [];
      form.setValue("allergies", [...currentAllergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    const currentAllergies = form.getValues("allergies") || [];
    form.setValue(
      "allergies",
      currentAllergies.filter((_, i) => i !== index)
    );
  };

  const addMedication = () => {
    if (newMedication.name.trim() !== "") {
      const currentMedications = form.getValues("medications") || [];
      form.setValue("medications", [
        ...currentMedications,
        {
          name: newMedication.name,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency,
          startDate: newMedication.startDate,
        },
      ]);
      setNewMedication({
        name: "",
        dosage: "",
        frequency: "",
        startDate: undefined,
      });
    }
  };

  const removeMedication = (index: number) => {
    const currentMedications = form.getValues("medications") || [];
    form.setValue(
      "medications",
      currentMedications.filter((_, i) => i !== index)
    );
  };

  const addVaccination = () => {
    if (newVaccination.name.trim() !== "") {
      const currentVaccinations = form.getValues("vaccinations") || [];
      form.setValue("vaccinations", [
        ...currentVaccinations,
        {
          name: newVaccination.name,
          date: newVaccination.date,
          veterinarian: newVaccination.veterinarian,
        },
      ]);
      setNewVaccination({
        name: "",
        date: undefined,
        veterinarian: "",
      });
    }
  };

  const removeVaccination = (index: number) => {
    const currentVaccinations = form.getValues("vaccinations") || [];
    form.setValue(
      "vaccinations",
      currentVaccinations.filter((_, i) => i !== index)
    );
  };

  // Safe access to form arrays with null checks
  const allergies = form.watch("allergies") || [];
  const medications = form.watch("medications") || [];
  const vaccinations = form.watch("vaccinations") || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pet Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter pet name"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Species <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="hamster">Hamster</SelectItem>
                      <SelectItem value="guinea_pig">Guinea Pig</SelectItem>
                      <SelectItem value="reptile">Reptile</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breed</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter breed"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50 dark:opacity-70" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="UNKNOWN">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="microchipId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Microchip ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter microchip ID"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    If your pet has a microchip, enter the ID number here
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Owner Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter owner name"
                      {...field}
                      value={field.value || ""}
                      disabled={!!currentUser}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Additional Information</h3>

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter weight"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color/Markings</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter color or markings"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes about your pet"
                      className="min-h-[120px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={() => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an allergy"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addAllergy} size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>

                    {allergies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {allergies.map((allergy, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {allergy}
                            <button
                              type="button"
                              onClick={() => removeAllergy(index)}
                              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                              aria-label={`Remove ${allergy} allergy`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="medications"
          render={() => (
            <FormItem>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <FormLabel>Current Medications</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMedication}
                    disabled={!newMedication.name}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Medication
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Medication Name</Label>
                        <Input
                          placeholder="Enter medication name"
                          value={newMedication.name}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Dosage</Label>
                        <Input
                          placeholder="Enter dosage"
                          value={newMedication.dosage}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              dosage: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Input
                          placeholder="How often to administer"
                          value={newMedication.frequency}
                          onChange={(e) =>
                            setNewMedication({
                              ...newMedication,
                              frequency: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !newMedication.startDate &&
                                  "text-muted-foreground"
                              )}
                            >
                              {newMedication.startDate ? (
                                format(newMedication.startDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50 dark:opacity-70" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newMedication.startDate}
                              onSelect={(date) =>
                                setNewMedication({
                                  ...newMedication,
                                  startDate: date,
                                })
                              }
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {medications.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {medications.map((medication, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{medication.name}</h4>
                              <p className="text-sm text-gray-500">
                                {medication.dosage} - {medication.frequency}
                              </p>
                              {medication.startDate && (
                                <p className="text-sm text-gray-500">
                                  Started: {format(medication.startDate, "PPP")}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeMedication(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No medications added yet.
                  </p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vaccinations"
          render={() => (
            <FormItem>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <FormLabel>Vaccination Records</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVaccination}
                    disabled={!newVaccination.name}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Vaccination
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vaccination Name</Label>
                        <Input
                          placeholder="Enter vaccination name"
                          value={newVaccination.name}
                          onChange={(e) =>
                            setNewVaccination({
                              ...newVaccination,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Date Administered</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !newVaccination.date && "text-muted-foreground"
                              )}
                            >
                              {newVaccination.date ? (
                                format(newVaccination.date, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50 dark:opacity-70" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newVaccination.date}
                              onSelect={(date) =>
                                setNewVaccination({
                                  ...newVaccination,
                                  date: date,
                                })
                              }
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Administered By</Label>
                        <Input
                          placeholder="Veterinarian name"
                          value={newVaccination.veterinarian}
                          onChange={(e) =>
                            setNewVaccination({
                              ...newVaccination,
                              veterinarian: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {vaccinations.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {vaccinations.map((vaccination, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">
                                {vaccination.name}
                              </h4>
                              {vaccination.veterinarian && (
                                <p className="text-sm text-gray-500">
                                  Vet: {vaccination.veterinarian}
                                </p>
                              )}
                              {vaccination.date && (
                                <p className="text-sm text-gray-500">
                                  Date: {format(vaccination.date, "PPP")}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeVaccination(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No vaccination records added yet.
                  </p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Save Pet Profile</Button>
        </div>
      </form>
    </Form>
  );
}
