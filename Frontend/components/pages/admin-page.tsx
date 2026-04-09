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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    getAdminUsers, blockUserAdmin, unblockUserAdmin, getAdminFeedback,
    addAllowedDomain, removeAllowedDomain, getAllowedDomains, verifyUserAdmin, deleteUserAdmin, replyToFeedback,
    getAdminAnalytics, getAnnouncements, createAnnouncement, deleteAnnouncement
} from "@/lib/apiClient"
import { 
    Shield, Users, MessageSquare, Globe, Ban, CheckCircle, Trash2, 
    UserCheck, UserX, ExternalLink, Activity, Megaphone, Bell,
    CheckCircle2, XCircle, Lock, Unlock
} from "lucide-react"

export default function AdminPage() {
    const { user, token } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<any[]>([])
    const [feedback, setFeedback] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState<any>(null)
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [allowedDomains, setAllowedDomains] = useState<any[]>([])

    // States
    const [newDomain, setNewDomain] = useState("")
    const [newDomainName, setNewDomainName] = useState("")
    const [announcementTitle, setAnnouncementTitle] = useState("")
    const [announcementContent, setAnnouncementContent] = useState("")
    const [isPinned, setIsPinned] = useState(false)
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({})

    const fetchData = async () => {
        if (!token) return
        setLoading(true)
        try {
            const [usersData, feedbackData, analyticsData, announcementsData, domainsData] = await Promise.all([
                getAdminUsers(token),
                getAdminFeedback(token),
                getAdminAnalytics(token),
                getAnnouncements(token),
                getAllowedDomains(token)
            ])
            setUsers(usersData)
            setFeedback(feedbackData)
            setAnalytics(analyticsData)
            setAnnouncements(announcementsData)
            setAllowedDomains(domainsData)
        } catch (error) {
            console.error("Failed to fetch admin data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (token) fetchData()
    }, [token])

    const handleCreateAnnouncement = async () => {
        if (!token || !announcementTitle || !announcementContent) return
        try {
            await createAnnouncement({ title: announcementTitle, content: announcementContent, is_pinned: isPinned }, token)
            setAnnouncementTitle("")
            setAnnouncementContent("")
            setIsPinned(false)
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

    const handleBlockUser = async (userId: string, isBlocked: boolean) => {
        if (!token) return
        try {
            if (isBlocked) await unblockUserAdmin(userId, token)
            else await blockUserAdmin(userId, token)
            fetchData()
        } catch (error) {
            alert("Action failed")
        }
    }

    const handleVerifyUser = async (userId: string, isVerified: boolean) => {
        if (!token) return
        try {
            await verifyUserAdmin(userId, !isVerified, token)
            fetchData()
        } catch (error) {
            alert("Action failed")
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!token || !confirm("Permanently delete this user?")) return
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
            fetchData()
        } catch (error) {
            alert("Failed to add domain")
        }
    }

    const handleRemoveDomain = async (id: number) => {
        if (!token || !confirm("Remove this domain?")) return
        try {
            await removeAllowedDomain(id, token)
            fetchData()
        } catch (error) {
            alert("Failed to remove domain")
        }
    }

    if (!user || (user as any).role !== 'admin') {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to view this page.</p>
                </div>
            </div>
        )
    }

    if (loading) return <div className="p-8">Loading dashboard...</div>

    return (
        <div className="flex-1 h-full p-4 md:p-8 overflow-y-auto bg-background">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users, feedback, and platform settings.</p>
                </div>
                <Badge variant="outline" className="px-4 py-1 border-primary/50 text-primary">
                    <Shield className="w-3 h-3 mr-2" />
                    Super Admin
                </Badge>
            </div>

            {/* DASHBOARD ANALYTICS */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{analytics.totalUsers}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Posts</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{analytics.totalPosts}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Feedback Items</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{analytics.totalFeedback}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Allowed Domains</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{analytics.totalDomains}</div></CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">
                        <Users className="w-4 h-4 mr-2" /> Users
                    </TabsTrigger>
                    <TabsTrigger value="announcements">
                        <Megaphone className="w-4 h-4 mr-2" /> Announcements
                    </TabsTrigger>
                    <TabsTrigger value="feedback">
                        <MessageSquare className="w-4 h-4 mr-2" /> Feedback
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Globe className="w-4 h-4 mr-2" /> Settings
                    </TabsTrigger>
                </TabsList>

                {/* USERS TAB (TABLE UI) */}
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registered Users ({users.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>College</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{u.display_name || 'No Name'}</span>
                                                    <span className="text-sm text-muted-foreground">{u.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{u.college_domain || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {u.email_verified ? (
                                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Verified</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Unverified</Badge>
                                                    )}
                                                    {u.is_blocked ? <Badge variant="destructive">Blocked</Badge> : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {/* Verify */}
                                                    <Button variant="ghost" size="icon" onClick={() => handleVerifyUser(u.id, u.email_verified)}>
                                                        {u.email_verified ? <XCircle className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                    </Button>
                                                    {/* Block */}
                                                    {u.role !== 'admin' && (
                                                        <Button variant="ghost" size="icon" onClick={() => handleBlockUser(u.id, u.is_blocked)}>
                                                            {u.is_blocked ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-red-500" />}
                                                        </Button>
                                                    )}
                                                    {/* Profile */}
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/profile/${u.id}`)}>
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                    {/* Delete */}
                                                    {u.role !== 'admin' && (
                                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteUser(u.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ANNOUNCEMENTS TAB */}
                <TabsContent value="announcements" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Create Announcement</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Input placeholder="Title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} />
                                <Textarea placeholder="Content" value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} />
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="pinned" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="w-4 h-4" />
                                    <label htmlFor="pinned" className="text-sm">Pin this announcement</label>
                                </div>
                                <Button onClick={handleCreateAnnouncement}>Post Announcement</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="grid gap-4">
                        {announcements.map((a: any) => (
                            <Card key={a.id}>
                                <CardContent className="pt-6 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{a.title}</h3>
                                            {a.is_pinned === 1 && <Badge>Pinned</Badge>}
                                        </div>
                                        <p className="text-sm text-foreground/80 mt-1">{a.content}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteAnnouncement(a.id)}><Trash2 size={16} /></Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* FEEDBACK TAB */}
                <TabsContent value="feedback" className="space-y-4">
                    <div className="grid gap-4">
                        {feedback.length === 0 ? <p className="text-center py-8">No feedback yet.</p> : feedback.map((item: any) => (
                            <Card key={item.id}>
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg">{item.subject}</h3>
                                            <p className="text-xs text-muted-foreground">{item.display_name} • {new Date(item.created_at).toLocaleDateString()}</p>
                                        </div>
                                        {item.rating && <Badge variant="outline">{item.rating}/5 Stars</Badge>}
                                    </div>
                                    <p className="text-sm bg-muted/30 p-3 rounded-md">{item.message}</p>
                                    <div className="pt-2 border-t mt-2">
                                        {item.admin_reply ? (
                                            <div className="bg-primary/5 p-3 rounded text-sm">
                                                <span className="font-semibold text-primary block mb-1">Reply:</span>{item.admin_reply}
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Input placeholder="Reply..." value={replyText[item.id] || ""} onChange={(e) => setReplyText({ ...replyText, [item.id]: e.target.value })} />
                                                <Button size="sm" onClick={() => handleReply(item.id)}>Reply</Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>College Domains</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-6">
                                <Input placeholder="@college.edu" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} />
                                <Input placeholder="College Name" value={newDomainName} onChange={(e) => setNewDomainName(e.target.value)} />
                                <Button onClick={handleAddDomain}>Add</Button>
                            </div>
                            <div className="space-y-2">
                                {allowedDomains.map((d) => (
                                    <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div><p className="font-medium">{d.domain}</p><p className="text-xs text-muted-foreground">{d.display_name}</p></div>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveDomain(d.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
