"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type FontSize = "xs" | "sm" | "base" | "lg" | "xl"
type Language = "en" | "es" | "fr" | "de"

interface UserPreferences {
  fontSize: FontSize
  fontSizeExact: number // Store exact percentage
  language: Language
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    shareData: boolean
    analytics: boolean
  }
}

interface PreferencesContextType {
  preferences: UserPreferences
  updateFontSize: (size: FontSize) => void
  updateFontSizeExact: (percentage: number) => void
  updateLanguage: (lang: Language) => void
  updateNotificationPreference: (type: keyof UserPreferences["notifications"], value: boolean) => void
  updatePrivacyPreference: (type: keyof UserPreferences["privacy"], value: boolean) => void
  savePreferences: () => void
  hasUnsavedChanges: boolean
  resetPreferences: () => void
}

const defaultPreferences: UserPreferences = {
  fontSize: "base",
  fontSizeExact: 100,
  language: "en",
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  privacy: {
    shareData: false,
    analytics: true,
  },
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [savedPreferences, setSavedPreferences] = useState<UserPreferences>(defaultPreferences)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load preferences from localStorage on initial render
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userPreferences")
    if (storedPreferences) {
      const parsedPreferences = JSON.parse(storedPreferences)

      // Ensure fontSizeExact exists (for backward compatibility)
      if (!parsedPreferences.fontSizeExact) {
        parsedPreferences.fontSizeExact = getFontSizePercentage(parsedPreferences.fontSize)
      }

      setPreferences(parsedPreferences)
      setSavedPreferences(parsedPreferences)
    }
  }, [])

  // Apply font size to document root
  useEffect(() => {
    if (savedPreferences) {
      const root = document.documentElement

      // Remove existing font size classes
      root.classList.remove("text-size-xs", "text-size-sm", "text-size-base", "text-size-lg", "text-size-xl")

      // Add new font size class
      root.classList.add(`text-size-${savedPreferences.fontSize}`)

      // Set CSS variables for font sizes - use exact percentage
      const fontSizeMultiplier = savedPreferences.fontSizeExact / 100
      root.style.setProperty("--font-size-multiplier", fontSizeMultiplier.toString())
    }
  }, [savedPreferences])

  // Get font size multiplier based on selected size
  function getFontSizeMultiplier(fontSize: FontSize): number {
    switch (fontSize) {
      case "xs":
        return 0.8
      case "sm":
        return 0.9
      case "base":
        return 1.0
      case "lg":
        return 1.15
      case "xl":
        return 1.3
      default:
        return 1.0
    }
  }

  // Get font size percentage based on category
  function getFontSizePercentage(fontSize: FontSize): number {
    return getFontSizeMultiplier(fontSize) * 100
  }

  // Check for unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(preferences) !== JSON.stringify(savedPreferences))
  }, [preferences, savedPreferences])

  const updateFontSize = (size: FontSize) => {
    setPreferences((prev) => ({ ...prev, fontSize: size }))
  }

  const updateFontSizeExact = (percentage: number) => {
    setPreferences((prev) => ({ ...prev, fontSizeExact: percentage }))
  }

  const updateLanguage = (lang: Language) => {
    setPreferences((prev) => ({ ...prev, language: lang }))
  }

  const updateNotificationPreference = (type: keyof UserPreferences["notifications"], value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }))
  }

  const updatePrivacyPreference = (type: keyof UserPreferences["privacy"], value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: value,
      },
    }))
  }

  const savePreferences = () => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences))
    setSavedPreferences({ ...preferences })
    setHasUnsavedChanges(false)
  }

  const resetPreferences = () => {
    // Reset to the saved preferences
    setPreferences({ ...savedPreferences })
    setHasUnsavedChanges(false)
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updateFontSize,
        updateFontSizeExact,
        updateLanguage,
        updateNotificationPreference,
        updatePrivacyPreference,
        savePreferences,
        hasUnsavedChanges,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}
