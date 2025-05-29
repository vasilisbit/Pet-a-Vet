"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Check, CreditCard, LogOut, Mail, User, AlertTriangle } from "lucide-react"
import type { Subscription, SubscriptionPlan } from "@/lib/services/subscription-service"

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "account")
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/user/profile")

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const userData = await response.json()
        setCurrentUser(userData)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load user profile. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleSignOut = async () => {
    try {
      // Make a POST request to the logout API endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // If logout was successful, redirect to the home page
        window.location.href = "/"
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold ml-4 dark:text-white">My Profile</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading profile information...</p>
        </div>
      </div>
    )
  }

  if (error || !currentUser) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold ml-4 dark:text-white">My Profile</h1>
        </div>
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-300">Error</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            {error || "Unable to load profile. Please try again later."}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold ml-4 dark:text-white">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name?.substring(0, 2) || "U"}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-bold dark:text-white">{currentUser.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                  <Badge className="mt-2 capitalize">{currentUser.role?.replace("-", " ") || "User"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                <button
                  className={`flex items-center px-4 py-3 text-left ${
                    activeTab === "account"
                      ? "bg-teal-50 text-teal-900 dark:bg-teal-900/20 dark:text-teal-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("account")}
                >
                  <User className="h-5 w-5 mr-3" />
                  Account
                </button>
                <Separator className="dark:bg-gray-700" />
                <button
                  className={`flex items-center px-4 py-3 text-left ${
                    activeTab === "subscription"
                      ? "bg-teal-50 text-teal-900 dark:bg-teal-900/20 dark:text-teal-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("subscription")}
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  Subscription
                </button>
                <Separator className="dark:bg-gray-700" />
                <button
                  className={`flex items-center px-4 py-3 text-left ${
                    activeTab === "notifications"
                      ? "bg-teal-50 text-teal-900 dark:bg-teal-900/20 dark:text-teal-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <Mail className="h-5 w-5 mr-3" />
                  Notifications
                </button>
              </nav>
            </CardContent>
            <CardFooter className="p-4 border-t dark:border-gray-700">
              <Button
                variant="outline"
                className="w-full text-red-600 dark:text-red-500 dark:border-gray-700"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          {activeTab === "account" && <AccountTab user={currentUser} />}
          {activeTab === "subscription" && <SubscriptionTab />}
          {activeTab === "notifications" && <NotificationsTab />}
        </div>
      </div>
    </div>
  )
}

function AccountTab({ user }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    phone: user.phone || "",
    address: user.address || "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    // Update form data when user prop changes
    setFormData((prev) => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      address: user.address || prev.address,
    }))
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveError(null)
      setSaveSuccess(false)

      // In a real app, this would send data to an API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          // Only include password fields if they're filled
          ...(formData.currentPassword && formData.newPassword
            ? {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
              }
            : {}),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      setSaveSuccess(true)
      setIsEditing(false)

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setSaveError(error.message || "Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-white">Account Information</CardTitle>
        <CardDescription className="dark:text-gray-400">Manage your account details and password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {saveSuccess && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">Success</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Your profile has been updated successfully.
            </AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-300">Error</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400">{saveError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium dark:text-gray-200">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-300">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing || isSaving}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing || isSaving}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="dark:text-gray-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing || isSaving}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="dark:text-gray-300">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing || isSaving}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <Separator className="dark:bg-gray-700" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium dark:text-gray-200">Change Password</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="dark:text-gray-300">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                disabled={!isEditing || isSaving}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="dark:text-gray-300">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing || isSaving}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="dark:text-gray-300">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing || isSaving}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6 dark:border-gray-700">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                // Reset form to original values
                setFormData({
                  name: user.name || "",
                  email: user.email || "",
                  phone: user.phone || "",
                  address: user.address || "",
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                })
                setSaveError(null)
              }}
              disabled={isSaving}
              className="dark:border-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </CardFooter>
    </Card>
  )
}

function SubscriptionTab() {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>({
    id: "sub-basic",
    userId: "user-1",
    planId: "basic",
    planName: "Basic Plan",
    status: "active",
    startDate: new Date().toISOString(),
    endDate: getEndDate(),
    renewalDate: getEndDate(),
    paymentMethod: "free",
  })
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showPlans, setShowPlans] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadSubscriptionData() {
      setLoading(true)
      try {
        // In a real app, this would call an API
        // For now, we'll use mock data
        const mockPlans = [
          {
            id: "basic",
            name: "Basic Plan",
            description: "Free plan for pet owners",
            price: 0,
            features: ["Basic pet profile", "Appointment scheduling", "Medical history access"],
          },
          {
            id: "premium",
            name: "Premium Plan",
            description: "Enhanced features for pet owners",
            price: 9.99,
            features: [
              "Everything in Basic",
              "Priority appointments",
              "Detailed health analytics",
              "Medication reminders",
              "24/7 chat support",
            ],
          },
          {
            id: "clinic",
            name: "Clinic Plan",
            description: "For veterinary clinics and professionals",
            price: 49.99,
            features: [
              "Everything in Premium",
              "Multiple staff accounts",
              "Advanced reporting",
              "Inventory management",
              "Client communication tools",
              "Dedicated support",
            ],
          },
        ]

        setSubscriptionPlans(mockPlans)
      } catch (err) {
        console.error("Error loading subscription data:", err)
        setError("Failed to load subscription data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptionData()
  }, [])

  const handleSubscribe = async (planId: string) => {
    try {
      // In a real app, this would call the API to subscribe to a new plan
      console.log("Subscribing to plan:", planId)

      // Simulate successful subscription
      const plan = subscriptionPlans.find((p) => p.id === planId)
      if (plan) {
        setCurrentSubscription({
          id: `sub-${Date.now()}`,
          userId: "user-1",
          planId: plan.id,
          planName: plan.name,
          status: "active",
          startDate: new Date().toISOString(),
          endDate: getEndDate(),
          renewalDate: getEndDate(),
          paymentMethod: plan.id === "basic" ? "free" : "credit_card",
        })
        setShowPlans(false)
        setSuccess(`Successfully subscribed to the ${plan.name} plan!`)
        setTimeout(() => setSuccess(""), 5000)
      }
    } catch (err) {
      console.error("Error subscribing to plan:", err)
      setError("Failed to subscribe to plan. Please try again.")
      setTimeout(() => setError(""), 5000)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      // In a real app, this would call the API to cancel the subscription
      console.log("Cancelling subscription")

      // Simulate successful cancellation
      if (currentSubscription) {
        setCurrentSubscription({
          ...currentSubscription,
          status: "cancelled",
        })
        setConfirmCancel(false)
        setSuccess("Your subscription has been cancelled successfully.")
        setTimeout(() => setSuccess(""), 5000)
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err)
      setError("Failed to cancel subscription. Please try again.")
      setTimeout(() => setError(""), 5000)
    }
  }

  function getEndDate(): string {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return date.toISOString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="dark:text-white">Subscription</CardTitle>
          <CardDescription className="dark:text-gray-400">Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="dark:text-gray-300">Loading subscription information...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-300">Success</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-300">Error</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="dark:text-white">Subscription</CardTitle>
          <CardDescription className="dark:text-gray-400">Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          {!showPlans ? (
            <div className="space-y-6">
              {currentSubscription ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium dark:text-gray-200">Current Plan</h3>
                    <Badge
                      variant={currentSubscription.status === "active" ? "default" : "outline"}
                      className="capitalize"
                    >
                      {currentSubscription.status}
                    </Badge>
                  </div>

                  <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold dark:text-white">{currentSubscription.planName}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentSubscription.status === "active"
                              ? `Renews on ${new Date(currentSubscription.renewalDate).toLocaleDateString()}`
                              : "Your subscription has been cancelled"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold dark:text-white">
                            {currentSubscription.planId === "basic" ? (
                              "Free"
                            ) : (
                              <>
                                ${getSubscriptionPrice(currentSubscription.planId, subscriptionPlans)}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h5 className="font-medium mb-2 dark:text-gray-200">Subscription Details</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500 dark:text-gray-400">Start Date</div>
                          <div className="dark:text-gray-300">
                            {new Date(currentSubscription.startDate).toLocaleDateString()}
                          </div>

                          <div className="text-gray-500 dark:text-gray-400">End Date</div>
                          <div className="dark:text-gray-300">
                            {new Date(currentSubscription.endDate).toLocaleDateString()}
                          </div>

                          <div className="text-gray-500 dark:text-gray-400">Payment Method</div>
                          <div className="capitalize dark:text-gray-300">
                            {currentSubscription.paymentMethod === "free"
                              ? "Free Plan"
                              : currentSubscription.paymentMethod?.replace("_", " ") || "Not specified"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    {currentSubscription.status === "active" ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setConfirmCancel(true)}
                          className="dark:border-gray-700 dark:text-gray-300"
                        >
                          Cancel Subscription
                        </Button>
                        <Button onClick={() => setShowPlans(true)}>Change Plan</Button>
                      </>
                    ) : (
                      <Button onClick={() => setShowPlans(true)}>Resubscribe</Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium dark:text-gray-200">No Active Subscription</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    You don't have an active subscription. Subscribe to a plan to access premium features.
                  </p>
                  <Button className="mt-4" onClick={() => setShowPlans(true)}>
                    View Plans
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium dark:text-gray-200">Available Plans</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPlans(false)}
                  className="dark:border-gray-700 dark:text-gray-300"
                >
                  Back
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                      plan.id === currentSubscription?.planId && currentSubscription.status === "active"
                        ? "border-teal-500 dark:border-teal-500"
                        : ""
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="dark:text-white">{plan.name}</CardTitle>
                      <CardDescription className="dark:text-gray-400">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-4">
                        <span className="text-3xl font-bold dark:text-white">
                          {plan.id === "basic" ? "Free" : `$${plan.price}`}
                        </span>
                        {plan.id !== "basic" && <span className="text-gray-500 dark:text-gray-400">/month</span>}
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-teal-500 mr-2 shrink-0" />
                            <span className="text-sm dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={
                          plan.id === currentSubscription?.planId && currentSubscription.status === "active"
                            ? "outline"
                            : "default"
                        }
                        disabled={plan.id === currentSubscription?.planId && currentSubscription.status === "active"}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {plan.id === currentSubscription?.planId && currentSubscription.status === "active"
                          ? "Current Plan"
                          : "Subscribe"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent className="dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Cancel Subscription</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to cancel your subscription? You will lose access to premium features at the end of
              your billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmCancel(false)}
              className="dark:border-gray-700 dark:text-gray-300"
            >
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function getSubscriptionPrice(planId: string, plans: SubscriptionPlan[]): number {
  const plan = plans.find((p) => p.id === planId)
  return plan ? plan.price : 0
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    email: {
      appointments: true,
      reminders: true,
      marketing: false,
    },
    push: {
      appointments: true,
      reminders: true,
      marketing: false,
    },
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const handleToggle = (category, type) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type],
      },
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveSuccess(false)
      setSaveError(null)

      // In a real app, this would send data to an API
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      console.log("Saving notification preferences:", notifications)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      setSaveError("Failed to save notification preferences. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-white">Notification Preferences</CardTitle>
        <CardDescription className="dark:text-gray-400">Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">Success</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Your notification preferences have been updated successfully.
            </AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert className="mb-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-300">Error</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400">{saveError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium dark:text-gray-200">Email Notifications</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-appointments" className="flex-1 dark:text-gray-300">
                Appointment Confirmations & Updates
              </Label>
              <input
                type="checkbox"
                id="email-appointments"
                checked={notifications.email.appointments}
                onChange={() => handleToggle("email", "appointments")}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-800"
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-reminders" className="flex-1 dark:text-gray-300">
                Pet Care Reminders
              </Label>
              <input
                type="checkbox"
                id="email-reminders"
                checked={notifications.email.reminders}
                onChange={() => handleToggle("email", "reminders")}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-800"
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-marketing" className="flex-1 dark:text-gray-300">
                Marketing & Promotions
              </Label>
              <input
                type="checkbox"
                id="email-marketing"
                checked={notifications.email.marketing}
                onChange={() => handleToggle("email", "marketing")}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-800"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <Separator className="dark:bg-gray-700" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium dark:text-gray-200">Push Notifications</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-appointments" className="flex-1 dark:text-gray-300">
                Appointment Confirmations & Updates
              </Label>
              <input
                type="checkbox"
                id="push-appointments"
                checked={notifications.push.appointments}
                onChange={() => handleToggle("push", "appointments")}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-800"
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-reminders" className="flex-1 dark:text-gray-300">
                Pet Care Reminders
              </Label>
              <input
                type="checkbox"
                id="push-reminders"
                checked={notifications.push.reminders}
                onChange={() => handleToggle("push", "reminders")}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-800"
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-marketing" className="flex-1 dark:text-gray-300">
                Marketing & Promotions
              </Label>
              <input
                type="checkbox"
                id="push-marketing"
                checked={notifications.push.marketing}
                onChange={() => handleToggle("push", "marketing")}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-800"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6 dark:border-gray-700">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  )
}
