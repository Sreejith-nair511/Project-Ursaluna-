"use client"

import { Battery, Signal, RotateCw } from "lucide-react"

export default function MissionOverview() {
  const missionState = "IDLE"
  const sortieCount = 42
  const batteryPercent = 87
  const gnssStatus = "Disabled"

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mission State */}
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mission State</p>
          <div className="mt-4">
            <div className="status-indicator status-idle">{missionState}</div>
          </div>
        </div>

        {/* Sortie Counter */}
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sortie Counter</p>
          <p className="text-4xl font-bold text-accent mt-4">{sortieCount}</p>
        </div>

        {/* Battery */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Battery</p>
            <Battery className="w-4 h-4 text-accent" />
          </div>
          <p className="text-4xl font-bold text-accent mt-4">{batteryPercent}%</p>
          <div className="w-full bg-border rounded-full h-2 mt-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
              style={{ width: `${batteryPercent}%` }}
            />
          </div>
        </div>

        {/* GNSS Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">GNSS Status</p>
            <Signal className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-muted-foreground mt-4">{gnssStatus}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <RotateCw className="w-5 h-5 text-accent" />
          System Status Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Flight Time", value: "2h 34m" },
            { label: "Avg Speed", value: "8.2 m/s" },
            { label: "Max Altitude", value: "127.5 m" },
            { label: "Distance Traveled", value: "45.3 km" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xs text-muted-foreground font-semibold uppercase">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
