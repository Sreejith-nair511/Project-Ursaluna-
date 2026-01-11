"use client"

import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"

const safetyMode = "Normal"
const monitoredParams = [
  { name: "Battery Voltage", status: "normal", value: "14.8V" },
  { name: "Localization Confidence", status: "normal", value: "87%" },
  { name: "Sensor Health", status: "normal", value: "All OK" },
  { name: "Temperature", status: "normal", value: "45°C" },
]

const failsafeLog = [
  { time: "14:23:45", event: "Battery low threshold triggered", action: "RTB initiated" },
  { time: "14:12:33", event: "Localization spike detected", action: "Automatic recovery" },
  { time: "13:54:21", event: "Sensor dropout detected", action: "Fallback mode" },
]

const modeConfig = {
  normal: {
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-900/30",
  },
  degraded: {
    icon: AlertCircle,
    color: "text-yellow-400",
    bg: "bg-yellow-900/30",
  },
  emergency: {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-900/30",
  },
}

export default function SafetyPanel() {
  const config = modeConfig[safetyMode.toLowerCase() as keyof typeof modeConfig]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <AlertTriangle className="w-8 h-8 text-accent" />
        Safety & Emergency System
      </h1>

      {/* Safety Mode */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Current Safety Mode</h2>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div className={`rounded-lg px-6 py-4 text-lg font-bold ${config.bg} ${config.color}`}>{safetyMode}</div>
      </div>

      {/* Monitored Parameters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Monitored Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monitoredParams.map((param) => (
            <div key={param.name} className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{param.name}</span>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">{param.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fail-safe Action Log */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Fail-safe Action Log</h2>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {failsafeLog.map((log, index) => (
            <div key={index} className="flex gap-4 border-l-2 border-accent pl-4 py-2">
              <p className="text-xs font-mono text-muted-foreground whitespace-nowrap">{log.time}</p>
              <div>
                <p className="text-sm">{log.event}</p>
                <p className="text-xs text-accent">→ {log.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
