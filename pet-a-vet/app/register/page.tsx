"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { registerUser } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormField {
  value: string;
  error: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [formFields, setFormFields] = useState<{
    name: FormField;
    email: FormField;
    password: FormField;
    confirmPassword: FormField;
    phone: FormField;
    address: FormField;
    city: FormField;
    postalCode: FormField;
  }>({
    name: { value: "", error: false },
    email: { value: "", error: false },
    password: { value: "", error: false },
    confirmPassword: { value: "", error: false },
    phone: { value: "", error: false },
    address: { value: "", error: false },
    city: { value: "", error: false },
    postalCode: { value: "", error: false },
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormFields((prev) => ({
      ...prev,
      [field]: { value, error: false },
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newFormFields = { ...formFields };

    // Check required fields
    if (!formFields.name.value) {
      newFormFields.name.error = true;
      isValid = false;
    }

    if (!formFields.email.value) {
      newFormFields.email.error = true;
      isValid = false;
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formFields.email.value)) {
        newFormFields.email.error = true;
        isValid = false;
      }
    }

    if (!formFields.password.value) {
      newFormFields.password.error = true;
      isValid = false;
    }

    if (!formFields.confirmPassword.value) {
      newFormFields.confirmPassword.error = true;
      isValid = false;
    } else if (formFields.password.value !== formFields.confirmPassword.value) {
      newFormFields.confirmPassword.error = true;
      isValid = false;
      setError("Passwords do not match");
      return false;
    }

    if (!formFields.phone.value) {
      newFormFields.phone.error = true;
      isValid = false;
    } else {
      // Validate Greek phone number format
      // Accepts: +30 XXXXXXXXXX, 0030 XXXXXXXXXX, or XXXXXXXXXX (10 digits)
      const greekPhoneRegex = /^(?:(?:\+|00)30)?[ ]?([2-9]\d{9})$/;
      if (!greekPhoneRegex.test(formFields.phone.value)) {
        newFormFields.phone.error = true;
        isValid = false;
        setError(
          "Please enter a valid Greek phone number (e.g., +30 2101234567, 0030 2101234567, or 2101234567)"
        );
        return false;
      }
    }

    setFormFields(newFormFields);

    if (!isValid) {
      setError("Incorrect field value. Please check highlighted fields.");
    }

    return isValid;
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(
        formFields.name.value,
        formFields.email.value,
        formFields.password.value,
        formFields.phone.value,
        formFields.address.value,
        formFields.city.value,
        formFields.postalCode.value
      );
      router.push("/dashboard");
    } catch (err: any) {
      setIsLoading(false);

      if (err.message === "missing_required_fields") {
        setError("Please fill in all required fields.");
      } else if (err.message === "invalid_email") {
        setError("Please enter a valid email address.");
        setFormFields((prev) => ({
          ...prev,
          email: { ...prev.email, error: true },
        }));
      } else if (err.message === "user_already_exists") {
        setError("A user with this email already exists.");
        setFormFields((prev) => ({
          ...prev,
          email: { ...prev.email, error: true },
        }));
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  }

  function handleReturn() {
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-6 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-2">
            {" "}
            <Image
              src="/Pet-a-vet-logo-transparent.png"
              alt="Pet-à-Vet Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold text-teal-600 dark:text-teal-500">
              Pet-à-Vet
            </span>
          </div>
          <CardTitle className="text-2xl font-bold dark:text-gray-50">
            Create an account
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="bg-red-50 text-red-500 border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-400"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex dark:text-gray-300">
                    Full Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formFields.name.value}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                      formFields.name.error
                        ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700"
                        : ""
                    }`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex dark:text-gray-300">
                    Email <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formFields.email.value}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                      formFields.email.error
                        ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700"
                        : ""
                    }`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex dark:text-gray-300">
                    Phone <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+30 2101234567"
                    value={formFields.phone.value}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                      formFields.phone.error
                        ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700"
                        : ""
                    }`}
                    required
                  />
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Format: +30 XXXXXXXXXX, 0030 XXXXXXXXXX, or XXXXXXXXXX
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="flex dark:text-gray-300"
                    >
                      Password <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formFields.password.value}
                      onChange={(e) =>
                        handleFieldChange("password", e.target.value)
                      }
                      className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                        formFields.password.error
                          ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700"
                          : ""
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="flex dark:text-gray-300"
                    >
                      Confirm Password{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formFields.confirmPassword.value}
                      onChange={(e) =>
                        handleFieldChange("confirmPassword", e.target.value)
                      }
                      className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                        formFields.confirmPassword.error
                          ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700"
                          : ""
                      }`}
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="dark:text-gray-300">
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main St"
                    value={formFields.address.value}
                    onChange={(e) =>
                      handleFieldChange("address", e.target.value)
                    }
                    className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                      formFields.address.error
                        ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700"
                        : ""
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="dark:text-gray-300">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="New York"
                      value={formFields.city.value}
                      onChange={(e) =>
                        handleFieldChange("city", e.target.value)
                      }
                      className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                        formFields.city.error
                          ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700"
                          : ""
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="dark:text-gray-300">
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="10001"
                      value={formFields.postalCode.value}
                      onChange={(e) =>
                        handleFieldChange("postalCode", e.target.value)
                      }
                      className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                        formFields.postalCode.error
                          ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700"
                          : ""
                      }`}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col space-y-2 pt-2">
              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReturn}
                className="dark:border-gray-700 dark:text-gray-300"
              >
                Return
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-teal-600 hover:text-teal-500 dark:text-teal-500 dark:hover:text-teal-400 font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
