"use client"

import { useState } from "react"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface User {
  id: string
  name: string
  avatar: string
}

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGroup: (groupData: { name: string; members: string[] }) => void
  availableUsers: User[]
}

export default function CreateGroupModal({ isOpen, onClose, onCreateGroup, availableUsers }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const handleToggleMember = (userId: string) => {
    setSelectedMembers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      onCreateGroup({
        name: groupName,
        members: selectedMembers,
      })
      setGroupName("")
      setSelectedMembers([])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-background border border-border p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Create Group</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        {/* Group Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Group Name</label>
          <input
            type="text"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Members Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Members ({selectedMembers.length})
          </label>
          <div className="border border-border rounded-md bg-background max-h-64 overflow-y-auto">
            {availableUsers.length > 0 ? (
              availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleToggleMember(user.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0">
                    {user.avatar}
                  </div>

                  {/* Name */}
                  <span className="flex-1 text-sm text-foreground">{user.name}</span>

                  {/* Checkbox */}
                  <div
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedMembers.includes(user.id) ? "bg-blue-600 border-blue-600" : "border-border bg-background"
                      }`}
                  >
                    {selectedMembers.includes(user.id) && <Check size={14} className="text-white" />}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                No available users to add to group
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Group
          </Button>
        </div>
      </Card>
    </div>
  )
}
