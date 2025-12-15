"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, MessageSquare, Users, Zap, Users2, Settings, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onSelectChat: (chatId: string) => void
  activeChatId: string | null
  activePage: string
  onSelectPage: (page: string) => void
}

const navigationItems = [
  { id: "posts", label: "Posts", icon: Zap, description: "Hackathons & projects" },
  { id: "profiles", label: "Profiles", icon: Users2, description: "Browse community" },
  { id: "teammates", label: "Find Teammate", icon: Users, description: "Recommendations" },
  { id: "direct", label: "1 on 1 Chats", icon: MessageSquare, description: "Direct messages" },
  { id: "teams", label: "Team Chats", icon: Users, description: "Group conversations" },
  { id: "feedback", label: "Feedback", icon: MessageSquare, description: "Give us feedback" },
]

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  onSelectChat,
  activeChatId,
  activePage,
  onSelectPage,
}: SidebarProps) {

  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout();
    router.push('/landing');
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-out",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-4">
        {!collapsed && <h1 className="text-xl font-bold text-pretty uppercase font-mulish tracking-[2px]">CollabVault</h1>}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto">


        {/* Navigation Links */}
        <nav className={cn("px-2 py-4", collapsed && "px-3")}>
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.id} className="mb-2">
                <button
                  onClick={() => onSelectPage(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    activePage === item.id
                      ? "bg-gray-300 text-black border border-zinc-700 shadow-sm"
                      : "hover:bg-gray-300 hover:text-black text-sidebar-foreground",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex-1">
                      <div>{item.label}</div>
                      <div className="text-gray-500">{item.description}</div>
                    </div>
                  )}
                </button>
              </div>
            )
          })}
        </nav>

        {/* Removed Recent Chats section and divider */}
      </div>

      {/* Footer - Logout */}
      {!collapsed && (
        <div className="border-t border-sidebar-border px-4 py-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm text-sidebar-foreground hover:bg-gray-300 hover:text-black"
            onClick={() => onSelectPage("settings")}
          >
            <Settings size={18} className="mr-2" />
            Settings
          </Button>

          {/* Admin Link */}
          {(user as any)?.role === 'admin' && (
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-red-500 hover:bg-red-500/10 hover:text-red-500"
              onClick={() => onSelectPage("admin")}
            >
              <Shield size={18} className="mr-2" />
              Admin
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full text-sm text-sidebar-foreground hover:bg-gray-300 hover:text-black"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      )}
    </div>
  )
}
