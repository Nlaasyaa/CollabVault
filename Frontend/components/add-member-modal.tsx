"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

interface AddMemberModalProps {
    isOpen: boolean
    onClose: () => void
    onAddMember: (userId: string) => void
    availableUsers: Array<{ id: string; name: string; avatar: string }>
    currentMembers: string[]
}

export default function AddMemberModal({
    isOpen,
    onClose,
    onAddMember,
    availableUsers,
    currentMembers,
}: AddMemberModalProps) {
    const [selectedUserId, setSelectedUserId] = useState<string>("")

    // Ensure arrays are valid to prevent crashes
    const safeAvailableUsers = Array.isArray(availableUsers) ? availableUsers : []
    const safeCurrentMembers = Array.isArray(currentMembers) ? currentMembers : []

    console.log("AddMemberModal rendered. isOpen:", isOpen);

    const usersToAdd = safeAvailableUsers.filter(
        (user) => !safeCurrentMembers.includes(user.id)
    )

    const handleSubmit = () => {
        if (selectedUserId) {
            onAddMember(selectedUserId)
            setSelectedUserId("")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md z-[100]">
                <DialogHeader>
                    <DialogTitle>Add Member</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {usersToAdd.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            All your connections are already members of this group.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Select a member to add:
                            </label>
                            <div className="max-h-60 overflow-y-auto space-y-2 border border-border rounded-lg p-2">
                                {usersToAdd.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedUserId(user.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedUserId === user.id
                                                ? "bg-blue-100 border-2 border-blue-600"
                                                : "bg-muted hover:bg-muted/70 border-2 border-transparent"
                                            }`}
                                    >
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-sm">
                                            {user.avatar}
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {user.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!selectedUserId}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Add Member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
