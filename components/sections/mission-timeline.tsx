"use client"

import { CheckCircle2, Circle } from "lucide-react"

const stages = [
  { name: "Takeoff", completed: true },
  { name: "Exploration", completed: true },
  { name: "Feature Detection", completed: false },
  { name: "Return-to-Base", completed: false },
  { name: "Docking", completed: false },
  { name: "Charging", completed: false },
]

export default function MissionTimeline() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Autonomous Mission Timeline</h1>

      <div className="bg-card border border-border rounded-lg p-8">
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                {stage.completed ? (
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                ) : index === 0 ? (
                  <Circle className="w-8 h-8 text-blue-400" />
                ) : (
                  <Circle className="w-8 h-8 text-muted-foreground" />
                )}
                {index < stages.length - 1 && (
                  <div className={`w-1 h-12 mt-2 ${stage.completed ? "bg-green-400/50" : "bg-muted-foreground/30"}`} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{stage.name}</h3>
                <p className="text-sm text-muted-foreground">{stage.completed ? "Completed" : "Pending"}</p>
              </div>
              {stage.completed && (
                <span className="text-xs bg-green-900/30 text-green-400 px-3 py-1 rounded-full">✓ Done</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
