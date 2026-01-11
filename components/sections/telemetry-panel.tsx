"use client"

import { FileText, Filter } from "lucide-react"
import { useState } from "react"

const logs = [
  { time: "14:45:32", type: "Navigation", message: "Localization confidence: 87%", level: "info" },
  { time: "14:45:28", type: "Perception", message: "Feature detection: 4 landmarks identified", level: "info" },
  { time: "14:45:24", type: "Safety", message: "Battery threshold: 87%", level: "info" },
  { time: "14:45:20", type: "Navigation", message: "VIO/SLAM consensus achieved", level: "info" },
  { time: "14:45:16", type: "Perception", message: "LiDAR scan completed", level: "success" },
  { time: "14:45:12", type: "Safety", message: "All systems nominal", level: "success" },
  { time: "14:45:08", type: "Navigation", message: "Drift correction applied", level: "warning" },
]

const filterOptions = ["All", "Navigation", "Perception", "Safety"]

export default function TelemetryPanel() {
  const [filter, setFilter] = useState("All")

  const filteredLogs = filter === "All" ? logs : logs.filter((log) => log.type === filter)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <FileText className="w-8 h-8 text-accent" />
        Logs & Telemetry
      </h1>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Telemetry Log
          </h2>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === option ? "bg-accent text-card" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Log Entries */}
        <div className="space-y-2 bg-muted/10 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs">
          {filteredLogs.map((log, index) => (
            <div key={index} className="flex gap-4 py-2 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground whitespace-nowrap">[{log.time}]</span>
              <span
                className={
                  log.level === "error"
                    ? "text-red-400"
                    : log.level === "warning"
                      ? "text-yellow-400"
                      : log.level === "success"
                        ? "text-green-400"
                        : "text-cyan-400"
                }
              >
                [{log.type}]
              </span>
              <span className="text-foreground flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
