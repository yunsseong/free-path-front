"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import KakaoMap from "@/components/kakao-map"

export interface PoiData {
  id: string
  name: string
  type: string
  location: { lat: number; lng: number }
  note: string
}

interface PoiFormProps {
  poi: PoiData
  onPoiChange: (poi: PoiData) => void
  disabled?: boolean
}

export function PoiForm({ poi, onPoiChange, disabled = false }: PoiFormProps) {
  const updatePoi = (updates: Partial<PoiData>) => {
    if (!disabled) {
      onPoiChange({ ...poi, ...updates })
    }
  }

  const handleLocationChange = (coordinates: { lat: number; lng: number }) => {
    if (!disabled) {
      updatePoi({ location: coordinates })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="poi-name">POI 이름</Label>
        <Input
          id="poi-name"
          placeholder="지점 이름을 입력하세요"
          value={poi.name}
          onChange={(e) => updatePoi({ name: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="poi-type">POI 유형</Label>
        <Select 
          value={poi.type} 
          onValueChange={(value) => updatePoi({ type: value })}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="POI 유형을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ramp">경사로</SelectItem>
            <SelectItem value="parking">접근 가능한 주차장</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>POI 위치</Label>
        <KakaoMap center={poi.location} onCenterChange={handleLocationChange} height="300px" />
        {disabled && (
          <p className="text-xs text-muted-foreground">생성 중에는 위치를 변경할 수 없습니다.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="poi-latitude">위도</Label>
          <Input
            id="poi-latitude"
            placeholder="위도"
            value={poi.location.lat.toFixed(6)}
            onChange={(e) => {
              const value = Number.parseFloat(e.target.value)
              if (!isNaN(value)) {
                updatePoi({ location: { ...poi.location, lat: value } })
              }
            }}
            disabled={disabled}
          />
        </div>
        <div>
          <Label htmlFor="poi-longitude">경도</Label>
          <Input
            id="poi-longitude"
            placeholder="경도"
            value={poi.location.lng.toFixed(6)}
            onChange={(e) => {
              const value = Number.parseFloat(e.target.value)
              if (!isNaN(value)) {
                updatePoi({ location: { ...poi.location, lng: value } })
              }
            }}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="poi-note">추가 메모 (선택사항)</Label>
        <Textarea 
          id="poi-note" 
          placeholder="이 지점에 대한 추가 정보를 입력하세요"
          value={poi.note}
          onChange={(e) => updatePoi({ note: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
