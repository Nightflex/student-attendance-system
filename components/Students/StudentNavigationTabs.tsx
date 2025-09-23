"use client"

import { Button } from "@/components/ui/button"
import { QrCode, Clock } from "lucide-react"

type ActiveTab = "scanner" | "history"

export function StudentNavigationTabs({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void 
}) {
  return (
    <div className="flex justify-center px-4">
      <div className="flex bg-muted/50 rounded-xl p-1 sm:p-1.5 border w-full sm:w-auto">
        <Button
          variant={activeTab === "scanner" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("scanner")}
          className={`flex-1 sm:flex-none text-xs sm:text-sm ${activeTab === "scanner" ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
        >
          <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          QR Scanner
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("history")}
          className={`flex-1 sm:flex-none text-xs sm:text-sm ${activeTab === "history" ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
        >
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Attendance </span>History
        </Button>
      </div>
    </div>
  )
}