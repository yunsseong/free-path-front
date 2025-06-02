"use client"
import { useState, useEffect } from "react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
// import MapPreview from "@/components/MapPreview" // 실제 미리보기 컴포넌트가 있다면 주석 해제

export default function DashboardPage() {
  const [previewData, setPreviewData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 예시: 지도 미리보기 데이터 fetch
    fetch("/api/preview") // 실제 API 엔드포인트로 교체
      .then(res => res.json())
      .then(data => setPreviewData(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="지도 미리보기를 불러오는 중입니다..." />

  return (
    <div>
      {/* 지도 미리보기 */}
      {previewData ? (
        <div>여기에 지도 미리보기 컴포넌트 또는 내용 렌더링</div>
        // <MapPreview data={previewData} />
      ) : (
        <div>미리보기 데이터가 없습니다.</div>
      )}
    </div>
  )
} 