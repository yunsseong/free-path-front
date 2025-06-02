"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, MapPin, User, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import React from "react"

// 신고 샘플 데이터 - 실제 앱에서는 API에서 가져옴
const reportsData = {
  "report-1": {
    id: "report-1",
    map: "중앙 캠퍼스",
    location: "과학관",
    coordinates: { lat: 40.7128, lng: -74.006 },
    type: "고장난 엘리베이터",
    description:
      "건물 동쪽의 엘리베이터가 작동하지 않습니다. 3층 수업에 가기 위해 도움을 요청해야 했습니다. 이 문제는 일주일 넘게 지속되고 있습니다.",
    timestamp: "2023-06-15T10:30:00Z",
    status: "pending",
    reporter: {
      name: "알렉스 존슨",
      email: "alex.j@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    comments: [
      {
        id: "comment-1",
        author: "유지보수 담당자",
        avatar: "/placeholder.svg?height=32&width=32",
        content: "문제를 인지했으며 내일 수리팀이 예정되어 있습니다.",
        timestamp: "2023-06-15T14:20:00Z",
      },
      {
        id: "comment-2",
        author: "접근성 코디네이터",
        avatar: "/placeholder.svg?height=32&width=32",
        content: "그 동안 상층에 접근해야 하는 사람들을 위해 건물 입구에 직원 지원을 마련했습니다.",
        timestamp: "2023-06-15T15:45:00Z",
      },
    ],
    images: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
  },
  "report-2": {
    id: "report-2",
    map: "도심 지역",
    location: "공공 도서관",
    coordinates: { lat: 40.7135, lng: -74.009 },
    type: "접근 불가능한 입구",
    description:
      "주 입구의 경사로가 휠체어 사용자에게 너무 가파릅니다. 독립적으로 건물에 들어갈 수 없어 도움을 요청해야 했습니다.",
    timestamp: "2023-06-14T14:45:00Z",
    status: "pending",
    reporter: {
      name: "샘 리베라",
      email: "sam.r@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    comments: [
      {
        id: "comment-1",
        author: "도서관장",
        avatar: "/placeholder.svg?height=32&width=32",
        content: "알려주셔서 감사합니다. 시설팀이 경사로를 평가하고 필요한 조정을 할 예정입니다.",
        timestamp: "2023-06-14T16:30:00Z",
      },
    ],
    images: ["/placeholder.svg?height=300&width=400"],
  },
  "report-3": {
    id: "report-3",
    map: "의료 센터",
    location: "주 병원",
    coordinates: { lat: 40.714, lng: -74.002 },
    type: "표지판 부재",
    description:
      "2층 화장실에 점자 표지판이 없습니다. 이로 인해 시각 장애가 있는 방문자가 독립적으로 탐색하기 어렵습니다.",
    timestamp: "2023-06-13T09:15:00Z",
    status: "pending",
    reporter: {
      name: "조던 리",
      email: "jordan.l@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    comments: [],
    images: [],
  },
  "report-4": {
    id: "report-4",
    map: "중앙 캠퍼스",
    location: "학생 센터",
    coordinates: { lat: 40.7125, lng: -74.005 },
    type: "막힌 경로",
    description: "건설 자재가 구내식당으로 가는 접근 경로를 막고 있습니다. 대체 경로가 표시되어 있지 않습니다.",
    timestamp: "2023-06-12T16:20:00Z",
    status: "reviewed",
    reporter: {
      name: "테일러 스미스",
      email: "taylor.s@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    comments: [
      {
        id: "comment-1",
        author: "캠퍼스 운영팀",
        avatar: "/placeholder.svg?height=32&width=32",
        content: "경로를 정리하고 공사 기간 동안 대체 경로에 표지판을 추가했습니다. 문제를 신고해 주셔서 감사합니다.",
        timestamp: "2023-06-13T09:10:00Z",
      },
    ],
    images: ["/placeholder.svg?height=300&width=400"],
    resolution: {
      action: "경로 정리 및 대체 경로 표지판 추가",
      date: "2023-06-13T09:00:00Z",
      by: "캠퍼스 운영팀",
    },
  },
  "report-5": {
    id: "report-5",
    map: "주거 지역",
    location: "기숙사 B",
    coordinates: { lat: 40.712, lng: -74.001 },
    type: "문 문제",
    description: "주 입구의 자동문 개폐기가 작동하지 않습니다. 이로 인해 휠체어 사용자가 건물에 들어가기 어렵습니다.",
    timestamp: "2023-06-11T11:10:00Z",
    status: "reviewed",
    reporter: {
      name: "케이시 모건",
      email: "casey.m@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    comments: [
      {
        id: "comment-1",
        author: "기숙사 생활팀",
        avatar: "/placeholder.svg?height=32&width=32",
        content: "기술자가 문 개폐기를 수리했습니다. 추가 문제가 있으면 알려주세요.",
        timestamp: "2023-06-11T15:30:00Z",
      },
    ],
    images: [],
    resolution: {
      action: "문 개폐기 수리 완료",
      date: "2023-06-11T15:00:00Z",
      by: "유지보수팀",
    },
  },
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const typedId = id as keyof typeof reportsData
  const [newComment, setNewComment] = useState("")
  const [status, setStatus] = useState("")

  // 실제 앱에서는 ID를 기반으로 신고 데이터를 가져옴
  const report: any = reportsData[typedId]

  if (!report) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">신고를 찾을 수 없음</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p>찾으시는 신고가 존재하지 않거나 삭제되었습니다.</p>
            <Button asChild className="mt-4">
              <Link href="/reports">신고 목록으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleStatusChange = () => {
    const newStatus = report.status === "pending" ? "reviewed" : "pending"
    // 실제 앱에서는 API 호출을 통해 상태 업데이트
    setStatus(newStatus)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    // 실제 앱에서는 API 호출을 통해 댓글 추가
    console.log("댓글 추가:", newComment)
    setNewComment("")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">신고 상세</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{report.type}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {report.map} - {report.location}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={
                    report.status === "pending"
                      ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-500"
                      : "bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500"
                  }
                >
                  {report.status === "pending" ? "대기 중" : "검토됨"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">설명</h3>
                <p className="text-muted-foreground">{report.description}</p>
              </div>

              {report.images && report.images.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">이미지</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.images.map((image: any, index: any) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`신고 이미지 ${index + 1}`}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.resolution && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-medium text-green-800 mb-2">해결 내용</h3>
                  <p className="text-green-700">{report.resolution?.action}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/reports">신고 목록으로 돌아가기</Link>
              </Button>
              <Button onClick={handleStatusChange}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {report.status === "pending" ? "검토됨으로 표시" : "대기 중으로 표시"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>신고 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">신고 ID</p>
                <p className="text-sm text-muted-foreground">{report.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">신고자</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={report.reporter.avatar || "/placeholder.svg"} alt={report.reporter.name} />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm">{report.reporter.name}</p>
                </div>
                <p className="text-sm text-muted-foreground">{report.reporter.email}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm font-medium">신고 날짜</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatDate(report.timestamp)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">신고 시간</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatTime(report.timestamp)}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm font-medium">위치</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{report.location}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  위도: {report.coordinates.lat}, 경도: {report.coordinates.lng}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>지도 미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden h-[200px] bg-gray-100 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-red-500" />
                <p className="text-sm text-muted-foreground ml-2">지도 상 위치</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/maps/${report.map.toLowerCase().replace(/\s+/g, "-")}`}>지도에서 보기</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
