"use client"

import { Navigation, MapPin } from "lucide-react"

export default function NavigationPanel() {
  const position = { x: 12.5, y: -8.3, z: 2.1 }
  const confidence = 87
  const drift = 0.34

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Navigation className="w-8 h-8 text-accent" />
        Navigation & Localization
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Position */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Relative Position</h3>
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <div className="space-y-3 font-mono text-sm">
            <div>
              <p className="text-muted-foreground text-xs">X</p>
              <p className="text-lg text-foreground">{position.x} m</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Y</p>
              <p className="text-lg text-foreground">{position.y} m</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Z</p>
              <p className="text-lg text-foreground">{position.z} m</p>
            </div>
          </div>
        </div>

        {/* Localization Confidence */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Localization Confidence</h3>
          <p className="text-4xl font-bold text-accent">{confidence}%</p>
          <div className="w-full bg-border rounded-full h-3 mt-4">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">VIO/SLAM Consensus: Strong</p>
        </div>

        {/* Drift Indicator */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Positional Drift</h3>
          <p className="text-4xl font-bold text-yellow-400">{drift.toFixed(2)} m</p>
          <p className="text-xs text-muted-foreground mt-4">Cumulative drift from last RTB position</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">GNSS Status</h3>
        <div className="bg-muted/30 rounded px-4 py-3 text-sm font-semibold text-muted-foreground">
          ✗ GNSS Not Used - GNSS-Denied Navigation Active
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          All navigation relies on visual odometry and LiDAR SLAM for autonomous operation in GNSS-denied environments.
        </p>
      </div>
    </div>
  )
}
