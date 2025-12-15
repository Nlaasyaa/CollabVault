"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    getAdminUsers, blockUserAdmin, unblockUserAdmin, getAdminFeedback,
    addAllowedDomain, verifyUserAdmin, deleteUserAdmin, replyToFeedback,
    getAdminAnalytics, getAnnouncements, createAnnouncement, deleteAnnouncement
} from "@/lib/apiClient"
import { Shield, Users, MessageSquare, Globe, Ban, CheckCircle, Trash2, UserCheck, UserX, ExternalLink, Activity, Megaphone, Bell } from "lucide-react"

export default function AdminPage() {
    const { user, token } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<any[]>([])
    const [feedback, setFeedback] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState<any>(null)
    const [announcements, setAnnouncements] = useState<any[]>([])

    // New Domain State
    const [newDomain, setNewDomain] = useState("")
    const [newDomainName, setNewDomainName] = useState("")

    // Announcement State
    const [announcementTitle, setAnnouncementTitle] = useState("")
    const [announcementContent, setAnnouncementContent] = useState("")
    const [isPinned, setIsPinned] = useState(false)

    // Feedback Reply State
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({})

    const fetchData = async () => {
        if (!token) return
        setLoading(true)
        try {
            const usersData = await getAdminUsers(token)
            setUsers(usersData)
            const feedbackData = await getAdminFeedback(token)
            setFeedback(feedbackData)
            const analyticsData = await getAdminAnalytics(token)
            setAnalytics(analyticsData)
            const announcementsData = await getAnnouncements(token)
            setAnnouncements(announcementsData)
        } catch (error) {
            console.error("Failed to fetch admin data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateAnnouncement = async () => {
        if (!token || !announcementTitle || !announcementContent) return
        try {
            await createAnnouncement({ title: announcementTitle, content: announcementContent, is_pinned: isPinned }, token)
            setAnnouncementTitle("")
            setAnnouncementContent("")
            setIsPinned(false)
            alert("Announcement posted!")
            fetchData()
        } catch (error) {
            alert("Failed to create announcement")
        }
    }

    const handleDeleteAnnouncement = async (id: number) => {
        if (!token || !confirm("Delete this announcement?")) return
        try {
            await deleteAnnouncement(id, token)
            fetchData()
        } catch (error) {
            alert("Failed to delete announcement")
        }
    }

    useEffect(() => {
        fetchData()
    }, [token])

    const handleBlockUser = async (userId: string, isBlocked: boolean) => {
        if (!token) return
        try {
            if (isBlocked) {
                await unblockUserAdmin(userId, token)
            } else {
                await blockUserAdmin(userId, token)
            }
            fetchData() // Refresh list
        } catch (error) {
            console.error("Failed to toggle block status:", error)
            alert("Action failed")
        }
    }

    const handleVerifyUser = async (userId: string, isVerified: boolean) => {
        if (!token) return
        try {
            await verifyUserAdmin(userId, !isVerified, token)
            fetchData()
        } catch (error) {
            alert("Failed to change verification status")
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!token || !confirm("Are you sure you want to PERMANENTLY delete this user? This cannot be undone.")) return
        try {
            await deleteUserAdmin(userId, token)
            fetchData()
        } catch (error) {
            alert("Failed to delete user")
        }
    }

    const handleReply = async (feedbackId: string) => {
        if (!token || !replyText[feedbackId]) return
        try {
            await replyToFeedback(feedbackId, replyText[feedbackId], token)
            setReplyText(prev => ({ ...prev, [feedbackId]: "" }))
            fetchData()
            alert("Reply sent!")
        } catch (error) {
            alert("Failed to send reply")
        }
    }

    const handleAddDomain = async () => {
        if (!token) return
        try {
            await addAllowedDomain(newDomain, newDomainName, token)
            setNewDomain("")
            setNewDomainName("")
            alert("Domain added successfully")
        } catch (error) {
            console.error("Failed to add domain:", error)
            alert("Failed to add domain")
        }
    }

    if (!user || (user as any).role !== 'admin') {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to view this page.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 h-full p-4 md:p-8 overflow-y-auto bg-background">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users, moderation, and platform settings.</p>
                </div>
                <Badge variant="outline" className="px-4 py-1 border-primary/50 text-primary">
                    <Shield className="w-3 h-3 mr-2" />
                    Super Admin
                </Badge>
            </div>

            {/* Analytics Section */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Posts</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.totalPosts}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Feedback Items</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.totalFeedback}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Allowed Domains</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics.totalDomains}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">
                        <Users className="w-4 h-4 mr-2" />
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="announcements">
                        <Megaphone className="w-4 h-4 mr-2" />
                        Announcements
                    </TabsTrigger>
                    <TabsTrigger value="feedback">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Feedback
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Globe className="w-4 h-4 mr-2" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* ANNOUNCEMENTS TAB */}
                <TabsContent value="announcements" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Announcement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Title"
                                    value={announcementTitle}
                                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                                />
                                <Textarea
                                    placeholder="Content"
                                    value={announcementContent}
                                    onChange={(e) => setAnnouncementContent(e.target.value)}
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="pinned"
                                        checked={isPinned}
                                        onChange={(e) => setIsPinned(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="pinned" className="text-sm">Pin this announcement</label>
                                </div>
                                <Button onClick={handleCreateAnnouncement}>Post Announcement</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Announcements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {announcements.map((a: any) => (
                                    <div key={a.id} className="p-4 border rounded-lg flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{a.title}</h3>
                                                {a.is_pinned === 1 && <Badge>Pinned</Badge>}
                                            </div>
                                            <p className="text-sm text-foreground/80 mt-1">{a.content}</p>
                                            <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteAnnouncement(a.id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* USERS TAB */}
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registered Users ({users.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {users.map((u) => (
                                    <div key={u.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                                {u.display_name?.[0] || u.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold flex items-center gap-2 flex-wrap">
                                                    {u.display_name || "Unknown User"}
                                                    {u.role === 'admin' && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                                                    {u.is_blocked === 1 && <Badge variant="destructive" className="text-xs">Blocked</Badge>}
                                                    {!u.email_verified && <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500">Unverified</Badge>}
                                                </div>
                                                <div className="text-sm text-muted-foreground break-all">{u.email} • {u.college_domain}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Verify Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title={u.email_verified ? "Unverify User" : "Manually Verify User"}
                                                onClick={() => handleVerifyUser(u.id, u.email_verified)}
                                            >
                                                {u.email_verified ? <UserX className="w-4 h-4 text-orange-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                                            </Button>

                                            {/* Block Button */}
                                            {u.role !== 'admin' && (
                                                <Button
                                                    variant={u.is_blocked ? "outline" : "destructive"}
                                                    size="sm"
                                                    onClick={() => handleBlockUser(u.id, u.is_blocked)}
                                                >
                                                    {u.is_blocked ? (
                                                        <><CheckCircle className="w-4 h-4 mr-2" /> Unblock</>
                                                    ) : (
                                                        <><Ban className="w-4 h-4 mr-2" /> Block</>
                                                    )}
                                                </Button>
                                            )}

                                            {/* View Profile link */}
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/profile/${u.id}`)}>
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                View Profile
                                            </Button>

                                            {/* Delete Button */}
                                            {u.role !== 'admin' && (
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteUser(u.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FEEDBACK TAB */}
                <TabsContent value="feedback" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Feedback ({feedback.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {feedback.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">No feedback submitted yet.</p>
                                ) : feedback.map((item: any) => (
                                    <div key={item.id} className="p-4 border rounded-lg space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">{item.subject}</h3>
                                                <div className="text-sm text-muted-foreground flex gap-2 items-center">
                                                    <span>By: {item.display_name} ({item.email})</span>
                                                    <span>•</span>
                                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            {item.rating && <Badge variant="outline">{item.rating}/5 Stars</Badge>}
                                        </div>
                                        <p className="text-sm text-foreground/90 bg-muted/30 p-3 rounded-md">{item.message}</p>

                                        {/* Reply Section */}
                                        <div className="pt-2 border-t mt-2">
                                            {item.admin_reply ? (
                                                <div className="bg-primary/5 p-3 rounded text-sm">
                                                    <span className="font-semibold text-primary block mb-1">Admin Reply:</span>
                                                    {item.admin_reply}
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Replied on {new Date(item.replied_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Write a reply..."
                                                        value={replyText[item.id] || ""}
                                                        onChange={(e) => setReplyText({ ...replyText, [item.id]: e.target.value })}
                                                    />
                                                    <Button size="sm" onClick={() => handleReply(item.id)}>Reply</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Allowed College Domains</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-6">
                                <Input
                                    placeholder="@college.edu"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    className="max-w-xs"
                                />
                                <Input
                                    placeholder="College Name"
                                    value={newDomainName}
                                    onChange={(e) => setNewDomainName(e.target.value)}
                                    className="max-w-xs"
                                />
                                <Button onClick={handleAddDomain}>Add Domain</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
