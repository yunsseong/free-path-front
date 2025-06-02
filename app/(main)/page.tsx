"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMaps } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const [maps, setMaps] = useState<any[]>([])
  const [selectedMap, setSelectedMap] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dash, setDash] = useState({ mapCount: 0, buildingCount: 0, pointCount: 0, issueCount: 0 })

  useEffect(() => {
    fetch("https://port-0-barrier-free-map-server-mbdezq0l7f20ef60.sel4.cloudtype.app/api/auth/me", { credentials: "include" })
      .then(res => {
        if (!res.ok) {
          router.push("/login")
          throw new Error("인증 필요")
        }
        return fetch("https://port-0-barrier-free-map-server-mbdezq0l7f20ef60.sel4.cloudtype.app/api/dash", { credentials: "include" })
      })
      .then(res => res.json())
      .then(res => {
        setDash(res.data || { mapCount: 0, buildingCount: 0, pointCount: 0, issueCount: 0 })
        return getMaps()
      })
      .then((res) => {
        const mapData = res.data || []
        setMaps(mapData)
        if (mapData.length > 0) setSelectedMap(mapData[0])
      })
      .catch((e) => {
        if (e.message !== "인증 필요") setError(e.message)
      })
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">베리어 프리 지도 서비스</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 지도</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A2 2 0 0 1 2 15.382V6.618a2 2 0 0 1 1.105-1.794l5-2.5a2 2 0 0 1 1.79 0l5 2.5A2 2 0 0 1 16 6.618v8.764a2 2 0 0 1-1.105 1.794l-5 2.5A2 2 0 0 1 9 20z" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dash.mapCount}</div>
            <p className="text-xs text-muted-foreground">등록된 지도 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">건물</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14M13 21V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v18" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dash.buildingCount}</div>
            <p className="text-xs text-muted-foreground">등록된 건물 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">지점</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dash.pointCount}</div>
            <p className="text-xs text-muted-foreground">등록된 지점 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">신고</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dash.issueCount}</div>
            <p className="text-xs text-muted-foreground">신고 건수</p>
          </CardContent>
        </Card>
      </div>
      {loading ? (
        <div>지도를 불러오는 중...</div>
      ) : error ? (
        <div>오류: {error}</div>
      ) : (
        <div className="flex flex-col gap-6">
          {maps.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>지도가 없습니다</CardTitle>
              </CardHeader>
              <CardContent>등록된 지도가 없습니다.</CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0" style={{ height: "calc(100vh - 300px)" }}>
                <iframe
                  src={maps[0].frontUrl}
                  title={maps[0].name}
                  width="100%"
                  height="100%"
                  style={{ border: "none", borderRadius: 0, display: "block" }}
                  allowFullScreen
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
