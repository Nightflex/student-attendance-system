import { QrCode, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/types"

interface NavbarProps {
  user: User | null
  handleLogout: () => void
}

export default function StudentNavbar({ user, handleLogout }: NavbarProps) {
  if (!user) return null

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-primary rounded-lg">
            <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">EduAttend</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Smart Attendance System
            </p>
          </div>
        </div>

        {/* Right: User info + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">Student</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-xs sm:text-sm bg-transparent"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
