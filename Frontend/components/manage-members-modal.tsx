"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

interface ManageMembersModalProps {
    isOpen: boolean
    onClose: () => void
    onRemoveMember: (userId: string) => void
    members: Array<{ id: string; display_name: string; avatar?: string }>
    currentUserId: string
    teamLeadId: string
}

export default function ManageMembersModal({
    isOpen,
    onClose,
    onRemoveMember,
    members,
    currentUserId,
    teamLeadId,
}: ManageMembersModalProps) {

    // Ensure members is a valid array
    const safeMembers = Array.isArray(members) ? members : []
    const isAdmin = currentUserId === teamLeadId;

    console.log("ManageMembersModal rendered. isOpen:", isOpen);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md z-[100]">
                <DialogHeader>
                    <DialogTitle>{isAdmin ? "Manage Members" : "Group Members"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {safeMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No members found.
                        </p>
                    ) : (
                        <div className="max-h-80 overflow-y-auto space-y-2 border border-border rounded-lg p-2">
                            {safeMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-sm">
                                            {member.display_name ? member.display_name.substring(0, 2).toUpperCase() : "??"}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                                {member.display_name}
                                                <span className="text-xs text-muted-foreground hidden group-hover:inline-block">#{member.id}</span>
                                                {member.id.toString() === currentUserId && "(You)"}
                                                {member.id.toString() === teamLeadId && (
                                                    <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200">
                                                        Team Lead
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {isAdmin && member.id.toString() !== currentUserId && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to remove ${member.display_name}?`)) {
                                                    onRemoveMember(member.id.toString())
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-100/50"
                                            title="Remove member"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={onClose}
                        variant="outline"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
