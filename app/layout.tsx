import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    absolute: "ASCEND - Autonomous Surveyor Mission Interface"
  },
  description: "GNSS-denied autonomous UAV mission control dashboard for planetary exploration",
  generator: "sree.app",
  openGraph: {
    title: "ASCEND - Autonomous Surveyor Mission Interface",
    description: "GNSS-denied autonomous UAV mission control dashboard for planetary exploration",
    url: "https://sree.app",
    siteName: "ASCEND Dashboard",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASCEND - Autonomous Surveyor Mission Interface",
    description: "GNSS-denied autonomous UAV mission control dashboard for planetary exploration",
  },
  icons: {
    icon: "/icon-new.svg",
    shortcut: "/icon-new.svg",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
