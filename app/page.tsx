"use client"

import { useState } from "react"
import TopNav from "@/components/top-nav"
import Sidebar from "@/components/sidebar"
import MainContent from "@/components/main-content"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("demo")

  return (
    <div className="flex h-screen flex-col md:flex-row bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        <MainContent activeSection={activeSection} />
      </div>
    </div>
  )
}
