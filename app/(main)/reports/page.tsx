"use client"

import Link from "next/link"
import { CheckCircle2, Filter, MoreHorizontal, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { apiClient } from "@/lib/api-client"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

// 임시 fetchReports 함수 (실제 구현 필요)
async function fetchReports() {
  const res = await apiClient("/api/issues")
  return res
}

function parseDateString(dateString: string) {
  if (!dateString) return null;
  // 소수점 이하 3자리까지만 자르고, 타임존 없으면 Z 추가
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d{1,6})?$/)
  if (match) {
    let base = match[1]
    let ms = match[2] ? match[2].slice(0, 4) : '' // .123
    return new Date(base + (ms || '') + 'Z')
  }
  // 이미 타임존이 있으면 그대로
  return new Date(dateString)
}

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteDialogId, setDeleteDialogId] = useState<number | null>(null)
  const router = useRouter()

  // 이슈 삭제 함수
  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      const res = await fetch(`https://port-0-barrier-free-map-server-mbdezq0l7f20ef60.sel4.cloudtype.app/api/issues/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("삭제 실패")
      setReports(reports.filter((r) => r.id !== id))
    } catch (e: any) {
      alert(e.message || "삭제 중 오류 발생")
    } finally {
      setDeletingId(null)
      setDeleteDialogId(null)
    }
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch("https://port-0-barrier-free-map-server-mbdezq0l7f20ef60.sel4.cloudtype.app/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          router.push("/login")
          throw new Error("인증 필요")
        }
        return fetchReports()
      })
      .then((res) => {
        // res.data 배열에서 content, createdDate만 추출
        setReports(res.data.map((item: any) => ({
          id: item.id,
          content: item.content,
          createdDate: item.createdDate
        })) || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <LoadingSpinner text="불편 신고를 불러오는 중입니다..." />
  if (error) return <div>오류: {error}</div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">불편 신고</h1>
        <p className="text-muted-foreground">사용자가 제출한 접근성 문제 관리</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>모든 신고</CardTitle>
          <CardDescription>사용자가 제출한 불편 신고 검토 및 관리</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>불편 신고 내용이 없습니다.</CardTitle>
              </CardHeader>
              <CardContent>등록된 불편 신고가 없습니다.</CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>신고 내용</TableHead>
                  <TableHead>신고 일시</TableHead>
                  <TableHead className="text-right">삭제</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.content}</TableCell>
                    <TableCell>{
                      (() => {
                        const parsed = parseDateString(report.createdDate)
                        return report.createdDate && parsed && !isNaN(parsed.getTime())
                          ? format(parsed, "yyyy-MM-dd HH:mm:ss")
                          : "-"
                      })()
                    }</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="inline-flex items-center"
                        onClick={() => setDeleteDialogId(report.id)}
                        disabled={deletingId === report.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === report.id ? "삭제 중..." : "삭제"}
                      </Button>
                      <Dialog open={deleteDialogId === report.id} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogId(null)}>취소</Button>
                            <Button variant="destructive" onClick={() => handleDelete(report.id)} disabled={deletingId === report.id}>확인</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
