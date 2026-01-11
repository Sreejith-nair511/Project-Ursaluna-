"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { Play, Pause, RotateCcw, Activity, AlertCircle, Signal } from "lucide-react"

interface DroneComponentTelemetry {
  motorFrontLeft: { rpm: number; temp: number; current: number }
  motorFrontRight: { rpm: number; temp: number; current: number }
  motorBackLeft: { rpm: number; temp: number; current: number }
  motorBackRight: { rpm: number; temp: number; current: number }
  mainBattery: { voltage: number; ampHours: number; health: number }
  imu: { rollPitch: number; yaw: number; status: string }
  gps: { locked: boolean; satellites: number; accuracy: number }
  camera: { resolution: string; fps: number; recording: boolean }
  lidar: { points: number; range: number; status: string }
  processor: { cpuUsage: number; memoryUsage: number; temp: number }
}

interface MissionTelemetry extends DroneComponentTelemetry {
  altitude: number
  speed: number
  distance: number
  batteryPercent: number
  status: string
  marsSurfaceDistance: number
  landingLocked: boolean
  marsLanded: boolean
}

const MISSION_PHASES = [
  { name: "Pre-Flight Check", duration: 2, color: 0xffa500 },
  { name: "Takeoff", duration: 3, color: 0x00ff00 },
  { name: "Climb to Cruise", duration: 4, color: 0x00ffff },
  { name: "Transit to Mars", duration: 10, color: 0xff00ff },
  { name: "Martian Approach", duration: 5, color: 0xffaa00 },
  { name: "Orbital Survey", duration: 6, color: 0xffff00 },
  { name: "Data Collection", duration: 5, color: 0x00ff88 },
  { name: "Return Journey", duration: 10, color: 0xff6600 },
  { name: "Landing Approach", duration: 5, color: 0x0088ff },
  { name: "Final Landing", duration: 4, color: 0x00ff00 },
]

export default function AutonomousMissionDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const droneRef = useRef<THREE.Group | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [missionProgress, setMissionProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [telemetry, setTelemetry] = useState<MissionTelemetry>({
    altitude: 0,
    speed: 0,
    distance: 0,
    batteryPercent: 100,
    status: "Ready",
    marsSurfaceDistance: 0,
    landingLocked: false,
    marsLanded: false,
    motorFrontLeft: { rpm: 0, temp: 25, current: 0 },
    motorFrontRight: { rpm: 0, temp: 25, current: 0 },
    motorBackLeft: { rpm: 0, temp: 25, current: 0 },
    motorBackRight: { rpm: 0, temp: 25, current: 0 },
    mainBattery: { voltage: 14.8, ampHours: 5000, health: 100 },
    imu: { rollPitch: 0, yaw: 0, status: "Calibrated" },
    gps: { locked: false, satellites: 0, accuracy: 0 },
    camera: { resolution: "4K", fps: 30, recording: false },
    lidar: { points: 0, range: 0, status: "Idle" },
    processor: { cpuUsage: 0, memoryUsage: 10, temp: 35 },
  })
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>(0)

  const totalDuration = MISSION_PHASES.reduce((sum, phase) => sum + phase.duration, 0)

  const createMartianTerrain = (scene: THREE.Scene) => {
    const geometry = new THREE.PlaneGeometry(300, 300, 150, 150)
    const positions = geometry.attributes.position as THREE.BufferAttribute
    const posArray = positions.array as Float32Array

    for (let i = 0; i < posArray.length; i += 3) {
      const x = posArray[i]
      const z = posArray[i + 2]
      const crater1 = Math.exp(-((x - 40) ** 2 + (z - 30) ** 2) / 500) * 10
      const crater2 = Math.exp(-((x + 50) ** 2 + (z + 40) ** 2) / 450) * 8
      const crater3 = Math.exp(-((x - 20) ** 2 + (z + 50) ** 2) / 400) * 6
      const baseNoise = Math.sin(x * 0.03) * Math.cos(z * 0.03) * 2
      posArray[i + 1] = crater1 + crater2 + crater3 + baseNoise
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()

    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#C1440E"
    ctx.fillRect(0, 0, 1024, 1024)

    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 1024
      const y = Math.random() * 1024
      const size = Math.random() * 50 + 10
      ctx.fillStyle = `rgba(70, 30, 10, ${Math.random() * 0.3})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.LinearFilter
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0xc1440e,
      emissive: 0x441100,
      shininess: 3,
      wireframe: false,
    })

    const terrain = new THREE.Mesh(geometry, material)
    terrain.rotation.x = -Math.PI / 2
    terrain.position.y = -2
    scene.add(terrain)
    return terrain
  }

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0508)
    scene.fog = new THREE.Fog(0x0a0508, 300, 1000)
    sceneRef.current = scene

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 4000)
    camera.position.set(40, 50, 70)
    camera.lookAt(0, 10, 50)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x4a4a6a, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xff8844, 0.9)
    directionalLight.position.set(80, 100, 60)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 4096
    directionalLight.shadow.mapSize.height = 4096
    directionalLight.shadow.camera.far = 800
    directionalLight.shadow.camera.left = -200
    directionalLight.shadow.camera.right = 200
    directionalLight.shadow.camera.top = 200
    directionalLight.shadow.camera.bottom = -200
    scene.add(directionalLight)

    // Realistic star field
    const starsGeometry = new THREE.BufferGeometry()
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      sRGBColorSpace: true,
      transparent: true,
      opacity: 0.8,
    })
    const starsVertices = []
    for (let i = 0; i < 3000; i++) {
      starsVertices.push((Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 4000)
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(starsVertices), 3))
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // Earth base station
    const baseStation = new THREE.Group()
    baseStation.position.set(-100, 0, -80)

    const padGeometry = new THREE.CylinderGeometry(7, 7, 1.5, 32)
    const padMaterial = new THREE.MeshPhongMaterial({ color: 0x1a472a, emissive: 0x0d2818 })
    const pad = new THREE.Mesh(padGeometry, padMaterial)
    pad.position.y = 0.75
    pad.castShadow = true
    pad.receiveShadow = true
    baseStation.add(pad)

    // Landing pad markers
    const markerGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16)
    const markerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x00aa00 })
    const markerPositions = [
      [-3.5, 1.2, -3.5],
      [3.5, 1.2, -3.5],
      [-3.5, 1.2, 3.5],
      [3.5, 1.2, 3.5],
    ]
    markerPositions.forEach((pos) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.position.set(pos[0], pos[1], pos[2])
      marker.castShadow = true
      baseStation.add(marker)
    })

    // Communication tower
    const towerGeometry = new THREE.CylinderGeometry(0.3, 0.4, 12, 8)
    const towerMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc })
    const tower = new THREE.Mesh(towerGeometry, towerMaterial)
    tower.position.y = 6.5
    tower.castShadow = true
    baseStation.add(tower)

    const dishGeometry = new THREE.SphereGeometry(2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.5)
    const dishMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee, emissive: 0xaaaaaa })
    const dish = new THREE.Mesh(dishGeometry, dishMaterial)
    dish.position.y = 13
    dish.castShadow = true
    baseStation.add(dish)

    scene.add(baseStation)

    // Martian terrain
    const marsTerrain = createMartianTerrain(scene)
    marsTerrain.position.z = 180
    marsTerrain.receiveShadow = true

    // Mars landing pad
    const marsLandingPad = new THREE.Group()
    marsLandingPad.position.set(60, 8, 180)

    const marsGroundPad = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 8, 0.8, 32),
      new THREE.MeshPhongMaterial({ color: 0x5a4a2a, emissive: 0x3a2a1a }),
    )
    marsGroundPad.castShadow = true
    marsGroundPad.receiveShadow = true
    marsLandingPad.add(marsGroundPad)

    const marsMarkerPositions = [
      [-4, 0.6, -4],
      [4, 0.6, -4],
      [-4, 0.6, 4],
      [4, 0.6, 4],
    ]
    marsMarkerPositions.forEach((pos) => {
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16),
        new THREE.MeshPhongMaterial({ color: 0xff6633, emissive: 0xff3300 }),
      )
      marker.position.set(pos[0], pos[1], pos[2])
      marker.castShadow = true
      marsLandingPad.add(marker)
    })

    scene.add(marsLandingPad)

    // Advanced drone with detailed components
    const drone = new THREE.Group()

    // Main chassis
    const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 1)
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a73e8,
      emissive: 0x0d47a1,
      shininess: 100,
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.castShadow = true
    body.receiveShadow = true
    drone.add(body)

    // Battery pack (green)
    const batteryGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.4)
    const batteryMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x00aa00,
    })
    const battery = new THREE.Mesh(batteryGeometry, batteryMaterial)
    battery.position.y = -0.3
    battery.castShadow = true
    drone.add(battery)

    // Processor unit (orange)
    const procGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.5)
    const procMaterial = new THREE.MeshPhongMaterial({
      color: 0xff9800,
      emissive: 0xff6600,
    })
    const processor = new THREE.Mesh(procGeometry, procMaterial)
    processor.position.set(0, 0.2, 0)
    processor.castShadow = true
    drone.add(processor)

    // LiDAR sensor (cyan)
    const lidarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16)
    const lidarMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x0088ff,
    })
    const lidar = new THREE.Mesh(lidarGeometry, lidarMaterial)
    lidar.position.set(0, -0.35, 0)
    lidar.castShadow = true
    drone.add(lidar)

    // Camera (magenta)
    const cameraMeshGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.4)
    const cameraMeshMaterial = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      emissive: 0xcc00cc,
    })
    const cameraMesh = new THREE.Mesh(cameraMeshGeometry, cameraMeshMaterial)
    cameraMesh.position.set(0, -0.1, 0.65)
    cameraMesh.castShadow = true
    drone.add(cameraMesh)

    // Four arms with motors
    const armGeometry = new THREE.CylinderGeometry(0.12, 0.12, 2.2)
    const armMaterial = new THREE.MeshPhongMaterial({
      color: 0x0d47a1,
      emissive: 0x061f3f,
    })

    const arms = [
      { pos: [1.4, 0.15, 1.4], rot: Math.PI / 4, name: "frontLeft" },
      { pos: [-1.4, 0.15, 1.4], rot: (3 * Math.PI) / 4, name: "frontRight" },
      { pos: [1.4, 0.15, -1.4], rot: -Math.PI / 4, name: "backLeft" },
      { pos: [-1.4, 0.15, -1.4], rot: (-3 * Math.PI) / 4, name: "backRight" },
    ]

    const propellers = [] as THREE.Mesh[]
    arms.forEach((arm) => {
      const armMesh = new THREE.Mesh(armGeometry, armMaterial)
      armMesh.rotation.z = arm.rot
      armMesh.position.set(arm.pos[0], arm.pos[1], arm.pos[2])
      armMesh.castShadow = true
      drone.add(armMesh)

      // Motor
      const motorGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 32)
      const motorMaterial = new THREE.MeshPhongMaterial({
        color: 0xff6633,
        emissive: 0xff3300,
      })
      const motor = new THREE.Mesh(motorGeometry, motorMaterial)
      const motorDist = 2.2
      motor.position.set((arm.pos[0] / 1.4) * motorDist, arm.pos[1] + 0.8, (arm.pos[2] / 1.4) * motorDist)
      motor.castShadow = true
      drone.add(motor)

      // Propeller
      const propGeometry = new THREE.BoxGeometry(2.4, 0.06, 0.25)
      const propMaterial = new THREE.MeshPhongMaterial({
        color: 0xdddddd,
        emissive: 0x666666,
      })
      const prop = new THREE.Mesh(propGeometry, propMaterial)
      prop.position.copy(motor.position)
      prop.castShadow = true
      drone.add(prop)
      propellers.push(prop)
    })

    drone.position.set(-100, 1, -80)
    droneRef.current = drone
    scene.add(drone)

    let lastFrameTime = Date.now()

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      const currentTime = Date.now()
      const deltaTime = (currentTime - lastFrameTime) / 1000
      lastFrameTime = currentTime

      if (isPlaying && droneRef.current) {
        const elapsedTime = (currentTime - startTimeRef.current) / 1000
        const progress = Math.min(elapsedTime / totalDuration, 1)

        setMissionProgress(progress * 100)

        let timeInPhase = 0
        let phaseIndex = 0
        for (let i = 0; i < MISSION_PHASES.length; i++) {
          if (timeInPhase + MISSION_PHASES[i].duration > elapsedTime) {
            phaseIndex = i
            break
          }
          timeInPhase += MISSION_PHASES[i].duration
        }
        setCurrentPhase(phaseIndex)

        const phaseProgress = (elapsedTime - timeInPhase) / MISSION_PHASES[phaseIndex].duration

        const position = new THREE.Vector3(-100, 1, -80)
        let newAltitude = 0
        let newSpeed = 0
        let newDistance = 0
        let marsSurfaceDistance = 0
        let landingLocked = false
        let marsLanded = false

        if (phaseIndex < 2) {
          // Takeoff
          newAltitude = phaseProgress * 30
          position.y = newAltitude
          newSpeed = phaseProgress * 25
          const motorRpm = phaseProgress * 6000
          const motorCurrent = phaseProgress * 18

          setTelemetry((prev) => ({
            ...prev,
            motorFrontLeft: {
              rpm: motorRpm,
              temp: 35 + phaseProgress * 25,
              current: motorCurrent,
            },
            motorFrontRight: {
              rpm: motorRpm,
              temp: 35 + phaseProgress * 25,
              current: motorCurrent,
            },
            motorBackLeft: {
              rpm: motorRpm,
              temp: 35 + phaseProgress * 25,
              current: motorCurrent,
            },
            motorBackRight: {
              rpm: motorRpm,
              temp: 35 + phaseProgress * 25,
              current: motorCurrent,
            },
            gps: { locked: true, satellites: 14 + Math.floor(phaseProgress * 2), accuracy: 1.2 },
            camera: { resolution: "4K", fps: 30, recording: true },
            processor: { cpuUsage: 30 + phaseProgress * 30, memoryUsage: 20, temp: 38 },
          }))
        } else if (phaseIndex < 5) {
          // Transit to Mars
          newAltitude = 30 + phaseProgress * 150
          position.x = -100 + phaseProgress * 160
          position.z = -80 + phaseProgress * 260
          position.y = newAltitude
          newSpeed = 50
          newDistance = phaseProgress * 320
          const motorRpm = 6000 + phaseProgress * 2500

          setTelemetry((prev) => ({
            ...prev,
            motorFrontLeft: { rpm: motorRpm, temp: 55 + phaseProgress * 15, current: 22 },
            motorFrontRight: { rpm: motorRpm, temp: 55 + phaseProgress * 15, current: 22 },
            motorBackLeft: { rpm: motorRpm, temp: 55 + phaseProgress * 15, current: 22 },
            motorBackRight: { rpm: motorRpm, temp: 55 + phaseProgress * 15, current: 22 },
            processor: { cpuUsage: 65 + phaseProgress * 25, memoryUsage: 50, temp: 62 },
            camera: { resolution: "4K", fps: 30, recording: true },
            lidar: { points: Math.floor(phaseProgress * 80000), range: phaseProgress * 250, status: "Mapping" },
          }))
        } else if (phaseIndex < 8) {
          // Martian orbit & data collection
          const centerX = 60
          const centerZ = 180
          const orbitalRadius = 50
          const angle = phaseProgress * Math.PI * 2
          position.x = centerX + Math.cos(angle) * orbitalRadius
          position.y = 95 + Math.sin(angle * 0.7) * 30
          position.z = centerZ + Math.sin(angle) * orbitalRadius

          newAltitude = 85
          newSpeed = 30
          newDistance = 320 + orbitalRadius * phaseProgress * Math.PI
          marsSurfaceDistance = 85

          const lidarPoints = phaseIndex === 6 ? Math.floor(80000 + phaseProgress * 80000) : 80000

          setTelemetry((prev) => ({
            ...prev,
            motorFrontLeft: { rpm: 6500, temp: 60, current: 20 },
            motorFrontRight: { rpm: 6500, temp: 60, current: 20 },
            motorBackLeft: { rpm: 6500, temp: 60, current: 20 },
            motorBackRight: { rpm: 6500, temp: 60, current: 20 },
            gps: { locked: false, satellites: 0, accuracy: 0 },
            camera: { resolution: "4K", fps: 30, recording: phaseIndex === 6 },
            lidar: {
              points: lidarPoints,
              range: 200,
              status: phaseIndex === 6 ? "Recording" : "Scanning",
            },
            processor: { cpuUsage: 85, memoryUsage: 80, temp: 68 },
          }))
        } else {
          // Return and landing
          const startPos = new THREE.Vector3(60, 95, 180)
          const endPos = new THREE.Vector3(60, 9, 180)

          if (phaseIndex < 9) {
            // Return journey
            position.lerpVectors(startPos, new THREE.Vector3(60, 40, 180), phaseProgress)
            newAltitude = 95 - phaseProgress * 55
            newSpeed = 50 - phaseProgress * 40
            marsSurfaceDistance = newAltitude - 8
          } else {
            // Final landing on Mars
            position.lerpVectors(new THREE.Vector3(60, 40, 180), endPos, phaseProgress)
            newAltitude = 40 - phaseProgress * 31
            newSpeed = 10 - phaseProgress * 10
            marsSurfaceDistance = Math.max(0, newAltitude - 8)
            landingLocked = phaseProgress > 0.3

            if (phaseProgress > 0.85) {
              marsLanded = true

              setTelemetry((prev) => ({
                ...prev,
                motorFrontLeft: { rpm: (1 - phaseProgress) * 1500, temp: 42, current: 3 },
                motorFrontRight: { rpm: (1 - phaseProgress) * 1500, temp: 42, current: 3 },
                motorBackLeft: { rpm: (1 - phaseProgress) * 1500, temp: 42, current: 3 },
                motorBackRight: { rpm: (1 - phaseProgress) * 1500, temp: 42, current: 3 },
                imu: { rollPitch: 0, yaw: 0, status: "Landed" },
              }))
            }
          }
        }

        droneRef.current.position.copy(position)

        // Spinning propellers with RPM sync
        propellers.forEach((prop) => {
          const rpmFactor = telemetry.motorFrontLeft.rpm / 1000
          prop.rotation.y += deltaTime * rpmFactor * 2
        })

        const batteryDrain = progress * 0.85
        setTelemetry((prev) => ({
          ...prev,
          altitude: Math.max(0, newAltitude),
          speed: Math.max(0, newSpeed),
          distance: newDistance,
          batteryPercent: Math.max(8, 100 - batteryDrain * 100),
          status: MISSION_PHASES[phaseIndex].name,
          marsSurfaceDistance: Math.max(0, marsSurfaceDistance),
          landingLocked,
          marsLanded,
          mainBattery: {
            voltage: 14.8 - batteryDrain * 2.5,
            ampHours: 5000,
            health: Math.max(75, 100 - progress * 25),
          },
        }))

        // Dynamic cinematic camera
        const cameraDistance = 45 + Math.sin(elapsedTime * 0.25) * 15
        const cameraHeight = 30 + Math.cos(elapsedTime * 0.15) * 8
        cameraRef.current!.position.x = droneRef.current.position.x + Math.sin(elapsedTime * 0.25) * cameraDistance
        cameraRef.current!.position.y = droneRef.current.position.y + cameraHeight
        cameraRef.current!.position.z = droneRef.current.position.z + Math.cos(elapsedTime * 0.25) * cameraDistance
        cameraRef.current!.lookAt(
          droneRef.current.position.x,
          droneRef.current.position.y + 5,
          droneRef.current.position.z,
        )

        if (progress >= 1) {
          setIsPlaying(false)
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width
      const newHeight = containerRef.current?.clientHeight || height
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      renderer.dispose()
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [isPlaying])

  const handlePlay = () => {
    setIsPlaying(true)
    startTimeRef.current = Date.now()
  }

  const handleReset = () => {
    setIsPlaying(false)
    setMissionProgress(0)
    setCurrentPhase(0)
    setTelemetry((prev) => ({
      ...prev,
      altitude: 0,
      speed: 0,
      distance: 0,
      batteryPercent: 100,
      status: "Ready",
      marsSurfaceDistance: 0,
      landingLocked: false,
      marsLanded: false,
      motorFrontLeft: { rpm: 0, temp: 25, current: 0 },
      motorFrontRight: { rpm: 0, temp: 25, current: 0 },
      motorBackLeft: { rpm: 0, temp: 25, current: 0 },
      motorBackRight: { rpm: 0, temp: 25, current: 0 },
    }))
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 to-slate-900">
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-black min-h-96 md:min-h-full"
        style={{ minHeight: "500px" }}
      />

      {/* Control Panel */}
      <div className="bg-slate-900 border-t border-slate-700 p-3 md:p-4 space-y-3">
        {/* Mission Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs md:text-sm font-mono text-cyan-400">{MISSION_PHASES[currentPhase].name}</span>
          </div>
          <div className="flex-1 md:flex-0 bg-slate-800 rounded h-1.5 w-full md:w-48">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded transition-all"
              style={{ width: `${missionProgress}%` }}
            />
          </div>
          <span className="text-xs md:text-sm font-mono text-slate-400">{missionProgress.toFixed(1)}%</span>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className="flex items-center gap-1 px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white rounded text-xs md:text-sm transition"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-3 md:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs md:text-sm transition"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs md:text-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Real-time Telemetry - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 text-xs md:text-sm">
          {/* Altitude */}
          <div className="bg-slate-800 p-2 md:p-3 rounded border border-slate-700 hover:border-cyan-500 transition">
            <div className="text-slate-400 text-xs mb-1">Altitude</div>
            <div className="text-cyan-400 font-mono font-bold text-sm md:text-base">
              {telemetry.altitude.toFixed(1)}m
            </div>
          </div>

          {/* Speed */}
          <div className="bg-slate-800 p-2 md:p-3 rounded border border-slate-700 hover:border-blue-500 transition">
            <div className="text-slate-400 text-xs mb-1">Speed</div>
            <div className="text-blue-400 font-mono font-bold text-sm md:text-base">
              {telemetry.speed.toFixed(1)}m/s
            </div>
          </div>

          {/* Battery */}
          <div className="bg-slate-800 p-2 md:p-3 rounded border border-slate-700 hover:border-green-500 transition">
            <div className="text-slate-400 text-xs mb-1">Battery</div>
            <div className="text-green-400 font-mono font-bold text-sm md:text-base">
              {telemetry.batteryPercent.toFixed(0)}%
            </div>
          </div>

          {/* Mars Distance */}
          <div className="bg-slate-800 p-2 md:p-3 rounded border border-slate-700 hover:border-orange-500 transition">
            <div className="text-slate-400 text-xs mb-1">Mars Dist</div>
            <div className="text-orange-400 font-mono font-bold text-sm md:text-base">
              {telemetry.marsSurfaceDistance.toFixed(1)}m
            </div>
          </div>

          {/* LiDAR Points */}
          <div className="bg-slate-800 p-2 md:p-3 rounded border border-slate-700 hover:border-purple-500 transition">
            <div className="text-slate-400 text-xs mb-1">LiDAR</div>
            <div className="text-purple-400 font-mono font-bold text-sm md:text-base">
              {(telemetry.lidar.points / 1000).toFixed(0)}K pts
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-800 p-2 md:p-3 rounded border border-slate-700 hover:border-yellow-500 transition">
            <div className="text-slate-400 text-xs mb-1">Status</div>
            <div className="text-yellow-400 font-mono font-bold text-sm md:text-base truncate">
              {telemetry.marsLanded ? "LANDED" : telemetry.landingLocked ? "LOCK" : "FLIGHT"}
            </div>
          </div>
        </div>

        {/* Component Telemetry - Collapsible on Mobile */}
        <div className="border-t border-slate-700 pt-3">
          <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Component Telemetry
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {/* Motors */}
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-slate-400 mb-1">FL Motor</div>
              <div className="text-orange-400 font-mono text-xs">{telemetry.motorFrontLeft.rpm.toFixed(0)} RPM</div>
              <div className="text-red-400 font-mono text-xs">{telemetry.motorFrontLeft.temp.toFixed(0)}°C</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-slate-400 mb-1">FR Motor</div>
              <div className="text-orange-400 font-mono text-xs">{telemetry.motorFrontRight.rpm.toFixed(0)} RPM</div>
              <div className="text-red-400 font-mono text-xs">{telemetry.motorFrontRight.temp.toFixed(0)}°C</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-slate-400 mb-1">BL Motor</div>
              <div className="text-orange-400 font-mono text-xs">{telemetry.motorBackLeft.rpm.toFixed(0)} RPM</div>
              <div className="text-red-400 font-mono text-xs">{telemetry.motorBackLeft.temp.toFixed(0)}°C</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-slate-400 mb-1">BR Motor</div>
              <div className="text-orange-400 font-mono text-xs">{telemetry.motorBackRight.rpm.toFixed(0)} RPM</div>
              <div className="text-red-400 font-mono text-xs">{telemetry.motorBackRight.temp.toFixed(0)}°C</div>
            </div>

            {/* System Components */}
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-slate-400 mb-1">Battery</div>
              <div className="text-green-400 font-mono text-xs">{telemetry.mainBattery.voltage.toFixed(2)}V</div>
              <div className="text-green-300 font-mono text-xs">{telemetry.mainBattery.health.toFixed(0)}%</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-slate-400 mb-1">Processor</div>
              <div className="text-blue-400 font-mono text-xs">CPU:{telemetry.processor.cpuUsage.toFixed(0)}%</div>
              <div className="text-blue-300 font-mono text-xs">Mem:{telemetry.processor.memoryUsage.toFixed(0)}%</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-slate-400 mb-1">Camera</div>
              <div className="text-magenta-400 font-mono text-xs">{telemetry.camera.fps} FPS</div>
              <div className="text-magenta-300 font-mono text-xs">{telemetry.camera.recording ? "REC" : "OFF"}</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <div className="text-slate-400 mb-1">LiDAR</div>
              <div className="text-cyan-400 font-mono text-xs">{telemetry.lidar.range.toFixed(0)}m range</div>
              <div className="text-cyan-300 font-mono text-xs">{telemetry.lidar.status}</div>
            </div>
          </div>
        </div>

        {/* Landing Status Alert */}
        {telemetry.marsLanded && (
          <div className="bg-green-900 border border-green-600 rounded p-2 flex items-center gap-2 text-green-300 text-xs md:text-sm">
            <AlertCircle className="w-4 h-4" />
            <span className="font-mono">MARS LANDING CONFIRMED - All systems nominal. Mission successful.</span>
          </div>
        )}
      </div>
    </div>
  )
}
