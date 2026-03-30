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
    <div ref={containerRef} className="flex flex-1 overflow-hidden bg-background relative">
      {/* Chat List */}
      <div 
        style={{ width: dividerX }} 
        className={`flex flex-col border-r border-border overflow-hidden max-md:!w-full ${activeChatId ? "hidden md:flex" : "flex"}`}
      >
        <ChatList activeChatId={activeChatId} onSelectChat={onSelectChat || (() => { })} onChatUsersUpdate={onChatUsersUpdate} />
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        className="hidden md:block w-1 bg-border hover:bg-primary cursor-col-resize transition-colors shrink-0"
      />

      {/* Chat Window */}
      <div 
        style={{ width: `calc(100% - ${dividerX}px - 4px)` }} 
        className={`flex flex-col overflow-hidden max-md:!w-full ${!activeChatId ? "hidden md:flex" : "flex"}`}
      >
        {activeChatId && (
          <div className="md:hidden p-3 bg-muted/50 border-b border-border flex items-center shrink-0 w-full z-10 sticky top-0">
            <button onClick={() => onSelectChat && onSelectChat('')} className="text-foreground text-sm flex items-center gap-2 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Go Back
            </button>
          </div>
        )}
        <ChatWindow activeChatId={activeChatId} />
      </div>
    </div>
  )
}
