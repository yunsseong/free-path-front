"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Map, AlertTriangle, Menu, User, LogOut, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

const routes = [
  {
    label: "대시보드",
    icon: BarChart3,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "지도",
    icon: Map,
    href: "/maps",
    color: "text-emerald-500",
  },
  {
    label: "불편 신고",
    icon: AlertTriangle,
    href: "/reports",
    color: "text-orange-500",
  },
]

function UserProfileDropdown() {
  const { user, logout } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatar-default.png" alt="관리자" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <p className="text-sm font-medium leading-none">관리자</p>
              <p className="text-xs text-muted-foreground">{user?.email || "-"}</p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">관리자</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || "-"}</p>
            <p className="text-xs leading-none text-muted-foreground">관리자</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>프로필</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6">
        <h1 className="text-xl font-bold">FreePath</h1>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-2 overflow-y-auto">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-4 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
              pathname === route.href ? "bg-muted text-primary" : "text-muted-foreground",
            )}
          >
            <route.icon className={cn("h-5 w-5", route.color)} />
            {route.label}
          </Link>
        ))}
      </div>

      {/* 사용자 프로필 섹션 */}
      <div className="mt-auto p-2 border-t space-y-2">
        <UserProfileDropdown />
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setLogoutDialogOpen(true)}
        >
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>로그아웃 하시겠습니까?</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>취소</Button>
              <Button variant="destructive" onClick={logout}>확인</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background fixed left-0 top-0">
        <SidebarContent />
      </div>

      {/* 모바일 사이드바 */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
