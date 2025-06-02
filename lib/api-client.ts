const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE 환경 변수가 설정되지 않았습니다.");
}

export async function apiClient(path: string, options: RequestInit = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const defaultOptions: RequestInit = {
    credentials: "include",
    ...options,
  };
  const res = await fetch(url, defaultOptions);
  if (!res.ok) {
    let message = `API 요청 실패: ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
} 