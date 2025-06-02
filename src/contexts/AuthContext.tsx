"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export interface User {
  email: string
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 컴포넌트 마운트 시 사용자 정보 가져오기
    const fetchUser = async () => {
      try {
        const response = await fetch("https://port-0-barrier-free-map-server-mbdezq0l7f20ef60.sel4.cloudtype.app/api/auth/me", {
          credentials: "include"
        })
        const data = await response.json()
        if (data.data?.email) {
          setUser({ email: data.data.email })
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth-token")
    sessionStorage.clear()
    window.location.href = "/login"
  }

  if (loading) {
    return <LoadingSpinner text="로그인 상태를 확인 중입니다..." />
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 