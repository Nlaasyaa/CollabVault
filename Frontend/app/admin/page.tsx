"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Users,
    Settings,
    MessageSquare,
    Bell,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Trash2,
    Lock,
    Unlock
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
    id: number
    email: string
    display_name: string
    role: string
    is_blocked: number
    email_verified: number
    created_at: string
    college_domain: string
}

interface Domain {
    id: number
    domain: string
    display_name: string
    is_active: number
}

export default function AdminDashboard() {
    const { user, token } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [domains, setDomains] = useState<Domain[]>([])
    const [newDomain, setNewDomain] = useState("")
    const [newDomainName, setNewDomainName] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) return;

        // Check if user is admin
        if (user && user.role !== 'admin') {
            router.push('/')
            return
        }

        fetchUsers()
        fetchDomains()
    }, [token, user])

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch users")
        } finally {
            setLoading(false)
        }
    }

    const fetchDomains = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/allowed-domains`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setDomains(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleVerifyUser = async (userId: number, currentStatus: number) => {
        try {
            const endpoint = currentStatus ? 'unverify' : 'verify'
            const res = await fetch(`${API_URL}/admin/users/${userId}/${endpoint}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                toast.success(`User ${currentStatus ? 'unverified' : 'verified'} successfully`)
                fetchUsers()
            }
        } catch (error) {
            toast.error("Action failed")
        }
    }

    const handleBlockUser = async (userId: number, currentStatus: number) => {
        try {
            const endpoint = currentStatus ? 'unblock' : 'block'
            const res = await fetch(`${API_URL}/admin/users/${userId}/${endpoint}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                toast.success(`User ${currentStatus ? 'unblocked' : 'blocked'} successfully`)
                fetchUsers()
            }
        } catch (error) {
            toast.error("Action failed")
        }
    }

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch(`${API_URL}/admin/allowed-domains`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ domain: newDomain, display_name: newDomainName })
            })

            if (res.ok) {
                toast.success("Domain added successfully")
                setNewDomain("")
                setNewDomainName("")
                fetchDomains()
            } else {
                const data = await res.json()
                toast.error(data.error || "Failed to add domain")
            }
        } catch (error) {
            toast.error("Failed to add domain")
        }
    }

    const handleDeleteDomain = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/admin/allowed-domains/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                toast.success("Domain removed")
                fetchDomains()
            }
        } catch (error) {
            toast.error("Failed to remove domain")
        }
    }

    if (loading) return <div className="p-8">Loading admin dashboard...</div>

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users, domains, and platform settings.</p>
                </div>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> Users
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Registered Users ({users.length})</h2>
                            </div>
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
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.display_name || 'No Name'}</span>
                                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.college_domain || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {user.email_verified ? (
                                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Verified</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Unverified</Badge>
                                                    )}
                                                    {user.is_blocked ? (
                                                        <Badge variant="destructive">Blocked</Badge>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleVerifyUser(user.id, user.email_verified)}
                                                        title={user.email_verified ? "Unverify User" : "Verify User"}
                                                    >
                                                        {user.email_verified ? (
                                                            <XCircle className="w-4 h-4 text-amber-500" />
                                                        ) : (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        )}
                                                    </Button>

                                                    {user.role !== 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleBlockUser(user.id, user.is_blocked)}
                                                            title={user.is_blocked ? "Unblock User" : "Block User"}
                                                        >
                                                            {user.is_blocked ? (
                                                                <Unlock className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <Lock className="w-4 h-4 text-red-500" />
                                                            )}
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

                <TabsContent value="settings" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold mb-4">Allowed Domains</h3>
                                <form onSubmit={handleAddDomain} className="space-y-4 mb-6">
                                    <div className="grid gap-2">
                                        <input
                                            type="text"
                                            placeholder="Domain (e.g., mit.edu)"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                            value={newDomain}
                                            onChange={(e) => setNewDomain(e.target.value)}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="School Name (Optional)"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                            value={newDomainName}
                                            onChange={(e) => setNewDomainName(e.target.value)}
                                        />
                                        <Button type="submit">Add Domain</Button>
                                    </div>
                                </form>

                                <div className="space-y-2">
                                    {domains.map((domain) => (
                                        <div key={domain.id} className="flex items-center justify-between p-2 border rounded-md">
                                            <div>
                                                <p className="font-medium">{domain.domain}</p>
                                                <p className="text-xs text-muted-foreground">{domain.display_name}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeleteDomain(domain.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
