import { apiClient } from "./api-client"

export async function getMap(mapId: string) {
  return apiClient(`/api/maps/${mapId}`)
}

// 지도 관련
export async function getMaps() {
  return apiClient("/api/maps")
}

export async function createMap(data: any) {
  return apiClient("/api/maps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function updateMap(mapId: string, data: any) {
  return apiClient(`/api/maps/${mapId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function deleteMap(mapId: string) {
  return apiClient(`/api/maps/${mapId}`, { method: "DELETE" })
}

// 건물 관련
export async function getBuildings(mapId: string) {
  return apiClient(`/api/maps/${mapId}/buildings`)
}

export async function createBuilding(mapId: string, data: any) {
  return apiClient(`/api/maps/${mapId}/buildings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function updateBuilding(mapId: string, buildingId: string, data: any) {
  return apiClient(`/api/maps/${mapId}/buildings/${buildingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function deleteBuilding(mapId: string, buildingId: string) {
  return apiClient(`/api/maps/${mapId}/buildings/${buildingId}`, { method: "DELETE" })
}

// 층 관련
export async function getFloors(buildingId: string) {
  return apiClient(`/api/buildings/${buildingId}/floors`)
}

export async function createFloors(buildingId: string, data: any[]) {
  return apiClient(`/api/buildings/${buildingId}/floors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function updateFloors(buildingId: string, data: any[]) {
  return apiClient(`/api/buildings/${buildingId}/floors`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function deleteFloor(buildingId: string, floorId: string) {
  return apiClient(`/api/buildings/${buildingId}/floors/${floorId}`, { method: "DELETE" })
}

// POI 관련
export async function getPoints(mapId: string) {
  return apiClient(`/api/maps/${mapId}/pois`)
}

export async function createPoint(mapId: string, data: any) {
  return apiClient(`/api/maps/${mapId}/pois`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function updatePoint(mapId: string, poiId: string, data: any) {
  return apiClient(`/api/maps/${mapId}/pois/${poiId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}

export async function deletePoint(mapId: string, poiId: string) {
  return apiClient(`/api/maps/${mapId}/pois/${poiId}`, { method: "DELETE" })
} 