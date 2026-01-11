"use client"

import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"

const systemStatus = [
  {
    name: "Perception",
    status: "active",
    description: "Visual odometry, LiDAR, and sensor fusion",
    subsystems: ["VO Camera", "LiDAR", "IMU", "Barometer"],
  },
  {
    name: "Navigation (VIO/SLAM)",
    status: "active",
    description: "GNSS-denied autonomous navigation",
    subsystems: ["Visual Odometry", "SLAM", "Localization", "Mapping"],
  },
  {
    name: "Path Planning",
    status: "active",
    description: "Autonomous trajectory generation",
    subsystems: ["Route Planning", "Obstacle Avoidance", "Optimization"],
  },
  {
    name: "Flight Control",
    status: "active",
    description: "Motor and actuator control",
    subsystems: ["Motor Control", "Attitude Control", "Stabilization"],
  },
  {
    name: "Emergency & Fail-safe",
    status: "active",
    description: "Safety mechanisms and RTB protocols",
    subsystems: ["RTB Logic", "Watchdog", "Emergency Landing"],
  },
]

const statusConfig = {
  active: {
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-900/30",
  },
  degraded: {
    icon: AlertCircle,
    color: "text-yellow-400",
    bg: "bg-yellow-900/30",
  },
  fault: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-900/30",
  },
}

export default function SystemArchitecture() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Architecture</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemStatus.map((system) => {
          const config = statusConfig[system.status as keyof typeof statusConfig]
          const Icon = config.icon

          return (
            <div key={system.name} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg">{system.name}</h3>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <p className="text-sm text-muted-foreground mb-4">{system.description}</p>
              <div className={`rounded px-3 py-2 mb-4 text-xs font-semibold ${config.bg} ${config.color}`}>
                {system.status.toUpperCase()}
              </div>
              <div className="space-y-2">
                {system.subsystems.map((subsys) => (
                  <div key={subsys} className="text-xs bg-muted/30 rounded px-3 py-2 text-foreground">
                    {subsys}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
