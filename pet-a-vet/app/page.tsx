import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ShoppingBag,
  BarChart3,
  Users,
  Warehouse,
  PawPrint,
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
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
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/30 dark:to-gray-950 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-6">
              Complete Veterinary Management Solution
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
              Pet-à-Vet is a comprehensive platform for managing veterinary
              services, connecting pet owners with clinics, and streamlining pet
              healthcare.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-50">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Pet Management",
                  description:
                    "Create and manage detailed pet profiles with complete medical history and vaccination records.",
                  icon: (
                    <PawPrint className="h-10 w-10 text-teal-600 dark:text-teal-500" />
                  ),
                },
                {
                  title: "Appointment Scheduling",
                  description:
                    "Book appointments online with automated reminders via email or SMS.",
                  icon: (
                    <Calendar className="h-10 w-10 text-teal-600 dark:text-teal-500" />
                  ),
                },
                {
                  title: "Customer Management",
                  description:
                    "Manage customer profiles, visit history, and financial transactions.",
                  icon: (
                    <Users className="h-10 w-10 text-teal-600 dark:text-teal-500" />
                  ),
                },
                {
                  title: "Warehouse Management",
                  description:
                    "Monitor inventory levels, track expiration dates, and automate ordering.",
                  icon: (
                    <Warehouse className="h-10 w-10 text-teal-600 dark:text-teal-500" />
                  ),
                },
                {
                  title: "Marketplace",
                  description:
                    "Browse and purchase veterinary products and services from local providers.",
                  icon: (
                    <ShoppingBag className="h-10 w-10 text-teal-600 dark:text-teal-500" />
                  ),
                },
                {
                  title: "Analytics & Reporting",
                  description:
                    "Access detailed statistics on clinic performance, financials, and epidemiological data.",
                  icon: (
                    <BarChart3 className="h-10 w-10 text-teal-600 dark:text-teal-500" />
                  ),
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow dark:bg-gray-900"
                >
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-gray-900 dark:text-gray-50">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-50">
              Subscription Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Basic",
                  price: "Free",
                  description: "Essential features for pet owners",
                  features: [
                    "Pet profile management",
                    "Basic appointment booking",
                    "Medical history viewing",
                    "Limited marketplace access",
                  ],
                },
                {
                  title: "Premium",
                  price: "$9.99/month",
                  description: "Enhanced features for dedicated pet owners",
                  features: [
                    "All Basic features",
                    "Priority appointments",
                    "Video consultations",
                    "Full marketplace access",
                    "Vaccination reminders",
                  ],
                },
                {
                  title: "Clinic",
                  price: "$49.99/month",
                  description: "Complete solution for veterinary clinics",
                  features: [
                    "All Premium features",
                    "Customer management",
                    "Inventory management",
                    "Staff scheduling",
                    "Analytics & reporting",
                    "API integrations",
                  ],
                },
              ].map((plan, index) => (
                <Card
                  key={index}
                  className={`border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 ${
                    index === 1 ? "ring-2 ring-teal-500 dark:ring-teal-500" : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-50">
                      {plan.title}
                    </CardTitle>
                    <div className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-50">
                      {plan.price}
                    </div>
                    <CardDescription className="mt-2 dark:text-gray-400">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center text-gray-700 dark:text-gray-300"
                        >
                          <svg
                            className="h-5 w-5 text-teal-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="/register" className="w-full">
                      <Button
                        className={`w-full ${
                          index === 1
                            ? "bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
                            : ""
                        }`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/Pet-a-vet-logo-transparent.png"
                  alt="Pet-à-Vet Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
                <span className="text-xl font-bold text-teal-400">
                  Pet-à-Vet
                </span>
              </div>
              <p className="text-gray-400">
                Comprehensive veterinary management platform for pet owners and
                clinics.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                Features
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>Pet Management</li>
                <li>Appointment Scheduling</li>
                <li>Warehouse Management</li>
                <li>Marketplace</li>
                <li>Analytics & Reporting</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Careers</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>GDPR Compliance</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Pet-à-Vet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
