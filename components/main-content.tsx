import MissionOverview from "./sections/mission-overview"
import Viewer3D from "./sections/viewer-3d"
import SystemArchitecture from "./sections/system-architecture"
import MissionTimeline from "./sections/mission-timeline"
import FeatureDetection from "./sections/feature-detection"
import NavigationPanel from "./sections/navigation-panel"
import DockingPanel from "./sections/docking-panel"
import SafetyPanel from "./sections/safety-panel"
import TelemetryPanel from "./sections/telemetry-panel"
import AutonomousMissionDemo from "./sections/autonomous-mission-demo"

interface MainContentProps {
  activeSection: string
}

export default function MainContent({ activeSection }: MainContentProps) {
  return (
    <div className="flex-1 overflow-auto bg-background p-4 sm:p-6">
      {activeSection === "overview" && <MissionOverview />}
      {activeSection === "viewer3d" && <Viewer3D />}
      {activeSection === "demo" && <AutonomousMissionDemo />}
      {activeSection === "architecture" && <SystemArchitecture />}
      {activeSection === "timeline" && <MissionTimeline />}
      {activeSection === "features" && <FeatureDetection />}
      {activeSection === "navigation" && <NavigationPanel />}
      {activeSection === "docking" && <DockingPanel />}
      {activeSection === "safety" && <SafetyPanel />}
      {activeSection === "telemetry" && <TelemetryPanel />}
    </div>
  )
}
