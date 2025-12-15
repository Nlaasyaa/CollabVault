"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ViewProfileModalProps {
    isOpen: boolean
    onClose: () => void
    profile: any
}

export default function ViewProfileModal({ isOpen, onClose, profile }: ViewProfileModalProps) {
    if (!profile) return null;
    // Ensure open_for is always an array for safe iteration
    const openForArray: string[] = Array.isArray(profile.open_for)
        ? profile.open_for
        : profile.open_for
            ? [profile.open_for]
            : [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Profile Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex flex-col items-center text-center">
                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                            {profile.display_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold">{profile.display_name}</h2>
                        <p className="text-muted-foreground">{profile.branch} • {profile.year}</p>
                        <p className="text-sm text-muted-foreground mt-1">{profile.college}</p>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Bio</h3>
                            <p className="text-sm">{profile.bio}</p>
                        </div>
                    )}

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill: string) => (
                                    <span key={skill} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interests */}
                    {profile.interests && profile.interests.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.interests.map((interest: string) => (
                                    <span key={interest} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Open For */}
                    {openForArray.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Open For</h3>
                            <div className="flex flex-wrap gap-2">
                                {openForArray.map((item: string) => (
                                    <span key={item} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
