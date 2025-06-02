const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

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