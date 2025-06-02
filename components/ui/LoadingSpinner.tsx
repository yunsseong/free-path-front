"use client"
import { Loader2 } from "lucide-react"

export default function LoadingSpinner({ text = "로딩 중..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
      <span className="text-muted-foreground">{text}</span>
    </div>
  )
} 