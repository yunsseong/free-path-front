"use client"

import Link from "next/link"
import { Copy, Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { getMaps } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function MapsPage() {
  const [maps, setMaps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setLoading(true)
    setError(null)
    apiClient("/api/auth/me")
      .then((res) => {
        if (!res) {
          router.push("/login")
          throw new Error("인증 필요")
        }
        return getMaps()
      })
      .then((res) => {
        console.log('지도 목록 API 응답:', res)
        const mapData = res.data || []
        console.log('지도 상태 정보:', mapData.map((map: any) => ({ id: map.mapId, name: map.name, status: map.status })))
        setMaps(mapData)
      })
      .catch((e) => {
        if (e.message !== "인증 필요") setError(e.message)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="지도를 불러오는 중입니다..." />
  if (error) return <div>오류: {error}</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">지도</h1>
          <p className="text-muted-foreground">베리어 프리 지도 관리</p>
        </div>
        <Button asChild>
          <Link href="/maps/create">
            <Plus className="mr-2 h-4 w-4" /> 지도 생성
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>모든 지도</CardTitle>
          <CardDescription>모든 지도 보기 및 관리</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input placeholder="지도 검색..." className="max-w-sm" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead className="hidden md:table-cell">설명</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="hidden md:table-cell">최종 업데이트</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    등록된 지도가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                maps.map((map) => (
                  <TableRow key={map.mapId}>
                    <TableCell className="font-medium">{map.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{map.description}</TableCell>
                    <TableCell>
                      {map.status === "DEPLOYING" ? (
                        <Badge className="bg-green-500 hover:bg-green-600">배포됨</Badge>
                      ) : (
                        <Badge variant="outline">중단됨</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{map.updatedDate ? new Date(map.updatedDate).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {map.mapId ? (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/maps/${map.mapId}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">편집</span>
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">편집</span>
                          </Button>
                        )}
                        {map.status === "DEPLOYING" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (map.url) {
                                navigator.clipboard.writeText(map.url)
                                toast({
                                  title: "URL 복사 완료",
                                  description: "지도 URL이 클립보드에 복사되었습니다.",
                                })
                              }
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">URL 복사</span>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">삭제</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
