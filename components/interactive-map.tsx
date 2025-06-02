"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"

interface Coordinates {
  lat: string | number
  lng: string | number
}

interface InteractiveMapProps {
  initialCoordinates?: Coordinates
  onCoordinatesChange?: (coordinates: Coordinates) => void
  height?: string
  showPin?: boolean
  allowDrag?: boolean
  mapType?: "single-pin" | "rectangle"
  rectangleCoordinates?: {
    northeast: Coordinates
    southwest: Coordinates
  }
  onRectangleChange?: (coordinates: {
    northeast: Coordinates
    southwest: Coordinates
  }) => void
}

export function InteractiveMap({
  initialCoordinates = { lat: 40.7128, lng: -74.006 },
  onCoordinatesChange,
  height = "300px",
  showPin = true,
  allowDrag = true,
  mapType = "single-pin",
  rectangleCoordinates,
  onRectangleChange,
}: InteractiveMapProps) {
  const [coordinates, setCoordinates] = useState<Coordinates>(initialCoordinates)
  const [isDragging, setIsDragging] = useState(false)
  const [mapBounds, setMapBounds] = useState({ width: 0, height: 0 })
  const [rectangleMode, setRectangleMode] = useState(mapType === "rectangle")
  const [rectangle, setRectangle] = useState(
    rectangleCoordinates || {
      northeast: { lat: 40.72, lng: -73.99 },
      southwest: { lat: 40.7, lng: -74.02 },
    },
  )
  const [activeCorner, setActiveCorner] = useState<"northeast" | "southwest" | null>(null)

  // Initialize map bounds on component mount
  useEffect(() => {
    function updateMapBounds() {
      const mapElement = document.getElementById("map-container")
      if (mapElement) {
        setMapBounds({
          width: mapElement.offsetWidth,
          height: mapElement.offsetHeight,
        })
      }
    }

    updateMapBounds()
    window.addEventListener("resize", updateMapBounds)
    return () => window.removeEventListener("resize", updateMapBounds)
  }, [])

  // Update coordinates when initialCoordinates prop changes
  useEffect(() => {
    if (
      initialCoordinates &&
      (initialCoordinates.lat !== coordinates.lat || initialCoordinates.lng !== coordinates.lng)
    ) {
      setCoordinates(initialCoordinates)
    }
  }, [initialCoordinates])

  // Update rectangle when rectangleCoordinates prop changes
  useEffect(() => {
    if (rectangleCoordinates) {
      setRectangle(rectangleCoordinates)
    }
  }, [rectangleCoordinates])

  // Convert geo coordinates to pixel positions on the map
  const geoToPixel = (lat: number | string, lng: number | string) => {
    const latNum = typeof lat === "string" ? Number.parseFloat(lat) : lat
    const lngNum = typeof lng === "string" ? Number.parseFloat(lng) : lng

    // Simple linear mapping for demo purposes
    // In a real app, this would use proper geo projection
    const x = ((lngNum + 180) / 360) * mapBounds.width
    const y = ((90 - latNum) / 180) * mapBounds.height

    return { x, y }
  }

  // Convert pixel positions to geo coordinates
  const pixelToGeo = (x: number, y: number) => {
    // Simple linear mapping for demo purposes
    const lng = (x / mapBounds.width) * 360 - 180
    const lat = 90 - (y / mapBounds.height) * 180

    return { lat: lat.toFixed(6), lng: lng.toFixed(6) }
  }

  // Handle mouse down on the pin
  const handlePinMouseDown = (e: React.MouseEvent, corner?: "northeast" | "southwest") => {
    if (!allowDrag) return
    e.preventDefault()
    setIsDragging(true)
    if (mapType === "rectangle" && corner) {
      setActiveCorner(corner)
    }
  }

  // Handle mouse move on the map
  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !allowDrag) return

    const mapElement = document.getElementById("map-container")
    if (!mapElement) return

    const rect = mapElement.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, mapBounds.width))
    const y = Math.max(0, Math.min(e.clientY - rect.top, mapBounds.height))
    const newCoordinates = pixelToGeo(x, y)

    if (mapType === "single-pin") {
      setCoordinates(newCoordinates)
      onCoordinatesChange?.(newCoordinates)
    } else if (mapType === "rectangle" && activeCorner) {
      const newRectangle = { ...rectangle }
      newRectangle[activeCorner] = newCoordinates
      setRectangle(newRectangle)
      onRectangleChange?.(newRectangle)
    }
  }

  // Handle mouse up to stop dragging
  const handleMapMouseUp = () => {
    setIsDragging(false)
    setActiveCorner(null)
  }

  // Handle map click to place pin
  const handleMapClick = (e: React.MouseEvent) => {
    if (!allowDrag) return

    const mapElement = document.getElementById("map-container")
    if (!mapElement) return

    const rect = mapElement.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newCoordinates = pixelToGeo(x, y)

    if (mapType === "single-pin") {
      setCoordinates(newCoordinates)
      onCoordinatesChange?.(newCoordinates)
    }
  }

  // Get pin position for rendering
  const getPinPosition = (lat: number | string, lng: number | string) => {
    const { x, y } = geoToPixel(lat, lng)
    return { left: `${x}px`, top: `${y}px` }
  }

  // Get rectangle position and dimensions
  const getRectangleStyle = () => {
    const ne = geoToPixel(rectangle.northeast.lat, rectangle.northeast.lng)
    const sw = geoToPixel(rectangle.southwest.lat, rectangle.southwest.lng)

    const left = Math.min(ne.x, sw.x)
    const top = Math.min(ne.y, sw.y)
    const width = Math.abs(ne.x - sw.x)
    const height = Math.abs(ne.y - sw.y)

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    }
  }

  return (
    <div
      id="map-container"
      className="relative border rounded-md overflow-hidden bg-gray-100"
      style={{ height }}
      onMouseMove={handleMapMouseMove}
      onMouseUp={handleMapMouseUp}
      onMouseLeave={handleMapMouseUp}
      onClick={handleMapClick}
    >
      {/* Map background - in a real app this would be an actual map */}
      <div className="absolute inset-0 bg-gray-100">
        <svg width="100%" height="100%" className="opacity-30">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Coordinates display */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 p-2 rounded text-xs">
        {mapType === "single-pin"
          ? `Lat: ${coordinates.lat}, Lng: ${coordinates.lng}`
          : `NE: ${rectangle.northeast.lat}, ${rectangle.northeast.lng} | SW: ${rectangle.southwest.lat}, ${rectangle.southwest.lng}`}
      </div>

      {/* Rectangle selection (for map area) */}
      {mapType === "rectangle" && (
        <>
          <div
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
            style={getRectangleStyle()}
          />
          <div
            className="absolute w-4 h-4 bg-blue-500 rounded-full cursor-move -ml-2 -mt-2"
            style={getPinPosition(rectangle.northeast.lat, rectangle.northeast.lng)}
            onMouseDown={(e) => handlePinMouseDown(e, "northeast")}
          />
          <div
            className="absolute w-4 h-4 bg-blue-500 rounded-full cursor-move -ml-2 -mt-2"
            style={getPinPosition(rectangle.southwest.lat, rectangle.southwest.lng)}
            onMouseDown={(e) => handlePinMouseDown(e, "southwest")}
          />
        </>
      )}

      {/* Pin for single point selection */}
      {mapType === "single-pin" && showPin && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-full cursor-move"
          style={getPinPosition(coordinates.lat, coordinates.lng)}
          onMouseDown={handlePinMouseDown}
        >
          <MapPin className="h-8 w-8 text-red-500" />
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded text-xs">
        {allowDrag
          ? mapType === "single-pin"
            ? "Click to place pin or drag pin to set location"
            : "Drag corners to adjust map area"
          : "View only mode"}
      </div>
    </div>
  )
}
