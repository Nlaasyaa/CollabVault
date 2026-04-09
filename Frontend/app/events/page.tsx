"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import EventsPageContent from "@/components/pages/events-page"

export default function EventsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectChat={() => {}}
        activeChatId={null}
        activePage="events"
        onSelectPage={(page) => {
          if (page === "posts") router.push("/")
          else router.push(`/${page}`)
        }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <EventsPageContent />
      </div>
    </div>
  )
}