"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from "@/components/sidebar"
import ChatLayout from "@/components/chat-layout"
import PostsPage from "@/components/pages/posts-page"
import FindTeammatesPage from "@/components/pages/find-teammates-page"
import TeamChatsPage from "@/components/pages/team-chats-page"
import ProfilesPage from "@/components/pages/profiles-page"
import SettingsPage from "@/components/pages/settings-page"
import FeedbackPage from "@/components/pages/feedback-page"
import AdminPage from "@/components/pages/admin-page"

function HomeContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/landing")
    }
  }, [isAuthenticated, isLoading, router])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePage, setActivePage] = useState<string>("posts")
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [chatUsers, setChatUsers] = useState<Array<{ id: string; name: string; avatar: string; online?: boolean }>>([])

  useEffect(() => {
    const pageParam = searchParams.get("page")
    if (pageParam) {
      setActivePage(pageParam)
    }
    setIsReady(true)
  }, [searchParams])

  const handleChatUsersUpdate = (users: Array<{ id: string; name: string; avatar: string; online?: boolean }>) => {
    console.log("[v0] Updating chat users for team creation:", users)
    setChatUsers(users)
  }

  const handleOpenChatFromProfile = (userId: string) => {
    setActiveChatId(`user-${userId}`)
    setActivePage("direct")
  }

  // Don't render until storage is cleared
  if (!isReady || (isLoading && !isAuthenticated)) {
    return <div className="w-full h-screen bg-background flex items-center justify-center" />
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectChat={setActiveChatId}
        activeChatId={activeChatId}
        activePage={activePage}
        onSelectPage={(page) => {
          setActivePage(page)
          // Optional: clear query param when manually changing page to keep URL clean, or update it
          router.push('/', { scroll: false })
        }}
      />

      {activePage === "direct" && (
        <ChatLayout activeChatId={activeChatId} onSelectChat={setActiveChatId} onChatUsersUpdate={handleChatUsersUpdate} />
      )}
      {activePage === "posts" && <PostsPage />}
      {activePage === "profiles" && <ProfilesPage onOpenChat={handleOpenChatFromProfile} />}
      {activePage === "teammates" && <FindTeammatesPage />}
      {activePage === "teams" && <TeamChatsPage chatUsers={chatUsers} />}
      {activePage === "feedback" && <FeedbackPage />}
      {activePage === "settings" && <SettingsPage onBack={() => setActivePage("direct")} />}
      {activePage === "admin" && <AdminPage />}
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-background flex items-center justify-center" />}>
      <HomeContent />
    </Suspense>
  )
}
