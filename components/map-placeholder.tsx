"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Maximize2, Minimize2, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Coordinates {
  x: number
  y: number
}

interface Rectangle {
  start: Coordinates
  end: Coordinates
}

interface MapPlaceholderProps {
  initialRectangle?: {
    northeast: { lat: number | string; lng: number | string }
    southwest: { lat: number | string; lng: number | string }
  }
  onAreaSelect?: (area: {
    northeast: { lat: number; lng: number }
    southwest: { lat: number; lng: number }
  }) => void
}

// 실제 애플리케이션에서는 실제 지오코딩 API를 사용해야 합니다
// 이 예제에서는 몇 가지 주소에 대한 가상의 좌표를 반환합니다
const mockGeocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  // 검색 시뮬레이션을 위한 지연
  await new Promise((resolve) => setTimeout(resolve, 500))

  const addressMap: Record<string, { lat: number; lng: number }> = {
    "new york": { lat: 40.7128, lng: -74.006 },
    서울: { lat: 37.5665, lng: 126.978 },
    tokyo: { lat: 35.6762, lng: 139.6503 },
    london: { lat: 51.5074, lng: -0.1278 },
    paris: { lat: 48.8566, lng: 2.3522 },
    sydney: { lat: -33.8688, lng: 151.2093 },
    rome: { lat: 41.9028, lng: 12.4964 },
    cairo: { lat: 30.0444, lng: 31.2357 },
    rio: { lat: -22.9068, lng: -43.1729 },
    "cape town": { lat: -33.9249, lng: 18.4241 },
  }

  const normalizedAddress = address.toLowerCase().trim()

  // 부분 일치 검색
  for (const [key, coords] of Object.entries(addressMap)) {
    if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
      return coords
    }
  }

  return null
}

export function MapPlaceholder({ initialRectangle, onAreaSelect }: MapPlaceholderProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [rectangle, setRectangle] = useState<Rectangle | null>(null)
  const [startPoint, setStartPoint] = useState<Coordinates | null>(null)
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // Convert screen coordinates to lat/lng
  const coordsToLatLng = (x: number, y: number, mapWidth: number, mapHeight: number) => {
    // Simple linear mapping for demo purposes
    // In a real app, this would use proper geo projection
    const lng = (x / mapWidth) * 360 - 180
    const lat = 90 - (y / mapHeight) * 180
    return { lat, lng }
  }

  // Convert lat/lng to screen coordinates
  const latLngToCoords = (lat: number | string, lng: number | string, mapWidth: number, mapHeight: number) => {
    const latNum = typeof lat === "string" ? Number.parseFloat(lat) : lat
    const lngNum = typeof lng === "string" ? Number.parseFloat(lng) : lng

    const x = ((lngNum + 180) / 360) * mapWidth
    const y = ((90 - latNum) / 180) * mapHeight
    return { x, y }
  }

  // Initialize rectangle from props if provided
  useEffect(() => {
    if (initialRectangle && mapRef.current) {
      const mapWidth = mapRef.current.clientWidth
      const mapHeight = mapRef.current.clientHeight

      const start = latLngToCoords(initialRectangle.southwest.lat, initialRectangle.southwest.lng, mapWidth, mapHeight)

      const end = latLngToCoords(initialRectangle.northeast.lat, initialRectangle.northeast.lng, mapWidth, mapHeight)

      setRectangle({ start, end })
    }
  }, [initialRectangle])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDrawing) return

    const mapRect = mapRef.current?.getBoundingClientRect()
    if (!mapRect) return

    const x = e.clientX - mapRect.left
    const y = e.clientY - mapRect.top

    setStartPoint({ x, y })
    setRectangle({ start: { x, y }, end: { x, y } })
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !startPoint || !mapRef.current) return

    const mapRect = mapRef.current.getBoundingClientRect()

    // Constrain to map boundaries
    const x = Math.max(0, Math.min(e.clientX - mapRect.left, mapRect.width))
    const y = Math.max(0, Math.min(e.clientY - mapRect.top, mapRect.height))

    setRectangle({
      start: startPoint,
      end: { x, y },
    })
  }

  const handleMouseUp = () => {
    if (isDragging && rectangle && mapRef.current) {
      setIsDragging(false)

      const mapWidth = mapRef.current.clientWidth
      const mapHeight = mapRef.current.clientHeight

      // Calculate the actual rectangle corners (in case user dragged from bottom-right to top-left)
      const minX = Math.min(rectangle.start.x, rectangle.end.x)
      const maxX = Math.max(rectangle.start.x, rectangle.end.x)
      const minY = Math.min(rectangle.start.y, rectangle.end.y)
      const maxY = Math.max(rectangle.start.y, rectangle.end.y)

      // Convert to geo coordinates
      const southwest = coordsToLatLng(minX, maxY, mapWidth, mapHeight)
      const northeast = coordsToLatLng(maxX, minY, mapWidth, mapHeight)

      // Notify parent component
      if (onAreaSelect) {
        onAreaSelect({
          northeast: {
            lat: Number.parseFloat(northeast.lat.toFixed(6)),
            lng: Number.parseFloat(northeast.lng.toFixed(6)),
          },
          southwest: {
            lat: Number.parseFloat(southwest.lat.toFixed(6)),
            lng: Number.parseFloat(southwest.lng.toFixed(6)),
          },
        })
      }
    }
  }

  const toggleDrawingMode = () => {
    setIsDrawing(!isDrawing)
    if (isDrawing) {
      setIsDragging(false)
    }
  }

  const getRectangleStyle = () => {
    if (!rectangle) return {}

    const minX = Math.min(rectangle.start.x, rectangle.end.x)
    const maxX = Math.max(rectangle.start.x, rectangle.end.x)
    const minY = Math.min(rectangle.start.y, rectangle.end.y)
    const maxY = Math.max(rectangle.start.y, rectangle.end.y)

    return {
      left: `${minX}px`,
      top: `${minY}px`,
      width: `${maxX - minX}px`,
      height: `${maxY - minY}px`,
    }
  }

  // 주소 검색 처리
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchAddress.trim()) return

    setIsSearching(true)

    try {
      const coordinates = await mockGeocodeAddress(searchAddress)

      if (coordinates && mapRef.current) {
        const mapWidth = mapRef.current.clientWidth
        const mapHeight = mapRef.current.clientHeight

        // 주소의 좌표를 중심으로 지도 영역 설정
        // 적절한 크기의 사각형 생성 (지도 크기의 20%)
        const rectWidth = mapWidth * 0.2
        const rectHeight = mapHeight * 0.2

        const center = latLngToCoords(coordinates.lat, coordinates.lng, mapWidth, mapHeight)

        const start = {
          x: center.x - rectWidth / 2,
          y: center.y - rectHeight / 2,
        }

        const end = {
          x: center.x + rectWidth / 2,
          y: center.y + rectHeight / 2,
        }

        setRectangle({ start, end })

        // 부모 컴포넌트에 새 영역 알림
        if (onAreaSelect) {
          const southwest = coordsToLatLng(start.x, end.y, mapWidth, mapHeight)
          const northeast = coordsToLatLng(end.x, start.y, mapWidth, mapHeight)

          onAreaSelect({
            northeast: {
              lat: Number.parseFloat(northeast.lat.toFixed(6)),
              lng: Number.parseFloat(northeast.lng.toFixed(6)),
            },
            southwest: {
              lat: Number.parseFloat(southwest.lat.toFixed(6)),
              lng: Number.parseFloat(southwest.lng.toFixed(6)),
            },
          })
        }

        toast({
          title: "위치 찾음",
          description: `${searchAddress}의 위치를 지도에 표시했습니다.`,
        })
      } else {
        toast({
          title: "위치를 찾을 수 없음",
          description: "입력한 주소를 찾을 수 없습니다. 다른 주소를 시도해보세요.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "주소 검색 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 주소 검색 폼 */}
      <form onSubmit={handleAddressSearch} className="p-2 bg-white border-b flex gap-2">
        <Input
          placeholder="주소 입력 (예: New York, 서울, Tokyo)"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isSearching}>
          {isSearching ? "검색 중..." : <Search className="h-4 w-4" />}
        </Button>
      </form>

      <div
        ref={mapRef}
        className="relative w-full flex-1 bg-gray-100 flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Interactive Map Component</p>
          <div className="flex justify-center gap-2">
            <Button variant={isDrawing ? "default" : "outline"} size="sm" onClick={toggleDrawingMode}>
              {isDrawing ? (
                <>
                  <Minimize2 className="mr-2 h-4 w-4" /> Cancel Drawing
                </>
              ) : (
                <>
                  <Maximize2 className="mr-2 h-4 w-4" /> Draw Rectangle
                </>
              )}
            </Button>
          </div>
          {isDrawing && <p className="text-xs text-muted-foreground">Click and drag to draw a rectangle</p>}
        </div>

        {/* Map grid background */}
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Rectangle overlay */}
        {rectangle && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
            style={getRectangleStyle()}
          />
        )}

        {/* Coordinates display */}
        {rectangle && mapRef.current && (
          <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 p-2 rounded text-xs">
            {(() => {
              const mapWidth = mapRef.current.clientWidth
              const mapHeight = mapRef.current.clientHeight

              const minX = Math.min(rectangle.start.x, rectangle.end.x)
              const maxX = Math.max(rectangle.start.x, rectangle.end.x)
              const minY = Math.min(rectangle.start.y, rectangle.end.y)
              const maxY = Math.max(rectangle.start.y, rectangle.end.y)

              const sw = coordsToLatLng(minX, maxY, mapWidth, mapHeight)
              const ne = coordsToLatLng(maxX, minY, mapWidth, mapHeight)

              return (
                <>
                  NE: {ne.lat.toFixed(6)}, {ne.lng.toFixed(6)}
                  <br />
                  SW: {sw.lat.toFixed(6)}, {sw.lng.toFixed(6)}
                </>
              )
            })()}
          </div>
        )}

        {/* Drawing instructions */}
        {isDrawing && isDragging && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded text-xs">Release to set area</div>
        )}
      </div>
    </div>
  )
}
