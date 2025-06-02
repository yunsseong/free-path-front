import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/toaster"
import { AuthProvider, User } from "../src/contexts/AuthContext"
import { useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FreePath",
  description: "FreePath는 베리어 프리 맵을 생성 및 유지보수를 위한 서비스 입니다.",
  generator: 'v0.dev'
}

export function SidebarSpacer() {
  return <div className="hidden md:block w-64" />
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
