"use client"

import { RockingChair as DockingPlatform, Zap } from "lucide-react"

export default function DockingPanel() {
  const dockingPhase = "Docked"
  const chargingStatus = "Active"
  const lastDockingAccuracy = 4.2

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <DockingPlatform className="w-8 h-8 text-accent" />
        Docking & Charging
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Docking Phase */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Docking Phase</h3>
          <div className="space-y-3">
            {["Aligning", "Landing", "Docked"].map((phase) => (
              <div
                key={phase}
                className={`px-4 py-3 rounded text-sm font-semibold text-center ${
                  phase === dockingPhase
                    ? "bg-accent text-card"
                    : phase === "Docked"
                      ? "bg-green-900/30 text-green-400"
                      : "bg-muted/30 text-muted-foreground"
                }`}
              >
                {phase}
              </div>
            ))}
          </div>
        </div>

        {/* Charging Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Charging Status</h3>
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div className="bg-green-900/30 text-green-400 px-4 py-3 rounded font-semibold text-center">
            {chargingStatus}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">Battery charge: 87%</p>
        </div>

        {/* Docking Accuracy */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Last Docking Accuracy</h3>
          <p className="text-4xl font-bold text-accent">{lastDockingAccuracy} cm</p>
          <p className="text-xs text-muted-foreground mt-4">Alignment precision within tolerance</p>
        </div>
      </div>
    </div>
  )
}
