"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, MapPin, Plus, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import KakaoMap from "@/components/kakao-map"
import { BuildingForm } from "@/components/building-form"
import { PoiForm, PoiData } from "@/components/poi-form"
import { 
  getMap, 
  updateMap, 
  createBuilding, 
  updateBuilding as updateBuildingAPI, 
  deleteBuilding, 
  createFloors, 
  updateFloors,
  createPoint, 
  updatePoint, 
  deletePoint 
} from "@/lib/api"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { apiClient } from "@/lib/api-client"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"
import _ from 'lodash'

// BuildingData 타입 정의 추가
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

// import { KakaoMapSettings } from "@/components/kakao-map-settings"

export default function EditMapPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  
  // 1단계 입력값 상태 관리
  const [mapName, setMapName] = useState("")
  const [mapDescription, setMapDescription] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [coordinate, setCoordinate] = useState({ lat: 37.5665, lng: 126.9780 })
  const [accessCode, setAccessCode] = useState("")
  
  // 2단계, 3단계 상태 관리
  const [buildings, setBuildings] = useState<BuildingData[]>([])
  const [pois, setPois] = useState<PoiData[]>([])
  
  // 기존 지도 데이터 로드
  useEffect(() => {
    setLoading(true)
    setError(null)
    apiClient("/api/auth/me")
      .then((res) => {
        if (!res) {
          router.push("/login")
          throw new Error("인증 필요")
        }
        return getMap(id)
      })
      .then((response) => {
        console.log('지도 데이터 응답:', response)
        const data = response.data || response // API 응답이 data로 감싸진 경우 처리
        
        // 기존 데이터로 상태 초기화
        setMapName(data.name || "")
        setMapDescription(data.description || "")
        setIsPublished(data.status === "DEPLOYING")
        
        if (data.centralCoordinate) {
          setCoordinate({
            lat: data.centralCoordinate.lat || 37.5665,
            lng: data.centralCoordinate.lng || 126.9780
          })
        }
        
        // 건물 데이터 변환
        if (data.buildings && Array.isArray(data.buildings)) {
          const convertedBuildings = data.buildings.map((building: any) => ({
            id: building.id?.toString() || `building-${Date.now()}`,
            name: building.name || "이름 없는 건물",
            number: building.number || "",
            location: {
              lat: building.coordinate?.lat || 37.5665,
              lng: building.coordinate?.lng || 126.978
            },
            floors: building.floors?.map((floor: any) => ({
              id: floor.floorId?.toString() || floor.id?.toString() || `floor-${Date.now()}`,
              name: floor.floorLabel || floor.name || `${floor.idx || 1}층`
            })) || [],
            accessibility: {
              wheelchair: building.wheel || false,
              elevator: building.elevator || false,
              restroom: building.toilet || false,
              braille: building.dots || false
            },
            caution: building.caution || ""
          }))
          console.log('변환된 건물 데이터:', convertedBuildings)
          setBuildings(convertedBuildings)
        }
        
        // POI 데이터 변환
        if (data.points && Array.isArray(data.points)) {
          const convertedPois = data.points.map((poi: any) => ({
            id: poi.id?.toString() || `poi-${Date.now()}`,
            name: poi.memo || `${poi.type === 'ramp' ? '경사로' : '주차장'} ${poi.id}` || "관심 지점",
            type: poi.type || "ramp",
            location: {
              lat: poi.coordinate?.lat || 37.5665,
              lng: poi.coordinate?.lng || 126.978
            },
            note: poi.memo || ""
          }))
          console.log('변환된 POI 데이터:', convertedPois)
          setPois(convertedPois)
        }
        
        setAccessCode(data.nickname || "")
        
        console.log('지도 데이터 로딩 완료!')
        console.log('최종 상태:', {
          mapName: data.name,
          buildings: data.buildings?.length || 0,
          pois: data.points?.length || 0
        })
      })
      .catch((e) => {
        console.error('지도 데이터 로딩 실패:', e)
        if (e.message !== "인증 필요") setError(e.message)
      })
      .finally(() => setLoading(false))
  }, [id, router])

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

  // 1단계: 지도 정보 수정
  const handleUpdateMap = async () => {
    setSaving(true)
    setError(null)
    try {
      const status = isPublished ? "DEPLOYING" : "STOPPED"
      const centralCoordinate = {
        lat: coordinate.lat,
        lng: coordinate.lng,
      }
      const data = { 
        name: mapName, 
        description: mapDescription, 
        status, 
        centralCoordinate,
        nickname: accessCode
      }
      await updateMap(id, data)
      setStep(2)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const addBuilding = async () => {
    const newBuilding: BuildingData = {
      id: `building-${Date.now()}`,
      name: `새 건물 ${buildings.length + 1}`,
      number: "",
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
    
    try {
      // 서버에 건물 생성
      const buildingData = {
        name: newBuilding.name,
        number: newBuilding.number,
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
      
      const response = await createBuilding(id, buildingData)
      const serverBuildingId = response?.data?.buildingId || response?.buildingId
      
      // 클라이언트 상태 업데이트
      const buildingWithServerId = { ...newBuilding, id: serverBuildingId?.toString() || newBuilding.id }
      setBuildings([...buildings, buildingWithServerId])
    } catch (error) {
      console.error('건물 생성 실패:', error)
      setError('건물 생성에 실패했습니다.')
    }
  }

  // 디바운스된 업데이트 함수들
  const debouncedUpdateBuilding = useCallback(
    _.debounce(async (buildingId: string, updatedBuilding: BuildingData) => {
      if (!id) return
      
      try {
        setSaveStatus("건물 정보를 저장하는 중...")
        
        const buildingData = {
          name: updatedBuilding.name,
          number: updatedBuilding.number,
          coordinate: {
            lat: updatedBuilding.location.lat,
            lng: updatedBuilding.location.lng
          },
          wheel: updatedBuilding.accessibility.wheelchair,
          elevator: updatedBuilding.accessibility.elevator,
          toilet: updatedBuilding.accessibility.restroom,
          dots: updatedBuilding.accessibility.braille,
          caution: updatedBuilding.caution
        }
        
        await updateBuildingAPI(id, buildingId, buildingData)
        
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
      }
    }, 1000),
    [id]
  )
  const debouncedUpdatePoi = useCallback(
    _.debounce(async (poiId: string, updatedPoi: PoiData) => {
      if (!id) return
      
      try {
        setSaving(true)
        setSaveStatus("지점 정보를 저장하는 중...")
        
        const poiData = {
          coordinate: {
            lat: Math.round(updatedPoi.location.lat),
            lng: Math.round(updatedPoi.location.lng)
          },
          memo: updatedPoi.note,
          type: updatedPoi.type === "ramp" ? "ramp" : "parking"
        }
        
        await updatePoint(id, poiId, poiData)
        
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
    [id]
  )

  const updateBuilding = async (buildingId: string, updatedBuilding: BuildingData) => {
    // 클라이언트 상태 즉시 업데이트  
    setBuildings(buildings.map((building: BuildingData) => 
      building.id === buildingId ? updatedBuilding : building
    ))
    
    // 서버에 디바운스된 업데이트
    debouncedUpdateBuilding(buildingId, updatedBuilding)
  }

  const removeBuilding = async (buildingId: string) => {
    try {
      await deleteBuilding(id, buildingId)
      setBuildings(buildings.filter((building: BuildingData) => building.id !== buildingId))
    } catch (error) {
      console.error('건물 삭제 실패:', error)
      setError('건물 삭제에 실패했습니다.')
    }
  }

  const addPoi = async () => {
    const newPoi: PoiData = {
      id: `poi-${Date.now()}`,
      name: `새 지점 ${pois.length + 1}`,
      type: "ramp",
      location: { lat: 37.5665, lng: 126.978 },
      note: ""
    }
    
    try {
      // 서버에 POI 생성
      const poiData = {
        coordinate: {
          lat: Math.round(newPoi.location.lat),
          lng: Math.round(newPoi.location.lng)
        },
        memo: newPoi.note,
        type: newPoi.type === "ramp" ? "ramp" : "parking"
      }
      
      const response = await createPoint(id, poiData)
      const serverPoiId = response?.data?.poiId || response?.poiId
      
      // 클라이언트 상태 업데이트
      const poiWithServerId = { ...newPoi, id: serverPoiId?.toString() || newPoi.id }
      setPois([...pois, poiWithServerId])
    } catch (error) {
      console.error('지점 생성 실패:', error)
      setError('지점 생성에 실패했습니다.')
    }
  }

  const updatePoi = async (poiId: string, updatedPoi: PoiData) => {
    // 클라이언트 상태 즉시 업데이트
    setPois(pois.map((poi: PoiData) => 
      poi.id === poiId ? updatedPoi : poi
    ))
    
    // 서버에 디바운스된 업데이트
    debouncedUpdatePoi(poiId, updatedPoi)
  }

  const removePoi = async (poiId: string) => {
    try {
      await deletePoint(id, poiId)
      setPois(pois.filter((poi: PoiData) => poi.id !== poiId))
    } catch (error) {
      console.error('POI 삭제 실패:', error)
      setError('관심 지점 삭제에 실패했습니다.')
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
    router.push("/maps")
  }

  // 스텝 표시 UI
  const Stepper = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className={`font-bold ${step === 1 ? "text-primary" : "text-muted-foreground"}`}>1. 지도 정보</div>
      <div className="h-0.5 w-6 bg-muted-foreground/30" />
      <div className={`font-bold ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>2. 건물</div>
      <div className="h-0.5 w-6 bg-muted-foreground/30" />
      <div className={`font-bold ${step === 3 ? "text-primary" : "text-muted-foreground"}`}>3. 지점</div>
    </div>
  )

  // 디바운스 유틸리티 함수
  function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }) as T
  }

  // 지도 게시/중단 API 호출 함수
  const handlePublishToggle = async (checked: boolean) => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const endpoint = checked ? `/api/maps/${id}/publish` : `/api/maps/${id}/unpublish`;
      const res = await fetch(`https://port-0-barrier-free-map-server-mbdezq0l7f20ef60.sel4.cloudtype.app${endpoint}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("상태 변경 실패");
      setIsPublished(checked);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // 파일 업로드 및 presigned url 업로드 함수
  const handleFileUpload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const uuidFileName = `${uuidv4()}.${ext}`;
    // 1. presigned URL 요청 (POST, body에 fileName만)
    const presignedRes = await apiClient("/api/images/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: uuidFileName
      })
    });
    const uploadUrl = presignedRes.data.uploadUrl;
    // 2. presigned URL로 이미지 PUT 업로드
    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type }
    });
    // 3. 업로드된 파일명 반환 (필요시)
    return uuidFileName;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>지도를 불러오는 중...</p>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <p className="text-destructive text-lg mb-4">오류: {error}</p>
        <Button onClick={() => window.location.reload()}>다시 시도</Button>
      </div>
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
        <h1 className="text-3xl font-bold tracking-tight">지도 편집: {mapName}</h1>
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
            <CardDescription>지도의 기본 정보와 위치를 수정하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">지도 이름</Label>
              <Input 
                id="name" 
                placeholder="지도 이름을 입력하세요" 
                value={mapName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMapName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access-code">지도 접속 코드</Label>
              <Input
                id="access-code"
                placeholder="지도 접속 코드를 입력하세요" 
                value={accessCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9\-]/g, '');
                  setAccessCode(value);
                }}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground mt-1">지도 접속 코드는 지도 주소 경로에 사용됩니다. 영문, 숫자, 하이픈(-)만 사용하여 띄어쓰기 없이 입력해주세요.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">지도 설명 (선택사항)</Label>
              <Textarea 
                id="description" 
                placeholder="이 지도에 대한 설명을 입력하세요" 
                value={mapDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMapDescription(e.target.value)}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCoordinateChange(e, "lat")}
                  />
                </div>
                <div>
                  <Label htmlFor="lng">경도</Label>
                  <Input
                    id="lng"
                    placeholder="경도"
                    value={coordinate.lng}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCoordinateChange(e, "lng")}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="published" checked={isPublished} onCheckedChange={handlePublishToggle} />
              <Label htmlFor="published">이 지도 게시하기 {isPublished ? "(현재 게시됨)" : "(현재 중지됨)"}</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleUpdateMap} disabled={saving}>
              다음
            </Button>
          </CardFooter>
        </Card>
      )}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>건물 편집</CardTitle>
            <CardDescription>지도의 건물을 편집하세요</CardDescription>
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
                {buildings.map((building: BuildingData) => (
                  <AccordionItem key={building.id} value={building.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <span>{building.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <BuildingForm 
                        building={building}
                        onBuildingChange={(updatedBuilding) => updateBuilding(building.id, updatedBuilding)}
                      />
                      <div className="flex justify-end mt-4">
                        <Button variant="destructive" size="sm" onClick={() => removeBuilding(building.id)}>
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
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>지점 편집</CardTitle>
            <CardDescription>지도의 지점을 편집하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button onClick={addPoi}>
              <Plus className="mr-2 h-4 w-4" /> 지점 추가
            </Button>
            {pois.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
                <MapPin className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">아직 추가된 지점이 없습니다</h3>
                <p className="text-sm text-muted-foreground">"지점 추가" 버튼을 클릭하여 지도에 지점을 추가하세요</p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {pois.map((poi: PoiData) => (
                  <AccordionItem key={poi.id} value={poi.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <span>{poi.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <PoiForm 
                        poi={poi}
                        onPoiChange={(updatedPoi) => updatePoi(poi.id, updatedPoi)}
                      />
                      <div className="flex justify-end mt-4">
                        <Button variant="destructive" size="sm" onClick={() => removePoi(poi.id)}>
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
