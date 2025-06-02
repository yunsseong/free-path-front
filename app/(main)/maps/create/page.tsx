"use client"

import type React from "react"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Copy, MapPin, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import KakaoMap from "@/components/kakao-map"
import { BuildingForm } from "@/components/building-form"
import { PoiForm, PoiData } from "@/components/poi-form"
import { 
  createMap, 
  createBuilding, 
  updateBuilding as updateBuildingAPI, 
  deleteBuilding, 
  createFloors, 
  updateFloors,
  createPoint, 
  updatePoint, 
  deletePoint 
} from "@/lib/api"

// BuildingData 타입 정의 추가
interface Floor {
  id: string
  name: string
}

interface BuildingData {
  id: string
  name: string
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

export default function CreateMapPage() {
  const [step, setStep] = useState(1)
  const [mapId, setMapId] = useState<number | null>(null)
  
  // 1단계 입력값 상태 관리
  const [mapName, setMapName] = useState("")
  const [mapDescription, setMapDescription] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [coordinate, setCoordinate] = useState({ lat: 37.5665, lng: 126.9780 })
  
  // 2단계, 3단계 상태 관리
  const [buildings, setBuildings] = useState<BuildingData[]>([])
  const [pois, setPois] = useState<PoiData[]>([])
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  
  // 새로 생성중인 아이템들을 추적
  const [creatingItems, setCreatingItems] = useState<Set<string>>(new Set())

  // 디바운스된 업데이트 함수들 (mapId가 있을 때만 실행)
  const debouncedUpdateBuilding = useCallback(
    debounce(async (buildingId: string, updatedBuilding: BuildingData) => {
      if (!mapId) return
      
      // 새로 생성중인 건물이거나 임시 ID인 경우 업데이트 스킵
      if (creatingItems.has(buildingId) || buildingId.startsWith('building-')) {
        return
      }
      
      try {
        setSaving(true)
        setSaveStatus("건물 정보를 저장하는 중...")
        
        const buildingData = {
          name: updatedBuilding.name,
          coordinate: {
            lat: Math.round(updatedBuilding.location.lat),
            lng: Math.round(updatedBuilding.location.lng)
          },
          wheel: updatedBuilding.accessibility.wheelchair,
          elevator: updatedBuilding.accessibility.elevator,
          toilet: updatedBuilding.accessibility.restroom,
          dots: updatedBuilding.accessibility.braille,
          caution: updatedBuilding.caution
        }
        
        await updateBuildingAPI(mapId.toString(), buildingId, buildingData)
        
        if (updatedBuilding.floors.length > 0) {
          const floorData = updatedBuilding.floors.map((floor, index) => ({
            floorLabel: floor.name,
            idx: index + 1
          }))
          await updateFloors(buildingId, floorData)
        }
        
        setSaveStatus("저장 완료")
        setTimeout(() => setSaveStatus(null), 2000)
      } catch (error) {
        console.error('건물 수정 실패:', error)
        setError('건물 수정에 실패했습니다.')
        setSaveStatus(null)
      } finally {
        setSaving(false)
      }
    }, 1000),
    [mapId, creatingItems]
  )

  const debouncedUpdatePoi = useCallback(
    debounce(async (poiId: string, updatedPoi: PoiData) => {
      if (!mapId) return
      
      // 새로 생성중인 POI이거나 임시 ID인 경우 업데이트 스킵
      if (creatingItems.has(poiId) || poiId.startsWith('poi-')) {
        return
      }
      
      try {
        setSaving(true)
        setSaveStatus("지점 정보를 저장하는 중...")
        
        const poiData = {
          coordinate: {
            lat: Math.round(updatedPoi.location.lat),
            lng: Math.round(updatedPoi.location.lng)
          },
          memo: updatedPoi.note,
          type: updatedPoi.type === "ramp" ? "ramp" : "parking" // API 스펙에 맞게 제한
        }
        
        await updatePoint(mapId.toString(), poiId, poiData)
        
        setSaveStatus("저장 완료")
        setTimeout(() => setSaveStatus(null), 2000)
      } catch (error) {
        console.error('지점 수정 실패:', error)
        setError('지점 수정에 실패했습니다.')
        setSaveStatus(null)
      } finally {
        setSaving(false)
      }
    }, 1000),
    [mapId, creatingItems]
  )

  const addBuilding = async () => {
    if (!mapId) return
    
    const tempId = `building-${Date.now()}`
    const newBuilding: BuildingData = {
      id: tempId,
      name: `새 건물 ${buildings.length + 1}`,
      location: { lat: 37.5665, lng: 126.978 },
      floors: [],
      accessibility: {
        wheelchair: false,
        elevator: false,
        restroom: false,
        braille: false
      },
      caution: ""
    }

    // 타임아웃 안전장치 (10초 후 자동 해제)
    const timeoutId = setTimeout(() => {
      console.warn('건물 생성 타임아웃, 생성중 상태를 강제 해제합니다.')
      setCreatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
    }, 10000)

    try {
      // 생성중 상태로 표시
      setCreatingItems(prev => new Set(prev).add(tempId))
      
      // 클라이언트 상태에 먼저 추가 (로딩 상태)
      setBuildings([...buildings, newBuilding])
      
      // 서버에 건물 생성
      const buildingData = {
        name: newBuilding.name,
        coordinate: {
          lat: Math.round(newBuilding.location.lat),
          lng: Math.round(newBuilding.location.lng)
        },
        wheel: newBuilding.accessibility.wheelchair,
        elevator: newBuilding.accessibility.elevator,
        toilet: newBuilding.accessibility.restroom,
        dots: newBuilding.accessibility.braille,
        caution: newBuilding.caution
      }
      
      const response = await createBuilding(mapId.toString(), buildingData)
      const serverBuildingId = response?.data?.buildingId || response?.buildingId
      
      console.log('건물 생성 서버 응답:', response)
      console.log('추출된 buildingId:', serverBuildingId)
      
      if (serverBuildingId) {
        // 서버 ID로 업데이트
        const buildingWithServerId = { ...newBuilding, id: serverBuildingId.toString() }
        setBuildings(prev => prev.map(b => b.id === tempId ? buildingWithServerId : b))
        
        // 생성중 상태 해제
        setCreatingItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
      } else {
        console.warn('서버에서 유효한 buildingId를 받지 못했습니다.')
        // 서버 ID를 받지 못했어도 생성중 상태 해제
        setCreatingItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
      }
    } catch (error) {
      console.error('건물 생성 실패:', error)
      setError('건물 생성에 실패했습니다.')
      // 실패한 건물 제거
      setBuildings(prev => prev.filter(b => b.id !== tempId))
      setCreatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
    } finally {
      // 타임아웃 클리어
      clearTimeout(timeoutId)
    }
  }

  const updateBuilding = async (buildingId: string, updatedBuilding: BuildingData) => {
    // 클라이언트 상태 즉시 업데이트
    setBuildings(buildings.map(building => 
      building.id === buildingId ? updatedBuilding : building
    ))
    
    // 서버에 디바운스된 업데이트
    debouncedUpdateBuilding(buildingId, updatedBuilding)
  }

  const removeBuilding = async (buildingId: string) => {
    if (!mapId) return
    
    try {
      await deleteBuilding(mapId.toString(), buildingId)
      setBuildings(buildings.filter((building) => building.id !== buildingId))
    } catch (error) {
      console.error('건물 삭제 실패:', error)
      setError('건물 삭제에 실패했습니다.')
    }
  }

  const addPoi = async () => {
    if (!mapId) return
    
    const tempId = `poi-${Date.now()}`
    const newPoi: PoiData = {
      id: tempId,
      name: `새 지점 ${pois.length + 1}`,
      type: "ramp",
      location: { lat: 37.5665, lng: 126.978 },
      note: ""
    }

    // 타임아웃 안전장치 (10초 후 자동 해제)
    const timeoutId = setTimeout(() => {
      console.warn('지점 생성 타임아웃, 생성중 상태를 강제 해제합니다.')
      setCreatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
    }, 10000)

    try {
      // 생성중 상태로 표시
      setCreatingItems(prev => new Set(prev).add(tempId))
      
      // 클라이언트 상태에 먼저 추가 (로딩 상태)
      setPois([...pois, newPoi])
      
      // 서버에 POI 생성
      const poiData = {
        coordinate: {
          lat: Math.round(newPoi.location.lat),
          lng: Math.round(newPoi.location.lng)
        },
        memo: newPoi.note,
        type: newPoi.type === "ramp" ? "ramp" : "parking" // API 스펙에 맞게 제한
      }
      
      const response = await createPoint(mapId.toString(), poiData)
      const serverPoiId = response?.data?.poiId || response?.poiId
      
      console.log('POI 생성 서버 응답:', response)
      console.log('추출된 poiId:', serverPoiId)
      
      if (serverPoiId) {
        // 서버 ID로 업데이트
        const poiWithServerId = { ...newPoi, id: serverPoiId.toString() }
        setPois(prev => prev.map(p => p.id === tempId ? poiWithServerId : p))
        
        // 생성중 상태 해제
        setCreatingItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
      } else {
        console.warn('서버에서 유효한 poiId를 받지 못했습니다.')
        // 서버 ID를 받지 못했어도 생성중 상태 해제
        setCreatingItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
      }
    } catch (error) {
      console.error('지점 생성 실패:', error)
      setError('지점 생성에 실패했습니다.')
      // 실패한 POI 제거
      setPois(prev => prev.filter(p => p.id !== tempId))
      setCreatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(tempId)
        return newSet
      })
    } finally {
      // 타임아웃 클리어
      clearTimeout(timeoutId)
    }
  }

  const updatePoi = async (poiId: string, updatedPoi: PoiData) => {
    // 클라이언트 상태 즉시 업데이트
    setPois(pois.map(poi => 
      poi.id === poiId ? updatedPoi : poi
    ))
    
    // 서버에 디바운스된 업데이트
    debouncedUpdatePoi(poiId, updatedPoi)
  }

  const removePoi = async (poiId: string) => {
    if (!mapId) return
    
    try {
      await deletePoint(mapId.toString(), poiId)
      setPois(pois.filter((poi) => poi.id !== poiId))
    } catch (error) {
      console.error('POI 삭제 실패:', error)
      setError('관심 지점 삭제에 실패했습니다.')
    }
  }

  const handleCoordinateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "lat" | "lng",
  ) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value)) {
      setCoordinate({
        ...coordinate,
        [field]: value,
      })
    }
  }

  // 1단계: 지도 정보 입력 및 생성
  const handleCreateMap = async () => {
    setSaving(true)
    setError(null)
    try {
      const status = isPublished ? "DEPLOYING" : "STOPPED"
      const centralCoordinate = {
        lat: coordinate.lat,
        lng: coordinate.lng,
      }
      const data = { name: mapName, description: mapDescription, status, centralCoordinate }
      const res = await createMap(data)
      // mapId 추출 (API 응답 구조에 따라 조정)
      const newMapId = res?.data?.mapId || res?.mapId
      setMapId(newMapId)
      setStep(2)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // 2단계: 건물 추가 (mapId 필요)
  const handleNextToPOI = () => {
    setStep(3)
  }
  const handlePrevToMap = () => {
    setStep(1)
  }

  // 3단계: POI 추가 (mapId 필요)
  const handlePrevToBuilding = () => {
    setStep(2)
  }
  const handleFinish = () => {
    window.location.href = "/maps"
  }

  // 스텝 표시 UI
  const Stepper = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className={`font-bold ${step === 1 ? "text-primary" : "text-muted-foreground"}`}>1. 지도 정보</div>
      <div className="h-0.5 w-6 bg-muted-foreground/30" />
      <div className={`font-bold ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>2. 건물</div>
      <div className="h-0.5 w-6 bg-muted-foreground/30" />
      <div className={`font-bold ${step === 3 ? "text-primary" : "text-muted-foreground"}`}>3. 관심 지점</div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/maps">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">새 지도 생성</h1>
        {saveStatus && (
          <div className="ml-auto text-sm text-muted-foreground">
            {saveStatus}
          </div>
        )}
      </div>
      <Stepper />
      {error && (
        <div className="text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="ml-2 h-auto p-1 text-destructive"
          >
            ✕
          </Button>
        </div>
      )}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>지도 정보</CardTitle>
            <CardDescription>지도의 기본 정보와 위치를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">지도 이름</Label>
              <Input 
                id="name" 
                placeholder="지도 이름을 입력하세요" 
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">지도 설명 (선택사항)</Label>
              <Textarea 
                id="description" 
                placeholder="이 지도에 대한 설명을 입력하세요" 
                value={mapDescription}
                onChange={(e) => setMapDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>지도 위치</Label>
              <p className="text-sm text-muted-foreground mb-2">지도 마커를 드래그하거나 아래 위도/경도를 직접 입력하세요.</p>
              <KakaoMap center={coordinate} onCenterChange={setCoordinate} height="400px" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coordinates">좌표</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">위도</Label>
                  <Input
                    id="lat"
                    placeholder="위도"
                    value={coordinate.lat}
                    onChange={(e) => handleCoordinateChange(e, "lat")}
                  />
                </div>
                <div>
                  <Label htmlFor="lng">경도</Label>
                  <Input
                    id="lng"
                    placeholder="경도"
                    value={coordinate.lng}
                    onChange={(e) => handleCoordinateChange(e, "lng")}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="published">이 지도 게시하기</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleCreateMap} disabled={saving}>
              다음
            </Button>
          </CardFooter>
        </Card>
      )}
      {step === 2 && mapId && (
        <Card>
          <CardHeader>
            <CardTitle>건물 추가</CardTitle>
            <CardDescription>생성된 지도에 건물을 추가하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button onClick={addBuilding}>
              <Plus className="mr-2 h-4 w-4" /> 건물 추가
            </Button>
            {buildings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
                <Building2 className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">아직 추가된 건물이 없습니다</h3>
                <p className="text-sm text-muted-foreground">"건물 추가" 버튼을 클릭하여 지도에 건물을 추가하세요</p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {buildings.map((building, index) => (
                  <AccordionItem key={building.id} value={building.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <span>{building.name}</span>
                        {creatingItems.has(building.id) && (
                          <span className="ml-2 text-sm text-muted-foreground">(생성중...)</span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <BuildingForm 
                        building={building}
                        onBuildingChange={(updatedBuilding) => updateBuilding(building.id, updatedBuilding)}
                        disabled={creatingItems.has(building.id)}
                      />
                      <div className="flex justify-end mt-4">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeBuilding(building.id)}
                          disabled={creatingItems.has(building.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> 건물 삭제
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevToMap}>
              이전
            </Button>
            <Button onClick={handleNextToPOI}>
              다음
            </Button>
          </CardFooter>
        </Card>
      )}
      {step === 3 && mapId && (
        <Card>
          <CardHeader>
            <CardTitle>지점 추가</CardTitle>
            <CardDescription>생성된 지도에 지점을 추가하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button onClick={addPoi}>
              <Plus className="mr-2 h-4 w-4" /> 지점 추가
            </Button>
            {pois.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
                <MapPin className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">아직 추가된 지점이 없습니다</h3>
                <p className="text-sm text-muted-foreground">"지점 추가" 버튼을 클릭하여 지도에 POI를 추가하세요</p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {pois.map((poi) => (
                  <AccordionItem key={poi.id} value={poi.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <span>{poi.name}</span>
                        {creatingItems.has(poi.id) && (
                          <span className="ml-2 text-sm text-muted-foreground">(생성중...)</span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <PoiForm 
                        poi={poi}
                        onPoiChange={(updatedPoi) => updatePoi(poi.id, updatedPoi)}
                        disabled={creatingItems.has(poi.id)}
                      />
                      <div className="flex justify-end mt-4">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removePoi(poi.id)}
                          disabled={creatingItems.has(poi.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> POI 삭제
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevToBuilding}>
              이전
            </Button>
            <Button onClick={handleFinish}>
              완료
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

// 디바운스 유틸리티 함수
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}
