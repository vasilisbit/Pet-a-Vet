"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Check, Moon, Sun, Monitor, Globe, Bell, Lock } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { usePreferences } from "@/contexts/preferences-context"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const {
    preferences,
    updateFontSize,
    updateLanguage,
    updateNotificationPreference,
    updatePrivacyPreference,
    savePreferences,
    hasUnsavedChanges,
    resetPreferences,
    updateFontSizeExact,
  } = usePreferences()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("appearance")
  const [isSaving, setIsSaving] = useState(false)
  const [fontSizeValue, setFontSizeValue] = useState(100) // Default to 100% (1.0)
  const [previewStyle, setPreviewStyle] = useState({})
  const [initialFontSizeValue, setInitialFontSizeValue] = useState(100)
  const [isSliderMoving, setIsSliderMoving] = useState(false)

  // Initialize font size slider value and save initial font size
  useEffect(() => {
    // Get the exact font size percentage from preferences
    const exactFontSize = preferences.fontSizeExact || 100
    setFontSizeValue(exactFontSize)
    setInitialFontSizeValue(exactFontSize)
  }, [preferences.fontSizeExact])

  // Update preview style when font size changes
  useEffect(() => {
    setPreviewStyle({
      fontSize: `${fontSizeValue / 100}rem`,
    })
  }, [fontSizeValue])

  // Get font size category based on percentage
  function getFontSizeCategory(percentage: number): string {
    if (percentage <= 85) return "xs"
    if (percentage <= 95) return "sm"
    if (percentage <= 107.5) return "base"
    if (percentage <= 122.5) return "lg"
    return "xl"
  }

  // Handle font size slider change
  const handleFontSizeChange = (value: number[]) => {
    const newValue = value[0]
    setFontSizeValue(newValue)
    setIsSliderMoving(true)

    // Calculate the font size multiplier
    const multiplier = newValue / 100

    // Only update the preview style for the preview section
    setPreviewStyle({
      fontSize: `${multiplier}rem`,
    })

    // Update the font size preference with exact percentage
    updateFontSizeExact(newValue)

    // Also update the font size category for compatibility
    const category = getFontSizeCategory(newValue)
    updateFontSize(category as any)
  }

  // Handle slider change end
  const handleSliderChangeEnd = () => {
    if (isSliderMoving && fontSizeValue !== initialFontSizeValue) {
      handleSave()
      setIsSliderMoving(false)
    }
  }

  // Handle save button click
  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    savePreferences()
    setInitialFontSizeValue(fontSizeValue)

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
      duration: 3000,
    })

    setIsSaving(false)
  }

  // Handle discard button click
  const handleDiscard = () => {
    // Reset preferences to saved state
    resetPreferences()

    // Reset font size slider to match saved preferences
    setFontSizeValue(initialFontSizeValue)

    // Reset preview style
    setPreviewStyle({
      fontSize: `${initialFontSizeValue / 100}rem`,
    })

    toast({
      title: "Changes discarded",
      description: "Your changes have been discarded.",
      duration: 3000,
    })
  }

  // Warn user about unsaved changes when navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold ml-4 dark:text-gray-50">Settings</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Language</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-gray-50">Appearance</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Customize how Pet-à-Vet looks and feels. These settings affect your account across all devices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-gray-200">Theme</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Choose the theme for the application. The system theme will automatically adjust based on your
                    device settings.
                  </p>
                  <RadioGroup
                    defaultValue={theme}
                    onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="light"
                        id="theme-light"
                        className="sr-only peer"
                        aria-label="Light theme"
                      />
                      <Label
                        htmlFor="theme-light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                      >
                        <Sun className="mb-3 h-6 w-6" />
                        <span className="text-sm font-medium">Light</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="dark" id="theme-dark" className="sr-only peer" aria-label="Dark theme" />
                      <Label
                        htmlFor="theme-dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                      >
                        <Moon className="mb-3 h-6 w-6" />
                        <span className="text-sm font-medium">Dark</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="system"
                        id="theme-system"
                        className="sr-only peer"
                        aria-label="System theme"
                      />
                      <Label
                        htmlFor="theme-system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                      >
                        <Monitor className="mb-3 h-6 w-6" />
                        <span className="text-sm font-medium">System</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-gray-200">Font Size</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Adjust the font size for better readability. Changes will be applied automatically.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs dark:text-gray-400">80%</span>
                      <span className="text-lg dark:text-gray-400">130%</span>
                    </div>

                    <Slider
                      value={[fontSizeValue]}
                      min={80}
                      max={130}
                      step={1}
                      onValueChange={handleFontSizeChange}
                      onValueCommit={handleSliderChangeEnd}
                      aria-label="Font size"
                    />

                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <span
                          className={`${fontSizeValue <= 85 ? "text-primary font-medium" : "text-muted-foreground"} text-xs dark:text-gray-400`}
                        >
                          XS
                        </span>
                      </div>
                      <div className="text-center">
                        <span
                          className={`${fontSizeValue > 85 && fontSizeValue <= 95 ? "text-primary font-medium" : "text-muted-foreground"} text-sm dark:text-gray-400`}
                        >
                          Small
                        </span>
                      </div>
                      <div className="text-center">
                        <span
                          className={`${fontSizeValue > 95 && fontSizeValue <= 107.5 ? "text-primary font-medium" : "text-muted-foreground"} text-base dark:text-gray-400`}
                        >
                          Medium
                        </span>
                      </div>
                      <div className="text-center">
                        <span
                          className={`${fontSizeValue > 107.5 && fontSizeValue <= 122.5 ? "text-primary font-medium" : "text-muted-foreground"} text-lg dark:text-gray-400`}
                        >
                          Large
                        </span>
                      </div>
                      <div className="text-center">
                        <span
                          className={`${fontSizeValue > 122.5 ? "text-primary font-medium" : "text-muted-foreground"} text-xl dark:text-gray-400`}
                        >
                          XL
                        </span>
                      </div>
                    </div>

                    <div className="p-6 border rounded-md dark:border-gray-700 bg-white dark:bg-gray-800">
                      <h4 className="font-medium mb-3 dark:text-gray-200" style={previewStyle}>
                        Font Size Preview
                      </h4>
                      <p className="dark:text-gray-300 mb-4" style={previewStyle}>
                        This is a preview of how text will appear with the selected font size. The current font size is
                        set to {fontSizeValue}%.
                      </p>
                      <p className="text-sm dark:text-gray-400 mb-4" style={previewStyle}>
                        This is how smaller text will appear in the application.
                      </p>
                      <h3 className="text-lg font-medium dark:text-gray-200 mb-2" style={previewStyle}>
                        Heading Example
                      </h3>
                      <p className="dark:text-gray-300" style={previewStyle}>
                        Pet-à-Vet is a comprehensive platform for managing veterinary services, connecting pet owners
                        with clinics, and streamlining pet healthcare.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-gray-50">Notification Preferences</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Control how and when you receive notifications from Pet-à-Vet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-gray-200">Email Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="dark:text-gray-300">
                        Receive email notifications
                      </Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Get updates about appointments, pet care reminders, and important alerts via email.
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences.notifications.email}
                      onCheckedChange={(checked) => updateNotificationPreference("email", checked)}
                      aria-label="Toggle email notifications"
                    />
                  </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-gray-200">Push Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications" className="dark:text-gray-300">
                        Receive push notifications
                      </Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Get real-time alerts directly on your device for important updates.
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={preferences.notifications.push}
                      onCheckedChange={(checked) => updateNotificationPreference("push", checked)}
                      aria-label="Toggle push notifications"
                    />
                  </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-gray-200">SMS Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications" className="dark:text-gray-300">
                        Receive SMS notifications
                      </Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Get text message alerts for critical updates and appointment reminders.
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={preferences.notifications.sms}
                      onCheckedChange={(checked) => updateNotificationPreference("sms", checked)}
                      aria-label="Toggle SMS notifications"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-gray-50">Language Settings</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Choose your preferred language for the Pet-à-Vet interface.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-gray-200">Interface Language</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Select the language you want to use throughout the application.
                  </p>
                  <Select
                    defaultValue={preferences.language}
                    onValueChange={(value) => updateLanguage(value as "en" | "es" | "fr" | "de")}
                  >
                    <SelectTrigger
                      className="w-full md:w-[300px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                      aria-label="Select language"
                    >
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
                    Note: Changing the language will require saving settings and may reload the page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-gray-50">Privacy Settings</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Control how your data is used and shared within Pet-à-Vet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-gray-200">Data Sharing</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="share-data" className="dark:text-gray-300">
                        Share anonymous usage data
                      </Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Help us improve Pet-à-Vet by sharing anonymous usage data and statistics.
                      </p>
                    </div>
                    <Switch
                      id="share-data"
                      checked={preferences.privacy.shareData}
                      onCheckedChange={(checked) => updatePrivacyPreference("shareData", checked)}
                      aria-label="Toggle data sharing"
                    />
                  </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-gray-200">Analytics</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics" className="dark:text-gray-300">
                        Allow analytics cookies
                      </Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Enable cookies that help us analyze how you use Pet-à-Vet to improve our services.
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={preferences.privacy.analytics}
                      onCheckedChange={(checked) => updatePrivacyPreference("analytics", checked)}
                      aria-label="Toggle analytics"
                    />
                  </div>
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-gray-200">Privacy Policy</h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Review our privacy policy to understand how we collect, use, and protect your data.
                  </p>
                  <Button variant="outline" className="w-full md:w-auto dark:border-gray-700 dark:text-gray-300">
                    View Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {hasUnsavedChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-between items-center z-50 dark:bg-gray-900 dark:border-gray-800">
            <p className="text-sm font-medium dark:text-gray-300">You have unsaved changes</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDiscard} className="dark:border-gray-700 dark:text-gray-300">
                Discard
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
