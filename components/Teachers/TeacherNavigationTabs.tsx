"use client"

import { Button } from "@/components/ui/button"
import { QrCode, Users } from "lucide-react"

type ActiveTab = "qr-generator" | "attendance"

export function TeacherNavigationTabs({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void 
}) {
  return (
    <div className="flex justify-center px-4">
      <div className="flex bg-muted/50 rounded-xl p-1 sm:p-1.5 border sm:w-auto flex-row gap-1.5 w-[110%] mr-0">
        <Button
          variant={activeTab === "qr-generator" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("qr-generator")}
          className={`flex-1 sm:flex-none text-xs sm:text-sm ${activeTab === "qr-generator" ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
        >
          <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          QR Generator
        </Button>
        <Button
          variant={activeTab === "attendance" ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange("attendance")}
          className={`flex-1 sm:flex-none text-xs sm:text-sm ${activeTab === "attendance" ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
        >
          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Manual Attendance
        </Button>
      </div>
    </div>
  )
}