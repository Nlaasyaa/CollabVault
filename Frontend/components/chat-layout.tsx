"use client"

import { useState, useRef, useEffect } from "react"
import ChatWindow from "./chat-window"
import ChatList from "./chat-list"

interface ChatLayoutProps {
  activeChatId: string | null
  onSelectChat?: (chatId: string) => void
  onChatUsersUpdate?: (users: Array<{ id: string; name: string; avatar: string; online?: boolean }>) => void
}

export default function ChatLayout({ activeChatId, onSelectChat, onChatUsersUpdate }: ChatLayoutProps) {
  const [dividerX, setDividerX] = useState(300)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const MIN_LIST_WIDTH = 250
  const MAX_LIST_WIDTH = 600
  const MIN_CHAT_WIDTH = 400

  const handleMouseDown = () => {
    isDraggingRef.current = true
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const newX = e.clientX - containerRect.left

      // Enforce constraints
      if (newX >= MIN_LIST_WIDTH && newX <= containerWidth - MIN_CHAT_WIDTH) {
        setDividerX(newX)
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden bg-background">
      {/* Chat List */}
      <div style={{ width: dividerX }} className="flex flex-col border-r border-border overflow-hidden">
        <ChatList activeChatId={activeChatId} onSelectChat={onSelectChat || (() => { })} onChatUsersUpdate={onChatUsersUpdate} />
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
      />

      {/* Chat Window */}
      <div style={{ width: `calc(100% - ${dividerX}px - 4px)` }} className="flex flex-col overflow-hidden">
        <ChatWindow activeChatId={activeChatId} />
      </div>
    </div>
  )
}
