"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // 기본 유효성 검사
    if (!email || !password) {
      setError("모든 필드를 입력해주세요")
      setIsLoading(false)
      return
    }

    if (!email.includes("@")) {
      setError("유효한 이메일 주소를 입력해주세요")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })
      console.log("로그인 시도:", email, password)
      console.log("로그인 응답:", res)
      if (!res.ok) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.")
        setIsLoading(false)
        return
      }
      // 로그인 성공 시 대시보드로 이동
      window.location.href = "/"
    } catch (err) {
      setError("오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-[420px] space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-primary rounded-full p-3">
              <MapPin className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">FreePath</h2>
          <p className="mt-2 text-sm text-gray-600">관리자 계정으로 로그인하세요</p>
        </div>

        {/* 로그인 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>환영합니다</CardTitle>
            <CardDescription>관리자 대시보드에 접근하려면 자격 증명을 입력하세요</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    로그인 상태 유지
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  비밀번호 찾기
                </Link>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* 추가 링크 */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <Link href="/register" className="text-primary hover:underline">
              관리자에게 문의하세요
            </Link>
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:underline">
              개인정보 처리방침
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">
              서비스 이용약관
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:underline">
              도움말
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
