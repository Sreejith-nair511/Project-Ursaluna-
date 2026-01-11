"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { Zap, Eye } from "lucide-react"

export default function Viewer3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const [selectedComponent, setSelectedComponent] = useState<string>("frame")
  const [visibleLayers, setVisibleLayers] = useState({
    frame: true,
    sensors: true,
    electronics: true,
    landing: true,
  })

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0e27)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(5, 3, 5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x6366f1, 1)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x00d4ff, 0.5)
    pointLight.position.set(-5, 5, 5)
    scene.add(pointLight)

    // Create 3D quadcopter model
    const model = new THREE.Group()
    model.name = "quadcopter"

    // Main frame (carbon fiber look)
    const frameGroup = new THREE.Group()
    frameGroup.name = "frame"

    // Center body
    const bodyGeometry = new THREE.BoxGeometry(1, 0.3, 1)
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x1f2937, shininess: 100 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.userData = { component: "body", label: "Main Chassis" }
    frameGroup.add(body)

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2)
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0x2d3748 })

    const armPositions = [
      [1, 0, 1],
      [-1, 0, 1],
      [1, 0, -1],
      [-1, 0, -1],
    ]

    armPositions.forEach((pos) => {
      const arm = new THREE.Mesh(armGeometry, armMaterial)
      arm.position.set(pos[0], pos[1], pos[2])
      arm.userData = { component: "arm", label: "Arm" }
      frameGroup.add(arm)
    })

    model.add(frameGroup)

    // Sensors group
    const sensorsGroup = new THREE.Group()
    sensorsGroup.name = "sensors"

    // Camera (front)
    const cameraGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.2)
    const cameraMaterial = new THREE.MeshPhongMaterial({ color: 0x00d4ff })
    const cameraModule = new THREE.Mesh(cameraGeometry, cameraMaterial)
    cameraModule.position.set(0, -0.3, 0.6)
    cameraModule.userData = { component: "camera", label: "Visual Odometry Camera" }
    sensorsGroup.add(cameraModule)

    // IMU/Sensors (center)
    const imuGeometry = new THREE.SphereGeometry(0.15, 8, 8)
    const imuMaterial = new THREE.MeshPhongMaterial({ color: 0x8b5cf6 })
    const imu = new THREE.Mesh(imuGeometry, imuMaterial)
    imu.position.set(0, 0, 0)
    imu.userData = { component: "imu", label: "IMU/Sensors" }
    sensorsGroup.add(imu)

    // Lidar (top)
    const lidarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.15)
    const lidarMaterial = new THREE.MeshPhongMaterial({ color: 0x06b6d4 })
    const lidar = new THREE.Mesh(lidarGeometry, lidarMaterial)
    lidar.position.set(0, 0.4, 0)
    lidar.userData = { component: "lidar", label: "LiDAR Sensor" }
    sensorsGroup.add(lidar)

    model.add(sensorsGroup)

    // Electronics group
    const electronicsGroup = new THREE.Group()
    electronicsGroup.name = "electronics"

    // Flight controller
    const fcGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.4)
    const fcMaterial = new THREE.MeshPhongMaterial({ color: 0xf59e0b })
    const fc = new THREE.Mesh(fcGeometry, fcMaterial)
    fc.position.set(0, -0.15, 0)
    fc.userData = { component: "flight-controller", label: "Flight Controller" }
    electronicsGroup.add(fc)

    // Battery
    const batteryGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.5)
    const batteryMaterial = new THREE.MeshPhongMaterial({ color: 0x10b981 })
    const battery = new THREE.Mesh(batteryGeometry, batteryMaterial)
    battery.position.set(0, 0.1, 0)
    battery.userData = { component: "battery", label: "Li-Po Battery" }
    electronicsGroup.add(battery)

    model.add(electronicsGroup)

    // Landing legs
    const landingGroup = new THREE.Group()
    landingGroup.name = "landing"

    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5)
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x64748b })

    const legPositions = [
      [0.5, 0, 0.5],
      [-0.5, 0, 0.5],
      [0.5, 0, -0.5],
      [-0.5, 0, -0.5],
    ]

    legPositions.forEach((pos) => {
      const leg = new THREE.Mesh(legGeometry, legMaterial)
      leg.position.set(pos[0], -0.3, pos[2])
      leg.userData = { component: "landing-leg", label: "Landing Leg" }
      landingGroup.add(leg)
    })

    model.add(landingGroup)

    // Add model to scene
    scene.add(model)
    modelRef.current = model

    // Mouse controls
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }

    renderer.domElement.addEventListener("mousedown", (e) => {
      isDragging = true
      previousMousePosition = { x: e.clientX, y: e.clientY }
    })

    renderer.domElement.addEventListener("mousemove", (e) => {
      if (!isDragging || !modelRef.current) return

      const deltaX = e.clientX - previousMousePosition.x
      const deltaY = e.clientY - previousMousePosition.y

      modelRef.current.rotation.y += deltaX * 0.01
      modelRef.current.rotation.x += deltaY * 0.01

      previousMousePosition = { x: e.clientX, y: e.clientY }
    })

    renderer.domElement.addEventListener("mouseup", () => {
      isDragging = false
    })

    // Wheel zoom
    renderer.domElement.addEventListener("wheel", (e) => {
      e.preventDefault()
      camera.position.z += e.deltaY > 0 ? 0.5 : -0.5
      camera.position.z = Math.max(2, Math.min(20, camera.position.z))
    })

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      renderer.domElement.removeEventListener("mousedown", () => {})
      renderer.domElement.removeEventListener("mousemove", () => {})
      renderer.domElement.removeEventListener("mouseup", () => {})
      renderer.domElement.removeEventListener("wheel", () => {})
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  // Update layer visibility
  useEffect(() => {
    if (!modelRef.current) return

    Object.entries(visibleLayers).forEach(([name, visible]) => {
      const child = modelRef.current?.getObjectByName(name)
      if (child) {
        child.visible = visible
      }
    })
  }, [visibleLayers])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Zap className="w-6 sm:w-8 h-6 sm:h-8 text-accent flex-shrink-0" />
          <span className="truncate">3D System Model Viewer</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 3D Viewport */}
        <div className="lg:col-span-3 bg-card border border-border rounded-lg overflow-hidden">
          <div ref={containerRef} className="viewport-3d" style={{ height: "400px" }} />
          <div className="bg-card border-t border-border p-3 sm:p-4 text-xs text-muted-foreground">
            <p>Left-click + drag to rotate • Scroll to zoom</p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4" />
              Visible Layers
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(visibleLayers).map(([layer, visible]) => (
                <label key={layer} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisibleLayers({ ...visibleLayers, [layer]: e.target.checked })}
                    className="w-4 h-4 rounded border-border bg-input accent-accent"
                  />
                  <span className="text-xs sm:text-sm capitalize">{layer}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3 sm:pt-4">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm">Components</h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              {[
                { id: "frame", label: "Carbon Fiber Frame", color: "bg-slate-600" },
                { id: "sensors", label: "Perception Sensors", color: "bg-cyan-400" },
                { id: "electronics", label: "Onboard Computing", color: "bg-amber-400" },
                { id: "landing", label: "Landing Legs", color: "bg-slate-400" },
              ].map((comp) => (
                <div key={comp.id} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded flex-shrink-0 ${comp.color}`} />
                  <span className="text-foreground truncate">{comp.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
