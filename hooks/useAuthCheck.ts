import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

/**
 * 인증 체크 커스텀 훅
 * - 인증 실패 시 지정된 경로(기본 /login)로 이동
 * - isLoading, isAuthenticated 상태 반환
 */
export function useAuthCheck(redirectTo: string = "/login") {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    apiClient("/api/auth/me")
      .then(res => {
        if (!ignore) {
          if (res) {
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
            router.push(redirectTo)
          }
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsAuthenticated(false)
          router.push(redirectTo)
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })
    return () => { ignore = true }
  }, [router, redirectTo])

  return { isLoading, isAuthenticated }
} 