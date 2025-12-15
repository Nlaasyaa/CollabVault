"use client"

import { useState, useEffect, useRef } from "react"
import { Send, MoreVertical, Smile, Search, Plus, X, File, Users, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import CreateGroupModal from "@/components/create-group-modal"
import AddMemberModal from "@/components/add-member-modal"
import ManageMembersModal from "@/components/manage-members-modal"
import { useAuth } from "@/context/auth-context"
import { getMyConnections, createTeamGroup, getMyTeamGroups, sendTeamMessage, getTeamMessages, deleteTeamGroup, addMemberToGroup, removeMemberFromGroup, markGroupRead, leaveTeamGroup } from "@/lib/apiClient"
import ImageModal from "@/components/image-modal"

const teamGroups: Array<{
  id: string
  name: string
  members: number
  avatar: string
  lastMessage?: string
  timestamp?: string
  online?: boolean
  unread?: number
  createdBy?: string
}> = []

interface TeamMessage {
  id: number
  sender: string
  message: string
  timestamp: string
  isOwn: boolean
  attachment_url?: string
  attachment_type?: string
}

const teamMessages: Record<string, TeamMessage[]> = {}

interface TeamChatsPageProps {
  chatUsers?: Array<{ id: string; name: string; avatar: string; online?: boolean }>
}

export default function TeamChatsPage({ chatUsers = [] }: TeamChatsPageProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false)
  const [groups, setGroups] = useState(teamGroups)
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; avatar: string }>>([])
  const [currentMembers, setCurrentMembers] = useState<string[]>([])
  const [groupMembersDetails, setGroupMembersDetails] = useState<Array<{ id: string; display_name: string; avatar?: string }>>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const { token, user } = useAuth()

  // Resizable Sidebar Logic
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

  // Fetch connections for group creation
  useEffect(() => {
    const fetchConnections = async () => {
      if (!token) return;

      try {
        const connections = await getMyConnections(token);
        if (Array.isArray(connections)) {
          const users = connections.map((profile: any) => ({
            id: profile.user_id.toString(),
            name: profile.display_name || "User",
            avatar: (profile.display_name || "U").substring(0, 2).toUpperCase()
          }));
          setAvailableUsers(users);
        } else {
          console.error("Connections response is not an array:", connections);
          setAvailableUsers([]);
        }
      } catch (error) {
        console.error("Failed to fetch connections for team creation:", error);
        setAvailableUsers([]);
      }
    };

    fetchConnections();
  }, [token])

  // Fetch team groups from backend
  useEffect(() => {
    const fetchGroups = async () => {
      if (!token) return;

      try {
        const teamGroups = await getMyTeamGroups(token);
        if (Array.isArray(teamGroups)) {
          const formattedGroups = teamGroups.map((group: any) => ({
            id: group.id.toString(),
            name: group.name,
            members: group.member_count,
            avatar: group.name.substring(0, 2).toUpperCase(),
            lastMessage: group.last_message,
            timestamp: group.last_message_time,
            unread: group.unread_count || 0,
            createdBy: group.created_by?.toString()
          }));
          // Sort by timestamp if available
          formattedGroups.sort((a: any, b: any) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
          });
          setGroups(formattedGroups);
        }
      } catch (error) {
        console.error("Failed to fetch team groups:", error);
      }
    };

    fetchGroups();
  }, [token])

  const [messages, setMessages] = useState<any[]>([])
  // user is already destructured above

  // Fetch messages when group changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedTeamId || !token) {
        setMessages([]);
        return;
      }

      // Check if the selected group still exists
      const groupExists = groups.find(g => g.id === selectedTeamId);
      if (!groupExists) {
        setMessages([]);
        setSelectedTeamId(null);
        return;
      }

      try {
        const teamMessages = await getTeamMessages(selectedTeamId, token);
        if (Array.isArray(teamMessages)) {
          const formattedMessages = teamMessages.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender_name || "User",
            message: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isOwn: msg.sender_id === user?.id,
            attachment_url: msg.attachment_url,
            attachment_type: msg.attachment_type
          }));
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Failed to fetch team messages:", error);
        // If we get an error (like group deleted), clear messages and selection
        setMessages([]);
        setSelectedTeamId(null);
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedTeamId, token, user?.id, groups])

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

  const getTeamName = () => {
    const team = groups.find((t) => t.id === selectedTeamId)
    return team?.name || "Team Chat"
  }

  const handleSend = async () => {
    if (message.trim() && selectedTeamId && token) {
      try {
        const res = await sendTeamMessage(selectedTeamId, message, token, null);

        // Optimistic update
        const newMessage = {
          id: Date.now(),
          sender: "You",
          message: message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOwn: true,
          attachment_url: res.attachment_url,
          attachment_type: res.attachment_type
        };
        setMessages(prev => [...prev, newMessage]);
        setMessage("");
      } catch (error) {
        console.error("Failed to send team message:", error);
      }
    }
  }

  const handleCreateGroup = async (groupData: { name: string; members: string[] }) => {
    if (!token) {
      console.error("No token available");
      return;
    }

    try {
      // Create group in backend
      const result = await createTeamGroup(groupData.name, groupData.members, token);
      console.log("Group created in backend:", result);

      // Refresh groups list
      const teamGroups = await getMyTeamGroups(token);
      if (Array.isArray(teamGroups)) {
        const formattedGroups = teamGroups.map((group: any) => ({
          id: group.id.toString(),
          name: group.name,
          members: group.member_count,
          avatar: group.name.substring(0, 2).toUpperCase()
        }));
        setGroups(formattedGroups);
      }

      // Select the newly created group
      if (result.groupId) {
        setSelectedTeamId(result.groupId.toString());
      }

      setIsCreateGroupModalOpen(false);
      console.log("Group created successfully!");
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group. Please try again.");
    }
  }

  const handleDeleteGroup = async () => {
    if (!selectedTeamId || !token) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this group? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      // Clear selection and messages immediately
      const groupToDelete = selectedTeamId;
      setSelectedTeamId(null);
      setMessages([]);
      setShowMenu(false);

      // Delete from backend
      await deleteTeamGroup(groupToDelete, token);

      // Refresh groups list
      const teamGroups = await getMyTeamGroups(token);
      if (Array.isArray(teamGroups)) {
        const formattedGroups = teamGroups.map((group: any) => ({
          id: group.id.toString(),
          name: group.name,
          members: group.member_count,
          avatar: group.name.substring(0, 2).toUpperCase()
        }));
        setGroups(formattedGroups);
      }

      alert("Group deleted successfully!");
    } catch (error: any) {
      console.error("Failed to delete group:", error);
      alert(error.message || "Failed to delete group. You may not have permission.");

      // Refresh groups list even on error to sync state
      try {
        const teamGroups = await getMyTeamGroups(token);
        if (Array.isArray(teamGroups)) {
          const formattedGroups = teamGroups.map((group: any) => ({
            id: group.id.toString(),
            name: group.name,
            members: group.member_count,
            avatar: group.name.substring(0, 2).toUpperCase()
          }));
          setGroups(formattedGroups);
        }
      } catch (refreshError) {
        console.error("Failed to refresh groups:", refreshError);
      }
    }
  }

  const handleOpenAddMember = async () => {
    console.log("Opening Add Member Modal");
    setShowMenu(false);
    if (!selectedTeamId || !token) return;

    // Open modal immediately
    setIsAddMemberModalOpen(true);

    try {
      // Fetch current members of the group
      const response = await fetch(`http://localhost:5000/team-groups/${selectedTeamId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const members = await response.json();
        if (Array.isArray(members)) {
          const memberIds = members.map((m: any) => m.id.toString());
          setCurrentMembers(memberIds);
        } else {
          setCurrentMembers([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch group members:", error);
      setCurrentMembers([]);
    }
  }

  const handleAddMember = async (userId: string) => {
    if (!selectedTeamId || !token) return;

    try {
      await addMemberToGroup(selectedTeamId, userId, token);

      // Refresh groups list to update member count
      const teamGroups = await getMyTeamGroups(token);
      if (Array.isArray(teamGroups)) {
        const formattedGroups = teamGroups.map((group: any) => ({
          id: group.id.toString(),
          name: group.name,
          members: group.member_count,
          avatar: group.name.substring(0, 2).toUpperCase()
        }));
        setGroups(formattedGroups);
      }

      setIsAddMemberModalOpen(false);
      alert("Member added successfully!");
    } catch (error: any) {
      console.error("Failed to add member:", error);
      alert(error.message || "Failed to add member to group.");
    }
  }

  const handleOpenManageMembers = async () => {
    console.log("Opening Manage Members Modal");
    setShowMenu(false);
    if (!selectedTeamId || !token) return;

    // Open modal immediately
    setIsManageMembersModalOpen(true);

    try {
      // Fetch current members of the group
      const response = await fetch(`http://localhost:5000/team-groups/${selectedTeamId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const members = await response.json();
        if (Array.isArray(members)) {
          setGroupMembersDetails(members);
        } else {
          setGroupMembersDetails([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch group members:", error);
      setGroupMembersDetails([]);
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeamId || !token) return;

    try {
      await removeMemberFromGroup(selectedTeamId, userId, token);

      // Refresh members list
      const response = await fetch(`http://localhost:5000/team-groups/${selectedTeamId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const members = await response.json();
        setGroupMembersDetails(members);
      }

      // Refresh groups list to update member count
      const teamGroups = await getMyTeamGroups(token);
      const formattedGroups = teamGroups.map((group: any) => ({
        id: group.id.toString(),
        name: group.name,
        members: group.member_count,
        avatar: group.name.substring(0, 2).toUpperCase()
      }));
      setGroups(formattedGroups);

      alert("Member removed successfully!");
    } catch (error: any) {
      console.error("Failed to remove member:", error);
      alert(error.message || "Failed to remove member from group.");
    }
  }

  const filteredTeams = groups.filter((team) => team.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div ref={containerRef} className="flex flex-1 h-full bg-background overflow-hidden">
      {/* Team List Sidebar */}
      <div style={{ width: dividerX }} className="border-r border-border flex flex-col bg-background flex-shrink-0">
        {/* Header with Create Group Button */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Team Chats</h2>
            <button
              onClick={() => {
                console.log("[v0] + button clicked, chatUsers available:", chatUsers)
                setIsCreateGroupModalOpen(true)
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1 transition-colors"
              title="Create group"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search groups"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-muted pl-9 pr-3 py-2 text-sm outline-none ring-ring/50 focus:ring-2 placeholder-muted-foreground"
            />
          </div>
        </div>

        {/* Team List */}
        <div className="flex-1 overflow-y-auto">
          {groups.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4 text-center">
              No team groups yet. Create a group to get started!
            </div>
          ) : (
            filteredTeams.map((team) => (
              <button
                key={team.id}
                onClick={async () => {
                  setSelectedTeamId(team.id);
                  if ((team.unread || 0) > 0 && token) {
                    try {
                      await markGroupRead(team.id, token);
                      setGroups(prev => prev.map(g => g.id === team.id ? { ...g, unread: 0 } : g));
                    } catch (e) {
                      console.error(e);
                    }
                  }
                }}
                className={`w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50 ${selectedTeamId === team.id ? "bg-muted" : ""
                  }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm">
                    {team.avatar}
                    {(team.unread || 0) > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-semibold border-2 border-background">
                        {team.unread}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">{team.name}</h3>
                      {team.timestamp && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {new Date(team.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {team.lastMessage ? team.lastMessage : `${team.members} members`}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
      />

      {/* Chat Window */}
      <div style={{ width: `calc(100% - ${dividerX}px - 4px)` }} className="flex flex-col bg-background h-full">
        {selectedTeamId ? (
          <>
            {/* Header */}
            <div className="border-b border-border bg-background px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-foreground">{getTeamName()}</h1>
                <p className="text-xs text-muted-foreground">
                  {groups.find(g => g.id === selectedTeamId)?.members} members
                </p>
              </div>
              <div className="flex gap-2 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical size={18} />
                </Button>

                {/* Dropdown Menu */}
                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                    {String(groups.find(g => g.id === selectedTeamId)?.createdBy) !== String(user?.id) && (
                      <button
                        onClick={handleOpenManageMembers}
                        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <Users size={16} />
                        View Group Members
                      </button>
                    )}

                    {String(groups.find(g => g.id === selectedTeamId)?.createdBy) === String(user?.id) && (
                      <>
                        <button
                          onClick={handleOpenAddMember}
                          className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add Member
                        </button>
                        <button
                          onClick={handleOpenManageMembers}
                          className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                        >
                          <Settings size={16} />
                          Manage Members
                        </button>
                        <button
                          onClick={handleDeleteGroup}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted transition-colors flex items-center gap-2"
                        >
                          <X size={16} />
                          Delete Group
                        </button>
                      </>
                    )}

                    <button
                      onClick={async () => {
                        if (!selectedTeamId || !token) return;
                        const group = groups.find(g => g.id === selectedTeamId);
                        const isCreator = String(group?.createdBy) === String(user?.id);

                        if (isCreator) {
                          const confirm = window.confirm("You are the Team Lead. To leave, you must delete the group or assign a new admin. Do you want to proceed?");
                          if (!confirm) return;

                          if (groups.find(g => g.id === selectedTeamId)?.members && groups.find(g => g.id === selectedTeamId)?.members! > 1) {
                            const newAdminId = prompt("Please enter the ID of the new Team Lead (you can find this in the 'View Group Members' list):");
                            if (!newAdminId) return;
                            try {
                              await leaveTeamGroup(selectedTeamId, newAdminId, token);
                              // Refresh
                              const teamGroups = await getMyTeamGroups(token);
                              if (Array.isArray(teamGroups)) {
                                const formattedGroups = teamGroups.map((group: any) => ({
                                  id: group.id.toString(),
                                  name: group.name,
                                  members: group.member_count,
                                  avatar: group.name.substring(0, 2).toUpperCase(),
                                  unread: group.unread_count,
                                  createdBy: group.created_by
                                }));
                                setGroups(formattedGroups);
                              }
                              setSelectedTeamId(null);
                              alert("Left group successfully.");
                            } catch (e: any) {
                              alert(e.message);
                            }
                          } else {
                            // Only member, just delete/leave behavior handled by backend
                            await handleDeleteGroup();
                          }
                        } else {
                          if (window.confirm("Leave this group?")) {
                            try {
                              await leaveTeamGroup(selectedTeamId, null, token);
                              const teamGroups = await getMyTeamGroups(token);
                              if (Array.isArray(teamGroups)) {
                                const formattedGroups = teamGroups.map((group: any) => ({
                                  id: group.id.toString(),
                                  name: group.name,
                                  members: group.member_count,
                                  avatar: group.name.substring(0, 2).toUpperCase(),
                                  unread: group.unread_count,
                                  createdBy: group.created_by
                                }));
                                setGroups(formattedGroups);
                              }
                              setSelectedTeamId(null);
                            } catch (e: any) {
                              alert(e.message);
                            }
                          }
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                      Leave Group
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl ${msg.attachment_type?.startsWith("image/") ? "p-1" : "px-4 py-2"} ${msg.isOwn ? "bg-[#588157] text-white" : "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      }`}
                  >
                    {!msg.isOwn && (
                      <p className="text-xs font-bold text-blue-500 mb-1">{msg.sender}</p>
                    )}
                    {msg.attachment_url && (
                      <div className="mb-2">
                        {msg.attachment_type?.startsWith("image/") ? (
                          <img
                            src={`http://localhost:5000${msg.attachment_url}`}
                            alt="Attachment"
                            className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: '200px' }}
                            onClick={() => setExpandedImage(`http://localhost:5000${msg.attachment_url}`)}
                          />
                        ) : (
                          <a
                            href={`http://localhost:5000${msg.attachment_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white underline"
                          >
                            <File size={16} />
                            Attachment
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
                {/* Emoji Picker Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Smile size={20} />
                  </button>

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
                  placeholder="Type a message..."
                  className="flex-1 rounded-full bg-muted px-5 py-2.5 text-sm outline-none ring-ring/50 focus:ring-2 placeholder-muted-foreground"
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a team chat to start messaging
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        availableUsers={availableUsers}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onAddMember={handleAddMember}
        availableUsers={availableUsers}
        currentMembers={currentMembers}
      />

      <ManageMembersModal
        isOpen={isManageMembersModalOpen}
        onClose={() => setIsManageMembersModalOpen(false)}
        onRemoveMember={handleRemoveMember}
        members={groupMembersDetails}
        currentUserId={user?.id?.toString() || ""}
        teamLeadId={groups.find(g => g.id === selectedTeamId)?.createdBy || ""}
      />

      <ImageModal
        imageUrl={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  )
}
