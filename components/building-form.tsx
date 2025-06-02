"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import KakaoMap from "@/components/kakao-map"
import { Upload, GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Floor {
  id: string
  name: string
}

interface BuildingData {
  id: string
  name: string
  number: string
  location: { lat: number; lng: number }
  floors: Floor[]
  accessibility: {
    wheelchair: boolean
    elevator: boolean
    restroom: boolean
    braille: boolean
  }
  caution: string
}

interface BuildingFormProps {
  building: BuildingData
  onBuildingChange: (building: BuildingData) => void
  disabled?: boolean
}

export function BuildingForm({ building, onBuildingChange, disabled = false }: BuildingFormProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const updateBuilding = (updates: Partial<BuildingData>) => {
    if (!disabled) {
      onBuildingChange({ ...building, ...updates })
    }
  }

  const handleLocationChange = (coordinates: { lat: number; lng: number }) => {
    if (!disabled) {
      updateBuilding({ location: coordinates })
    }
  }

  const addFloor = () => {
    if (disabled) return
    const newFloor = { id: `floor-${Date.now()}-${building.floors.length}`, name: "" }
    updateBuilding({ floors: [...building.floors, newFloor] })
  }

  const removeFloor = (id: string) => {
    if (disabled) return
    updateBuilding({ floors: building.floors.filter((f) => f.id !== id) })
  }

  const updateFloorName = (id: string, name: string) => {
    if (disabled) return
    updateBuilding({ 
      floors: building.floors.map((f) => (f.id === id ? { ...f, name } : f)) 
    })
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newFloors = [...building.floors]
    const draggedFloor = newFloors[draggedIndex]
    newFloors.splice(draggedIndex, 1)
    newFloors.splice(index, 0, draggedFloor)
    
    updateBuilding({ floors: newFloors })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const updateAccessibility = (key: keyof BuildingData['accessibility'], value: boolean) => {
    if (disabled) return
    updateBuilding({
      accessibility: { ...building.accessibility, [key]: value }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="building-name">건물 이름</Label>
        <Input 
          id="building-name" 
          placeholder="건물 이름을 입력하세요"
          value={building.name}
          onChange={(e) => updateBuilding({ name: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="building-number">건물 번호</Label>
        <Input
          id="building-number"
          placeholder="건물 번호를 입력하세요"
          value={building.number || ""}
          onChange={(e) => updateBuilding({ number: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>건물 위치</Label>
        <KakaoMap 
          center={building.location} 
          onCenterChange={handleLocationChange} 
          height="300px" 
        />
        {disabled && (
          <p className="text-xs text-muted-foreground">생성 중에는 위치를 변경할 수 없습니다.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">위도</Label>
          <Input
            id="latitude"
            placeholder="위도"
            value={building.location.lat.toFixed(6)}
            onChange={(e) => {
              const value = Number.parseFloat(e.target.value)
              if (!isNaN(value)) {
                updateBuilding({ location: { ...building.location, lat: value } })
              }
            }}
            disabled={disabled}
          />
        </div>
        <div>
          <Label htmlFor="longitude">경도</Label>
          <Input
            id="longitude"
            placeholder="경도"
            value={building.location.lng.toFixed(6)}
            onChange={(e) => {
              const value = Number.parseFloat(e.target.value)
              if (!isNaN(value)) {
                updateBuilding({ location: { ...building.location, lng: value } })
              }
            }}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>층 정보</Label>
          <Button type="button" onClick={addFloor} size="sm" disabled={disabled}>
            + 층 추가
          </Button>
        </div>
        
        {building.floors.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border rounded-md bg-muted/30">
            아직 추가된 층이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {building.floors.map((floor, idx) => (
              <div 
                key={floor.id} 
                className={`p-4 border rounded-md bg-card ${disabled ? 'opacity-60' : ''}`}
                draggable={!disabled}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center gap-3 mb-3">
                  <GripVertical className={`h-5 w-5 text-muted-foreground ${disabled ? 'cursor-not-allowed' : 'cursor-move'}`} />
                  <Input
                    placeholder="층 이름 (예: B1, 1층, 2층 등)"
                    value={floor.name}
                    onChange={(e) => updateFloorName(floor.id, e.target.value)}
                    className="flex-1"
                    disabled={disabled}
                  />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => removeFloor(floor.id)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className={`flex items-center justify-center h-32 border-2 border-dashed rounded-md bg-muted ${disabled ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col items-center text-center p-4">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">층별 도면 업로드</p>
                    <p className="text-xs text-muted-foreground">드래그 앤 드롭하거나 클릭하여 업로드</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">접근성 기능</h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="wheelchair">휠체어 접근 가능</Label>
          <Switch 
            id="wheelchair" 
            checked={building.accessibility.wheelchair}
            onCheckedChange={(checked) => updateAccessibility('wheelchair', checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="elevator">엘리베이터</Label>
          <Switch 
            id="elevator" 
            checked={building.accessibility.elevator}
            onCheckedChange={(checked) => updateAccessibility('elevator', checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="restroom">접근 가능한 화장실</Label>
          <Switch 
            id="restroom" 
            checked={building.accessibility.restroom}
            onCheckedChange={(checked) => updateAccessibility('restroom', checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="braille">점자 안내</Label>
          <Switch 
            id="braille" 
            checked={building.accessibility.braille}
            onCheckedChange={(checked) => updateAccessibility('braille', checked)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="caution">주의사항 (선택사항)</Label>
        <Textarea 
          id="caution" 
          placeholder="이 건물에 대한 주의사항이나 추가 정보를 입력하세요"
          value={building.caution}
          onChange={(e) => updateBuilding({ caution: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
