"use client"

import Sidebar from "@/components/sidebar"
import AdminPageContent from "@/components/pages/admin-page"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectChat={() => {}}
        activeChatId={null}
        activePage="admin"
        onSelectPage={(page) => {
          if (page === "posts") router.push("/")
          else router.push(`/${page}`)
        }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminPageContent />
      </div>
    </div>
  )
}
