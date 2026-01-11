"use client"

import { Menu, Power } from "lucide-react"

interface TopNavProps {
  onSidebarToggle: () => void
}

export default function TopNav({ onSidebarToggle }: TopNavProps) {
  return (
    <div className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button onClick={onSidebarToggle} className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-accent truncate">ASCEND</h1>
          <p className="text-xs sm:text-xs text-muted-foreground hidden sm:block">Autonomous Surveyor</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs sm:text-sm font-medium">Mission Status</p>
          <div className="flex items-center gap-2">
            <span className="status-indicator status-idle text-xs">IDLE</span>
          </div>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
          <Power className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
