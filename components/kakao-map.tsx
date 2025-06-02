"use client"

import { useState, useEffect, useCallback } from "react"
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk"

interface Coordinates {
  lat: number
  lng: number
}

interface KakaoMapProps {
  center?: Coordinates
  onCenterChange?: (coords: Coordinates) => void
  height?: string
}

export default function KakaoMap({
  center = { lat: 37.5665, lng: 126.978 },
  onCenterChange,
  height = "400px",
}: KakaoMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [marker, setMarker] = useState<Coordinates>(center)
  const [mapCenter, setMapCenter] = useState<Coordinates>(center)

  // 카카오맵 API 키를 환경변수에서 불러옴
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || ""

  const [loading, error] = useKakaoLoader({
    appkey: apiKey,
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 마커 드래그 시 위치 변경
  const handleMarkerDragEnd = useCallback(
    (markerObj: any) => {
      const pos = markerObj.getPosition()
      const coords = { lat: pos.getLat(), lng: pos.getLng() }
      setMarker(coords)
      setMapCenter(coords)
      onCenterChange?.(coords)
    },
    [onCenterChange]
  )

  // 지도 클릭 시 마커 이동
  const handleMapClick = useCallback(
    (_: any, mouseEvent: any) => {
      const latlng = mouseEvent.latLng
      const coords = { lat: latlng.getLat(), lng: latlng.getLng() }
      setMarker(coords)
      setMapCenter(coords)
      onCenterChange?.(coords)
    },
    [onCenterChange]
  )

  if (!isClient) {
    return <div style={{ height }} className="flex items-center justify-center">지도를 초기화하는 중...</div>
  }

  if (!apiKey) {
    return <div style={{ height }} className="flex items-center justify-center">카카오맵 API 키가 필요합니다.</div>
  }

  if (loading) {
    return <div style={{ height }} className="flex items-center justify-center">지도를 불러오는 중...</div>
  }

  if (error) {
    return <div style={{ height }} className="flex items-center justify-center">지도를 불러올 수 없습니다.</div>
  }

  return (
    <div className="border rounded-md bg-white overflow-hidden" style={{ width: "100%", height }}>
      <Map
        center={mapCenter}
        style={{ width: "100%", height: "100%" }}
        level={3}
        onClick={handleMapClick}
      >
        <MapMarker
          position={marker}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
        />
      </Map>
    </div>
  )
} 