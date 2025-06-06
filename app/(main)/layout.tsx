import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FreePath",
  description: "FreePath는 베리어 프리 맵을 생성 및 유지보수를 위한 서비스 입니다.",
  generator: 'v0.dev'
}

export function SidebarSpacer() {
  return <div className="hidden md:block w-64" />
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className={inter.className + " flex min-h-screen"}>
        <Sidebar />
        <div className="flex-1 flex">
          <SidebarSpacer />
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  )
} 