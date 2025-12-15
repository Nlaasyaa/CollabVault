"use client"

import { Search } from 'lucide-react'
import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { getMyConnections, markMessagesRead } from "@/lib/apiClient"

interface ChatListProps {
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onChatUsersUpdate?: (users: Array<{ id: string; name: string; avatar: string; online?: boolean }>) => void
}

export default function ChatList({ activeChatId, onSelectChat, onChatUsersUpdate }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [chats, setChats] = useState<any[]>([])
  const { user, token } = useAuth()

  useEffect(() => {
    const fetchChats = async () => {
      if (!token) return;

      try {
        const connections = await getMyConnections(token);
        // Create chat entries for connected users
        const now = new Date();
        const userChats = connections.map((profile: any) => ({
          id: `user-${profile.user_id}`, // Use consistent ID format
          userId: profile.user_id, // Store actual user ID for API calls
          name: profile.display_name || "User",
          lastMessage: profile.last_message || "Start a conversation",
          timestamp: profile.last_message_time || now.toISOString(), // Use real timestamp or now if none
          unread: profile.unread_count || 0,
          online: true,
        }));
        // Sort chats by timestamp descending (newest first)
        userChats.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setChats(userChats);
      } catch (error) {
        console.error("Failed to fetch connections for chat:", error);
      }
    };

    if (user && token) {
      fetchChats();
    }
  }, [user?.id, token])

  const dynamicChats = useMemo(() => {
    return chats;
  }, [chats])

  useEffect(() => {
    const availableUsers = dynamicChats.map((chat) => {
      const initials = chat.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")

      return {
        id: chat.id,
        name: chat.name,
        avatar: initials,
        online: chat.online,
      }
    })

    console.log("[v0] Chat list users available:", availableUsers)
    onChatUsersUpdate?.(availableUsers)
  }, [dynamicChats])

  const filteredChats = dynamicChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-base font-semibold mb-3 text-foreground">Messages</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats"
            className="w-full rounded-lg bg-muted pl-9 pr-3 py-2 text-sm outline-none ring-ring/50 focus:ring-2 placeholder-muted-foreground"
          />
        </div>
      </div>

      {/* Chat Items */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {searchQuery ? "No chats found" : "No connections yet. Start by finding teammates!"}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={async () => {
                onSelectChat(chat.id);
                if (chat.unread > 0 && token) {
                  try {
                    await markMessagesRead(chat.userId, token);
                    // Update local state to clear badge
                    setChats(current => current.map(c =>
                      c.id === chat.id ? { ...c, unread: 0 } : c
                    ));
                  } catch (e) {
                    console.error("Failed to mark read", e);
                  }
                }
              }}
              className={`w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50 ${activeChatId === chat.id ? "bg-muted" : ""
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={`relative h-12 w-12 flex-shrink-0 rounded-lg bg-blue-100 flex items-center justify-center font-semibold text-sm text-blue-700`}
                >
                  {chat.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-medium text-sm text-foreground truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{new Date(chat.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                {chat.unread > 0 && (
                  <div className="flex-shrink-0 ml-2 h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-semibold">
                    {chat.unread}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
