"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, Plus, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { getMaps } from "@/lib/api"
import { apiClient } from "@/lib/api-client"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import axios from "axios"

interface MapData {
  mapId: string | number
  id?: string | number
  name: string
  description?: string
  status: string
  updatedDate?: string
  frontUrl?: string
}

export default function MapsPage() {
  const [maps, setMaps] = useState<MapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMapId, setSelectedMapId] = useState<string | number | null>(null)
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
        const mapData = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
        console.log('지도 상태 정보:', mapData.map((map: any) => ({ 
          id: map.mapId || map.id, 
          name: map.name, 
          status: map.status 
        })))
        const processedData = mapData.map((map: any) => ({
          ...map,
          mapId: map.mapId || map.id
        }))
        setMaps(processedData)
      })
      .catch((e) => {
        if (e.message !== "인증 필요") setError(e.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDeleteMap = async () => {
    if (!selectedMapId) return;
    try {
      await axios.delete(`/api/maps/${selectedMapId}`, { withCredentials: true });
      setMaps((prev: MapData[]) => prev.filter((m: MapData) => m.mapId !== selectedMapId));
      toast({ title: "삭제 완료", description: "지도가 삭제되었습니다." });
    } catch (e: any) {
      toast({ title: "삭제 실패", description: e.message || "삭제 중 오류가 발생했습니다." });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedMapId(null);
    }
  }

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
                maps.map((map: MapData) => (
                  <TableRow key={map.mapId}>
                    <TableCell className="font-medium">{map.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{map.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={map.status === "DEPLOYING" ? "bg-green-500" : "bg-gray-500"}>
                          {map.status === "DEPLOYING" ? "배포 중" : "중지됨"}
                        </Badge>
                        {map.frontUrl && (
                          <Badge variant="outline">
                            <a href={map.frontUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              프론트 URL
                            </a>
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{map.updatedDate ? new Date(map.updatedDate).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {map.mapId ? (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/maps/${map.mapId}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">편집</span>
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" disabled title="편집할 수 없음">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">편집 불가</span>
                          </Button>
                        )}
                        {map.status === "DEPLOYING" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (map.frontUrl) {
                                navigator.clipboard.writeText(map.frontUrl)
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedMapId(map.mapId)
                            setDeleteDialogOpen(true)
                          }}
                        >
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

      {/* 지도 삭제 확인 모달 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말로 이 지도를 삭제하시겠습니까?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={handleDeleteMap}>삭제</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
