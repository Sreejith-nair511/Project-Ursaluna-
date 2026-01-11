"use client"

import {
  Map,
  Cpu,
  AlertCircle,
  Clock,
  Zap,
  Navigation,
  RockingChair as DockingPlatform,
  FileText,
  Activity,
  X,
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  activeSection: string
  setActiveSection: (section: string) => void
  onClose?: () => void
}

const sections = [
  { id: "demo", label: "Autonomous Mission Demo", icon: Activity },
  { id: "overview", label: "Mission Overview", icon: Map },
  { id: "viewer3d", label: "3D System Model", icon: Cpu },
  { id: "architecture", label: "System Architecture", icon: Cpu },
  { id: "timeline", label: "Mission Timeline", icon: Clock },
  { id: "features", label: "Feature Detection", icon: Zap },
  { id: "navigation", label: "Navigation & Localization", icon: Navigation },
  { id: "docking", label: "Docking & Charging", icon: DockingPlatform },
  { id: "safety", label: "Safety & Emergency", icon: AlertCircle },
  { id: "telemetry", label: "Logs & Telemetry", icon: FileText },
]

export default function Sidebar({ isOpen, activeSection, setActiveSection, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={onClose} />}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:relative z-40 w-64 h-screen bg-sidebar border-r border-sidebar-border overflow-y-auto transition-transform duration-300 md:transition-none`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="font-bold text-accent">Navigation</h2>
            <button onClick={onClose} className="p-1 hover:bg-sidebar-accent/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 sm:space-y-8">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveSection(id)
                  onClose?.()
                }}
                className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-3 transition-all text-sm ${
                  activeSection === id
                    ? "bg-sidebar-primary/20 text-accent border border-accent"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
