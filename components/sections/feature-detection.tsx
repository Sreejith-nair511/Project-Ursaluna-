"use client"

import { Zap } from "lucide-react"

const features = [
  {
    id: "FT-001",
    type: "Rock Formation",
    confidence: 94,
    coords: { x: 12.5, y: -8.3, z: 2.1 },
    validation: "Verified",
  },
  {
    id: "FT-002",
    type: "Red Oxide",
    confidence: 87,
    coords: { x: -5.2, y: 3.8, z: 1.5 },
    validation: "Pending",
  },
  {
    id: "FT-003",
    type: "Reflective Surface",
    confidence: 91,
    coords: { x: 0.5, y: 4.2, z: 3.2 },
    validation: "Verified",
  },
  {
    id: "FT-004",
    type: "Rock Formation",
    confidence: 78,
    coords: { x: 8.1, y: -12.5, z: 0.8 },
    validation: "Rejected",
  },
]

export default function FeatureDetection() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Zap className="w-8 h-8 text-accent" />
        Feature Detection & Validation
      </h1>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">ID</th>
                <th className="px-6 py-4 text-left font-semibold">Type</th>
                <th className="px-6 py-4 text-left font-semibold">Confidence</th>
                <th className="px-6 py-4 text-left font-semibold">Coordinates (X, Y, Z)</th>
                <th className="px-6 py-4 text-left font-semibold">Validation</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.id} className="border-b border-border hover:bg-muted/20">
                  <td className="px-6 py-4 font-mono text-accent">{feature.id}</td>
                  <td className="px-6 py-4">{feature.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-border rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: `${feature.confidence}%` }} />
                      </div>
                      <span>{feature.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-muted-foreground text-xs">
                    ({feature.coords.x}, {feature.coords.y}, {feature.coords.z})
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        feature.validation === "Verified"
                          ? "bg-green-900/30 text-green-400"
                          : feature.validation === "Pending"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {feature.validation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
