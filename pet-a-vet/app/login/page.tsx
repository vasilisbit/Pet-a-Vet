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
import { loginUser } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setEmailError(false);
    setPasswordError(false);
    setShowSignUpPrompt(false);

    try {
      const result = await loginUser(email, password);
      router.push(result.redirectPath || "/dashboard");
    } catch (err: any) {
      setIsLoading(false);

      if (err.message === "empty_fields") {
        setError("Please enter both email and password.");
        if (!email) setEmailError(true);
        if (!password) setPasswordError(true);
      } else if (err.message === "user_not_found") {
        setError("No user with these login details.");
        setEmailError(true);
        setShowSignUpPrompt(true);
      } else if (err.message === "incorrect_password") {
        setError("Wrong email or password.");
        setPasswordError(true);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    }
  }

  function handleReturn() {
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-2">
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
            Sign in to your account
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Enter your email and password to access your account
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
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                  emailError
                    ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700"
                    : ""
                }`}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="dark:text-gray-300">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-500 dark:text-teal-500 dark:hover:text-teal-400"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                  passwordError
                    ? "border-red-500 focus-visible:ring-red-500 dark:border-red-700 dark:focus-visible:ring-red-700"
                    : ""
                }`}
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
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
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-teal-600 hover:text-teal-500 dark:text-teal-500 dark:hover:text-teal-400 font-medium"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
        {showSignUpPrompt && (
          <div className="px-6 pb-6">
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
              <AlertDescription className="flex justify-between items-center">
                <span className="dark:text-gray-300">
                  Would you like to create a new account?
                </span>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
                  >
                    Sign Up
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </Card>
    </div>
  );
}
