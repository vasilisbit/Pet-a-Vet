"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function DbInitializer() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [message, setMessage] = useState("")
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    try {
      setStatus("checking")
      const response = await fetch("/api/db/check")
      const data = await response.json()

      if (data.connected) {
        setStatus("connected")
        setMessage(data.message || "Database connection successful")
      } else {
        setStatus("error")
        setMessage(data.message || "Database connection failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to check database connection")
    }
  }

  async function initializeDatabase() {
    try {
      setIsInitializing(true)
      const response = await fetch("/api/db/init", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setStatus("connected")
        setMessage(data.message || "Database initialized successfully")
      } else {
        setStatus("error")
        setMessage(data.message || "Failed to initialize database")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to initialize database")
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="space-y-4">
      {status === "checking" && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 dark:text-blue-400" />
          <AlertTitle>Checking database connection...</AlertTitle>
        </Alert>
      )}

      {status === "connected" && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
          <AlertTitle className="text-green-700 dark:text-green-400">Connected</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-500">{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900">
          <AlertTitle className="text-red-700 dark:text-red-400">Connection Error</AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-500">{message}</AlertDescription>
          <div className="mt-4 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkConnection}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900"
            >
              Retry Connection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={initializeDatabase}
              disabled={isInitializing}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Initialize Database"
              )}
            </Button>
          </div>
        </Alert>
      )}
    </div>
  )
}
