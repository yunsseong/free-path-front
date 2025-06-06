/// <reference types="react" />

"use client"

import React, { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import KakaoMap from "@/components/kakao-map"
import { Upload, GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"

interface Floor {
  id: string
  name: string
  fileName?: string
  planeImageUrl?: string | null
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    e.preventDefault()
    const targetIndex = Number((e.target as HTMLDivElement).dataset.index)
    if (draggedIndex === null || draggedIndex === targetIndex) return
    
    const newFloors = [...building.floors]
    const draggedFloor = newFloors[draggedIndex]
    newFloors.splice(draggedIndex, 1)
    newFloors.splice(targetIndex, 0, draggedFloor)
    
    updateBuilding({ floors: newFloors })
    setDraggedIndex(targetIndex)
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBuilding({ name: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="building-number">건물 번호</Label>
        <Input
          id="building-number"
          placeholder="건물 번호를 입력하세요"
          value={building.number || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBuilding({ number: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>건물 위치</Label>
        <KakaoMap 
          center={building.location} 
          onCenterChange={(coordinates: { lat: number; lng: number }) => handleLocationChange(coordinates)} 
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, idx)}
                onDragOver={(e: React.DragEvent<HTMLDivElement>) => handleDragOver(e)}
                onDragEnd={handleDragEnd}
                data-index={idx}
              >
                <div className="relative mb-3 p-2 flex items-center gap-4">
                  <GripVertical className={`h-5 w-5 text-muted-foreground ${disabled ? 'cursor-not-allowed' : 'cursor-move'}`} />
                  <Input
                    placeholder="층 이름 (예: B1, 1층, 2층 등)"
                    value={floor.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFloorName(floor.id, e.target.value)}
                    className="w-20"
                    maxLength={5}
                    disabled={disabled}
                  />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => removeFloor(floor.id)}
                    disabled={disabled}
                    className="absolute right-2 top-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-3 mt-2 ml-8">
                    <div
                      className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg min-h-[90px] min-w-[110px] max-w-[140px] bg-muted/30 cursor-pointer hover:border-primary transition"
                      style={{ height: 90, width: 120 }}
                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={async e => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (disabled) return;
                        const file = e.dataTransfer.files?.[0];
                        if (!file) return;
                        const ext = file.name.split('.').pop();
                        const uuidFileName = `${uuidv4()}.${ext}`;
                        const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
                        try {
                          const presignedRes = await axios.post(`${API_BASE}/api/images/upload-url`, {
                            fileName: uuidFileName
                          }, {
                            withCredentials: true
                          });
                          const uploadUrl = presignedRes.data.data.uploadUrl;
                          await axios.put(uploadUrl, file, {
                            headers: { "Content-Type": file.type}
                          });
                          const r2Url = `https://pub-9bddcdc764d74fb0a6338b5aba7b97bf.r2.dev/plans/${uuidFileName}`;
                          const newFloors = building.floors.map((f, i) => i === idx ? { ...f, fileName: uuidFileName, planeImageUrl: r2Url } : f);
                          updateBuilding({ floors: newFloors });
                        } catch (err) {
                          alert("업로드 실패");
                        }
                      }}
                      onClick={() => {
                        if (disabled) return;
                        const input = document.getElementById(`file-upload-${floor.id}`) as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        id={`file-upload-${floor.id}`}
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const ext = file.name.split('.').pop();
                          const uuidFileName = `${uuidv4()}.${ext}`;
                          const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
                          try {
                            const presignedRes = await axios.post(`${API_BASE}/api/images/upload-url`, {
                              fileName: uuidFileName
                            }, {
                              withCredentials: true
                            });
                            const uploadUrl = presignedRes.data.data.uploadUrl;
                            await axios.put(uploadUrl, file, {
                              headers: { "Content-Type": file.type}
                            });
                            const r2Url = `https://pub-9bddcdc764d74fb0a6338b5aba7b97bf.r2.dev/plans/${uuidFileName}`;
                            const newFloors = building.floors.map((f, i) => i === idx ? { ...f, fileName: uuidFileName, planeImageUrl: r2Url } : f);
                            updateBuilding({ floors: newFloors });
                          } catch (err) {
                            alert("업로드 실패");
                          }
                        }}
                        disabled={disabled}
                      />
                      <div className="flex flex-col items-center justify-center w-full h-full select-none pointer-events-none">
                        <span className="text-xs text-muted-foreground mb-1">이미지 업로드</span>
                        <span className="text-xs text-muted-foreground">드래그 또는 클릭</span>
                      </div>
                    </div>
                    {floor.planeImageUrl && (
                      <div className="rounded-lg shadow border bg-white flex flex-col items-center p-2 ml-2" style={{ minWidth: 110, height: 90, justifyContent: 'center' }}>
                        <span className="text-xs text-center mb-1 text-muted-foreground">미리보기</span>
                        <img
                          src={floor.planeImageUrl}
                          alt="도면 미리보기"
                          style={{
                            maxWidth: '100px',
                            maxHeight: '60px',
                            height: 'auto',
                            width: 'auto',
                            borderRadius: '4px',
                            border: '1px solid #eee',
                            background: '#fafafa',
                            margin: 0
                          }}
                        />
                      </div>
                    )}
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
            onCheckedChange={(checked: boolean) => updateAccessibility('wheelchair', checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="elevator">엘리베이터</Label>
          <Switch 
            id="elevator" 
            checked={building.accessibility.elevator}
            onCheckedChange={(checked: boolean) => updateAccessibility('elevator', checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="restroom">접근 가능한 화장실</Label>
          <Switch 
            id="restroom" 
            checked={building.accessibility.restroom}
            onCheckedChange={(checked: boolean) => updateAccessibility('restroom', checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="braille">점자 안내</Label>
          <Switch 
            id="braille" 
            checked={building.accessibility.braille}
            onCheckedChange={(checked: boolean) => updateAccessibility('braille', checked)}
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
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBuilding({ caution: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

interface FloorPlanUploaderProps {
  planeImageUrl?: string | null;
  onUploaded: (fileName: string) => void;
  disabled?: boolean;
}

function FloorPlanUploader({ planeImageUrl, onUploaded, disabled }: FloorPlanUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  console.log('planeImageUrl', planeImageUrl);

  return (
    <div className="flex items-center gap-2 w-auto">
      {planeImageUrl ? (
        <img
          src={planeImageUrl}
          alt="도면 미리보기"
          style={{
            maxWidth: '100%',
            maxHeight: '200px',
            height: 'auto',
            width: 'auto',
            display: 'block',
            marginRight: '8px',
            borderRadius: '4px',
            border: '1px solid #eee',
            background: '#fafafa'
          }}
        />
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => !disabled && fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="flex-shrink-0"
      >
        <Upload className="h-4 w-4" />
      </Button>
      {planeImageUrl && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => onUploaded("")}
          disabled={disabled || uploading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            const ext = file.name.split('.').pop();
            const uuidFileName = `${uuidv4()}.${ext}`;
            const presignedRes = await axios.post(`${API_BASE}/api/images/upload-url`, {
              fileName: uuidFileName
            }, {
              withCredentials: true
            });
            const uploadUrl = presignedRes.data.data.uploadUrl;
            await axios.put(uploadUrl, file, {
              headers: { "Content-Type": file.type}
            });
            onUploaded(uuidFileName);
          } catch (err) {
            alert("업로드 실패");
          } finally {
            setUploading(false);
          }
        }}
        disabled={disabled || uploading}
      />
    </div>
  );
}
