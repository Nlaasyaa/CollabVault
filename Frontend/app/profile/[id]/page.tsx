"use client"

import { useEffect, useState, use } from "react"
import { getProfileById } from "@/lib/apiClient"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, MapPin, Calendar, BookOpen, User, Briefcase, ArrowLeft } from "lucide-react"

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { user } = useAuth()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfileById(id)
                setProfile(data)
            } catch (err) {
                setError("Failed to load profile")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [id])

    if (loading) {
        return (
            <div className="container mx-auto py-10 px-4 max-w-4xl">
                <Card>
                    <CardHeader className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="container mx-auto py-10 px-4 text-center">
                <Card className="max-w-md mx-auto p-6">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Profile Not Found</h2>
                    <p className="text-muted-foreground">The user you are looking for does not exist or an error occurred.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {(user as any)?.role === 'admin' && (
                    <Button
                        variant="outline"
                        onClick={() => router.push('/?page=admin')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Admin Dashboard
                    </Button>
                )}

                {/* Header Card */}
                <Card className="border-none shadow-md overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row items-end -mt-12 mb-6 gap-6">
                            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`} />
                                <AvatarFallback className="text-4xl">{profile.display_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 pb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{profile.display_name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-sm font-normal">
                                        {profile.role === 'admin' ? 'Administrator' : 'Student'}
                                    </Badge>
                                    {profile.open_for && JSON.parse(profile.open_for).length > 0 && (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
                                            Open to Work
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                            {profile.college && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-gray-400" />
                                    <span>{profile.college}</span>
                                </div>
                            )}
                            {profile.branch && (
                                <div className="flex items-center gap-2">
                                    <BookOpen size={18} className="text-gray-400" />
                                    <span>{profile.branch} • {profile.year}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Mail size={18} className="text-gray-400" />
                                <span>{profile.email}</span>
                            </div>
                            {profile.phone_number && (
                                <div className="flex items-center gap-2">
                                    <Phone size={18} className="text-gray-400" />
                                    <span>{profile.phone_number}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Bio */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User size={20} />
                                    About
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {profile.bio || "No bio provided."}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase size={20} />
                                    Skills
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills && profile.skills.length > 0 ? (
                                        profile.skills.map((skill: string) => (
                                            <Badge key={skill} variant="secondary" className="px-3 py-1">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No skills listed.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Open For */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Open For</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    {profile.open_for && JSON.parse(profile.open_for).length > 0 ? (
                                        JSON.parse(profile.open_for).map((item: string) => (
                                            <div key={item} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                {item}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm">Not specified.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interests */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Interests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests && profile.interests.length > 0 ? (
                                        profile.interests.map((interest: string) => (
                                            <Badge key={interest} variant="outline">
                                                {interest}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No interests listed.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Joined</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar size={16} />
                                <span>
                                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric'
                                    }) : 'Unknown'}
                                </span>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
