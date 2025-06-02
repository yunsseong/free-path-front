import { useState } from "react"
import KakaoMap from "@/components/kakao-map"

export default function MapTestPage() {
  const [coords, setCoords] = useState({ lat: 37.5665, lng: 126.978 })

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1 style={{ fontWeight: 600, fontSize: 24, marginBottom: 16 }}>카카오 지도 위도/경도 입력 테스트</h1>
      <KakaoMap center={coords} onCenterChange={setCoords} height="400px" />
      <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
        <label>
          위도: <input value={coords.lat} readOnly style={{ width: 160 }} />
        </label>
        <label>
          경도: <input value={coords.lng} readOnly style={{ width: 160 }} />
        </label>
      </div>
    </div>
  )
} 