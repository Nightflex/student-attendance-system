// components/students/qr-scanner.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Camera, CheckCircle, XCircle, Wifi, RefreshCw } from "lucide-react"
import QrScanner from "qr-scanner"

interface QRScannerProps {
  studentId: string
  onScanSuccess?: (data: unknown) => void
  onScanError?: (error: string) => void
}

interface AttendanceData {
  type: string
  qrToken: string
  expiresAt: string
  [key: string]: unknown
}

interface ScanResult {
  type: "success" | "error" | null
  message: string
  timestamp?: string
}

export function QRScanner({ studentId, onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult>({ type: null, message: "" })
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const maxRetries = 3

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const hasCamera = await QrScanner.hasCamera()
        setHasPermission(hasCamera)
      } catch (error) {
        console.error("Camera permission error:", error)
        setHasPermission(false)
      }
    }
    checkPermission()
  }, [])

  const processQRCode = async (qrData: string) => {
    if (isProcessing) return
    setIsProcessing(true)
    
    try {
      const attendanceData: AttendanceData = JSON.parse(qrData)
      
      if (attendanceData.type !== "attendance" || !attendanceData.qrToken) {
        throw new Error("Invalid QR code. Please scan the attendance QR code from your teacher.")
      }

      // Verify QR token hasn't expired
      const now = new Date()
      const expiresAt = new Date(attendanceData.expiresAt as string)
      if (now > expiresAt) {
        throw new Error("QR code has expired. Please scan the new QR code.")
      }

      const response = await fetch(`/api/attendance/scan/${attendanceData.qrToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: parseInt(studentId)
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        const timestamp = new Date().toLocaleTimeString()
        setScanResult({
          type: "success",
          message: `Attendance marked successfully! Welcome ${result.student?.first_name}`,
          timestamp,
        })
        onScanSuccess?.(result)
        stopScanning()
      } else {
        throw new Error(result.error || "Failed to mark attendance")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to read QR code. Please try again."
      setScanResult({
        type: "error",
        message: errorMessage,
      })
      onScanError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const startScanning = async () => {
    if (!videoRef.current || !hasPermission) return

    setIsScanning(true)
    setScanResult({ type: null, message: "" })

    try {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          await processQRCode(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 2,
        },
      )

      await qrScannerRef.current.start()
    } catch (error) {
      console.error("Scanner error:", error)
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1)
        setTimeout(startScanning, 1000)
      } else {
        setScanResult({
          type: "error",
          message: "Failed to start camera after multiple attempts. Please check permissions and try again."
        })
        setIsScanning(false)
      }
    }
  }

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    
    setIsScanning(false)
    setIsProcessing(false)
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(0)
    setScanResult({ type: null, message: "" })
    if (isScanning) {
      stopScanning()
      setTimeout(startScanning, 500)
    } else {
      startScanning()
    }
  }

  if (hasPermission === null) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Wifi className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-gray-500">Checking camera permissions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasPermission === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Camera Access Required
          </CardTitle>
          <CardDescription>Please allow camera access to scan QR codes for attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh and Grant Camera Permission
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Attendance QR Scanner
        </CardTitle>
        <CardDescription>
          Scan the live QR code displayed by your teacher (refreshes every 3 seconds)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ display: isScanning ? "block" : "none" }}
          />

          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm opacity-75">Camera preview will appear here</p>
                <p className="text-xs opacity-50 mt-2">Student ID: {studentId}</p>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-4 border-2 border-white rounded-lg pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm">Marking attendance...</p>
              </div>
            </div>
          )}
        </div>

        {scanResult.type && (
          <Alert
            className={
              scanResult.type === "success"
                ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                : "border-red-200 bg-red-50 dark:bg-red-900/20"
            }
          >
            <div className="flex items-center gap-2">
              {scanResult.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  scanResult.type === "success"
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }
              >
                {scanResult.message}
                {scanResult.timestamp && (
                  <div className="text-xs mt-1 opacity-75">Marked at {scanResult.timestamp}</div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={handleRetry} className="flex-1" disabled={isProcessing}>
              {retryCount > 0 ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Scan ({retryCount}/{maxRetries})
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanning
                </>
              )}
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" className="flex-1 bg-transparent" disabled={isProcessing}>
              Stop Scanning
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Make sure the QR code is clearly visible and well-lit</p>
          <p className="text-blue-600">QR codes refresh every 3 seconds - scan quickly!</p>
        </div>
      </CardContent>
    </Card>
  )
}