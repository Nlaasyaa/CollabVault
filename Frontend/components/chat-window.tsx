"use client"

import { useState, useEffect, useRef } from "react"
import { Send, MoreVertical, Smile, File } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { getAllProfiles, sendMessage, getMessages, blockUser, unblockUser, checkBlocked, getProfileById } from "@/lib/apiClient"
import { useAuth } from "@/context/auth-context"
import ViewProfileModal from "@/components/view-profile-modal"
import ImageModal from "@/components/image-modal"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ChatWindowProps {
  activeChatId: string | null
}

export default function ChatWindow({ activeChatId }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  // Removed selectedFile state
  const [messages, setMessages] = useState<any[]>([])
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [blockStatus, setBlockStatus] = useState({ isBlocked: false, iBlocked: false, theyBlocked: false })
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const { token, user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch profiles and block status
  useEffect(() => {
    const fetchData = async () => {
      if (!activeChatId || !token || !activeChatId.startsWith("user-")) return;

      const otherUserId = activeChatId.replace("user-", "");

      try {
        // Fetch profiles
        const profiles = await getAllProfiles();
        const profileMap: Record<string, string> = {};
        let targetProfile = null;

        profiles.forEach((p: any) => {
          profileMap[`user-${p.user_id}`] = p.display_name;
          if (p.user_id.toString() === otherUserId) {
            targetProfile = p;
          }
        });
        setUserProfiles(profileMap);
        setCurrentProfile(targetProfile);

        // Check block status
        const status = await checkBlocked(otherUserId, token);
        setBlockStatus(status);
      } catch (error) {
        console.error("Failed to fetch data for chat window:", error);
      }
    };
    fetchData();
  }, [activeChatId, token]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu])

  // Fetch messages when active chat changes
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!activeChatId || !token || !activeChatId.startsWith("user-")) return;

      try {
        const otherUserId = activeChatId.replace("user-", "");
        const msgs = await getMessages(otherUserId, token);

        // Map backend messages to frontend format
        const mappedMsgs = msgs.map((msg: any) => ({
          id: msg.id,
          sender: msg.sender_id === user?.id ? "You" : "Them",
          message: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOwn: msg.sender_id === user?.id,
          attachment_url: msg.attachment_url,
          attachment_type: msg.attachment_type
        }));

        setMessages(mappedMsgs);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchChatMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChatId, token, user?.id]);

  const getChatName = () => {
    if (!activeChatId) return "Chat";
    return userProfiles[activeChatId] || "Chat";
  }

  const handleSend = async () => {
    if (blockStatus.isBlocked) {
      alert("Cannot send message. User is blocked.");
      return;
    }

    if (message.trim() && activeChatId && token) {
      if (!activeChatId.startsWith("user-")) {
        console.error("Invalid chat ID:", activeChatId);
        return;
      }

      try {
        const otherUserId = activeChatId.replace("user-", "");
        const res = await sendMessage(otherUserId, message, token, null);

        // Optimistic update
        const newMessage = {
          id: Date.now(),
          sender: "You",
          message: message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOwn: true,
          attachment_url: res.attachment_url,
          attachment_type: res.attachment_type
        }
        setMessages(prev => [...prev, newMessage]);
        setMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
        alert("Failed to send message. You may be blocked.");
      }
    }
  }

  const handleBlockUser = async () => {
    if (!activeChatId || !token) return;
    const otherUserId = activeChatId.replace("user-", "");

    try {
      await blockUser(otherUserId, token);
      setBlockStatus(prev => ({ ...prev, isBlocked: true, iBlocked: true }));
      alert("User blocked successfully");
    } catch (error) {
      console.error("Failed to block user:", error);
      alert("Failed to block user");
    }
  }

  const handleUnblockUser = async () => {
    if (!activeChatId || !token) return;
    const otherUserId = activeChatId.replace("user-", "");

    try {
      await unblockUser(otherUserId, token);
      setBlockStatus(prev => ({ ...prev, isBlocked: prev.theyBlocked, iBlocked: false }));
      alert("User unblocked successfully");
    } catch (error) {
      console.error("Failed to unblock user:", error);
      alert("Failed to unblock user");
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{getChatName()}</h1>
        </div>
        <div className="flex gap-2 relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical size={18} />
          </Button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
              <button
                onClick={async () => {
                  if (activeChatId) {
                    const otherUserId = activeChatId.replace("user-", "");
                    try {
                      const fullProfile = await getProfileById(otherUserId);
                      setCurrentProfile(fullProfile);
                      setIsViewProfileOpen(true);
                    } catch (err) {
                      console.error("Failed to fetch full profile", err);
                    }
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                View Profile
              </button>

              {blockStatus.iBlocked ? (
                <button
                  onClick={() => {
                    handleUnblockUser();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>
                  Unblock User
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleBlockUser();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>
                  Block User
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Start a conversation with {getChatName()}
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"} `}>
              <div className="flex flex-col">
                <div
                  className={`max-w-xs rounded-lg ${msg.attachment_type?.startsWith("image/") ? "p-1" : "px-3 py-2"} ${msg.isOwn ? "bg-[#588157] text-white" : "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    } `}
                >
                  {msg.attachment_url && (
                    <div className="mb-2">
                      {msg.attachment_type?.startsWith("image/") ? (
                        <img
                          src={`${API_URL}${msg.attachment_url}`}
                          alt="Attachment"
                          className="max-w-full max-h-48 rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setExpandedImage(`${API_URL}${msg.attachment_url}`)}
                        />
                      ) : (
                        <a
                          href={`${API_URL}${msg.attachment_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-500 underline"
                        >
                          <File size={16} />
                          Attachment
                        </a>
                      )}
                    </div>
                  )}
                  <p className="text-sm">{msg.message}</p>
                </div>
                <p className={`text-xs mt-1 ${msg.isOwn ? "text-right" : "text-left"} text-muted-foreground`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-6 py-4">
        <div className="flex gap-3 items-end">
          {/* Emoji Picker Button */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="h-10 w-10 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Smile size={20} />
            </Button>

            {/* Emoji Picker Dropdown */}
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 bg-card border border-border rounded-lg shadow-lg p-3 z-10 w-64">
                <div className="grid grid-cols-8 gap-2">
                  {['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setMessage(message + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-xl hover:bg-muted rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={blockStatus.isBlocked ? "You cannot message this user" : "Type a message..."}
            disabled={blockStatus.isBlocked}
            className="flex-1 rounded-full bg-muted px-5 py-2.5 text-sm outline-none ring-ring/50 focus:ring-2 placeholder-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Send Button */}
          <Button
            type="button"
            onClick={handleSend}
            size="sm"
            disabled={!message.trim()}
            className="h-10 w-10 p-0 flex-shrink-0 bg-blue-600 text-white hover:bg-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>


      <ViewProfileModal
        isOpen={isViewProfileOpen}
        onClose={() => setIsViewProfileOpen(false)}
        profile={currentProfile}
      />

      <ImageModal
        imageUrl={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  )
}
