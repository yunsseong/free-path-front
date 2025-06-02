const API_BASE = "http://localhost:8080"

export async function getMap(mapId: string) {
  const res = await fetch(`${API_BASE}/api/maps/${mapId}`, { credentials: 'include' })
  if (!res.ok) throw new Error('지도를 불러오지 못했습니다')
  return res.json()
}

// 지도 관련
export async function getMaps() {
  const res = await fetch(`${API_BASE}/api/maps`, { credentials: 'include' })
  if (!res.ok) throw new Error('지도를 불러오지 못했습니다')
  return res.json()
}

export async function createMap(data: any) {
  const res = await fetch(`${API_BASE}/api/maps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('지도 생성 실패')
  return res.json()
}

export async function updateMap(mapId: string, data: any) {
  const res = await fetch(`${API_BASE}/api/maps/${mapId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('지도 수정 실패')
  return res.json()
}

export async function deleteMap(mapId: string) {
  const res = await fetch(`${API_BASE}/api/maps/${mapId}`, { method: 'DELETE', credentials: 'include' })
  if (!res.ok) throw new Error('지도 삭제 실패')
  return res.json()
}

// 건물 관련
export async function getBuildings(mapId: string) {
  const res = await fetch(`${API_BASE}/api/maps/${mapId}/buildings`, { credentials: 'include' })
  if (!res.ok) throw new Error('건물 목록 불러오기 실패')
  return res.json()
}

export async function createBuilding(mapId: string, data: any) {
  console.log('건물 생성 요청:', { mapId, data })
  const res = await fetch(`${API_BASE}/api/maps/${mapId}/buildings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  
  console.log('건물 생성 응답 상태:', res.status)
  
  if (!res.ok) {
    let errorMessage = `건물 생성 실패 (${res.status})`
    try {
      const errorData = await res.json()
      console.log('건물 생성 에러 응답:', errorData)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      console.log('에러 응답 파싱 실패, 텍스트로 시도')
      const errorText = await res.text()
      console.log('건물 생성 에러 텍스트:', errorText)
      if (errorText) errorMessage = errorText
    }
    throw new Error(errorMessage)
  }
  
  const result = await res.json()
  console.log('건물 생성 성공 응답:', result)
  return result
}

export async function updateBuilding(mapId: string, buildingId: string, data: any) {
  console.log('건물 수정 요청:', { mapId, buildingId, data })
  const res = await fetch(`${API_BASE}/api/maps/${mapId}/buildings/${buildingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  
  console.log('건물 수정 응답 상태:', res.status)
  
  if (!res.ok) {
    let errorMessage = `건물 수정 실패 (${res.status})`
    try {
      const errorData = await res.json()
      console.log('건물 수정 에러 응답:', errorData)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      console.log('에러 응답 파싱 실패, 텍스트로 시도')
      const errorText = await res.text()
      console.log('건물 수정 에러 텍스트:', errorText)
      if (errorText) errorMessage = errorText
    }
    throw new Error(errorMessage)
  }
  
  const result = await res.json()
  console.log('건물 수정 성공 응답:', result)
  return result
}

export async function deleteBuilding(mapId: string, buildingId: string) {
  const res = await fetch(`${API_BASE}/api/maps/${mapId}/buildings/${buildingId}`, { method: 'DELETE', credentials: 'include' })
  if (!res.ok) throw new Error('건물 삭제 실패')
  return res.json()
}

// 층 관련
export async function getFloors(buildingId: string) {
  const res = await fetch(`${API_BASE}/api/buildings/${buildingId}/floors`, { credentials: 'include' })
  if (!res.ok) throw new Error('층 목록 불러오기 실패')
  return res.json()
}

export async function createFloors(buildingId: string, data: any[]) {
  console.log('층 생성 요청:', { buildingId, data })
  const res = await fetch(`${API_BASE}/api/buildings/${buildingId}/floors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  
  console.log('층 생성 응답 상태:', res.status)
  
  if (!res.ok) {
    let errorMessage = `층 생성 실패 (${res.status})`
    try {
      const errorData = await res.json()
      console.log('층 생성 에러 응답:', errorData)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      const errorText = await res.text()
      console.log('층 생성 에러 텍스트:', errorText)
      if (errorText) errorMessage = errorText
    }
    throw new Error(errorMessage)
  }
  
  const result = await res.json()
  console.log('층 생성 성공 응답:', result)
  return result
}

export async function updateFloors(buildingId: string, data: any[]) {
  console.log('층 수정 요청:', { buildingId, data })
  const res = await fetch(`${API_BASE}/api/buildings/${buildingId}/floors`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  
  console.log('층 수정 응답 상태:', res.status)
  
  if (!res.ok) {
    let errorMessage = `층 수정 실패 (${res.status})`
    try {
      const errorData = await res.json()
      console.log('층 수정 에러 응답:', errorData)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      const errorText = await res.text()
      console.log('층 수정 에러 텍스트:', errorText)
      if (errorText) errorMessage = errorText
    }
    throw new Error(errorMessage)
  }
  
  const result = await res.json()
  console.log('층 수정 성공 응답:', result)
  return result
}

export async function deleteFloor(buildingId: string, floorId: string) {
  const res = await fetch(`${API_BASE}/api/buildings/${buildingId}/floors/${floorId}`, { method: 'DELETE', credentials: 'include' })
  if (!res.ok) throw new Error('층 삭제 실패')
  return res.json()
}

// POI 관련
export async function getPoints(mapId: string) {
  const res = await fetch(`${API_BASE}/api/maps/${mapId}/pois`, { credentials: 'include' })
  if (!res.ok) throw new Error('POI 목록 불러오기 실패')
  return res.json()
}

export async function createPoint(mapId: string, data: any) {
  console.log('POI 생성 요청:', { mapId, data })
  const res = await fetch(`${API_BASE}/api/maps/${mapId}/pois`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  
  console.log('POI 생성 응답 상태:', res.status)
  
  if (!res.ok) {
    let errorMessage = `POI 생성 실패 (${res.status})`
    try {
      const errorData = await res.json()
      console.log('POI 생성 에러 응답:', errorData)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      console.log('에러 응답 파싱 실패, 텍스트로 시도')
      const errorText = await res.text()
      console.log('POI 생성 에러 텍스트:', errorText)
      if (errorText) errorMessage = errorText
    }
    throw new Error(errorMessage)
  }
  
  const result = await res.json()
  console.log('POI 생성 성공 응답:', result)
  return result
}

export async function updatePoint(mapId: string, poiId: string, data: any) {
  console.log('POI 수정 요청:', { mapId, poiId, data })
  const res = await fetch(`${API_BASE}/api/maps/${mapId}/pois/${poiId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })
  
  console.log('POI 수정 응답 상태:', res.status)
  
  if (!res.ok) {
    let errorMessage = `POI 수정 실패 (${res.status})`
    try {
      const errorData = await res.json()
      console.log('POI 수정 에러 응답:', errorData)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      console.log('에러 응답 파싱 실패, 텍스트로 시도')
      const errorText = await res.text()
      console.log('POI 수정 에러 텍스트:', errorText)
      if (errorText) errorMessage = errorText
    }
    throw new Error(errorMessage)
  }
  
  const result = await res.json()
  console.log('POI 수정 성공 응답:', result)
  return result
}

export async function deletePoint(mapId: string, poiId: string) {
  const res = await fetch(`${API_BASE}/api/maps/${mapId}/pois/${poiId}`, { method: 'DELETE', credentials: 'include' })
  if (!res.ok) throw new Error('POI 삭제 실패')
  return res.json()
} 