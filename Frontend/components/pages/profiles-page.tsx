"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, BookOpen, Briefcase, Mail, Phone, Users, UserPlus, Clock, Check } from 'lucide-react'
import { useAuth } from "@/context/auth-context"
import { getAllProfiles, getBrowseProfiles, createConnection } from "@/lib/apiClient"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  displayName: string
  college: string
  branch: string
  year: string
  email?: string
  bio: string
  openFor: string[]
  skills: string[]
  interests: string[]
  phoneNumber?: string
  connectionCount: number
  connectionStatus: 'CONNECTED' | 'SENT' | 'RECEIVED' | 'NONE'
}

interface ProfileDetailProps {
  profile: UserProfile
  onBack: () => void
  onChat: (userId: string) => void
  onConnect: (userId: string) => void
}

function ProfileDetail({ profile, onBack, onChat, onConnect }: ProfileDetailProps) {
  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            {profile.displayName}
            <Badge variant="secondary" className="text-sm font-normal">
              <Users size={14} className="mr-1" /> {profile.connectionCount} connections
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Profile • {profile.college}</p>
        </div>
        <Button onClick={onBack} variant="outline">
          Back to List
        </Button>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Card */}
          <Card className="border border-border bg-card rounded-2xl overflow-hidden">
            {/* Background */}
            <div className="h-32 bg-gradient-to-br from-primary/30 to-primary/10" />

            {/* Content */}
            <div className="px-8 py-8 space-y-6">
              {/* Name and Basic Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-foreground">{profile.displayName}</h2>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {profile.branch} • {profile.year}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{profile.college}</p>
                  </div>
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  )}
                  {profile.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{profile.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="border-t border-border pt-6">
                <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
              </div>

              {/* Open For */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Open for</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.openFor || []).map((item: string) => (
                    <Badge key={item} variant="secondary" className="text-sm px-4 py-2">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).map((skill: string) => (
                    <Badge key={skill} variant="outline" className="text-sm px-4 py-2">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.interests || []).map((interest: string) => (
                    <Badge key={interest} variant="outline" className="text-sm px-4 py-2">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                {/* Connection Actions */}
                {profile.connectionStatus === 'CONNECTED' && (
                  <Button
                    onClick={() => onChat(profile.id)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={18} />
                    Start 1 on 1 Chat
                  </Button>
                )}

                {profile.connectionStatus === 'SENT' && (
                  <Button disabled className="w-full bg-muted text-muted-foreground">
                    <Clock size={16} className="mr-2" /> Request Pending
                  </Button>
                )}

                {(profile.connectionStatus === 'NONE' || profile.connectionStatus === 'RECEIVED') && (
                  <Button
                    onClick={() => onConnect(profile.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} />
                    {profile.connectionStatus === 'RECEIVED' ? "Accept Request" : "Connect"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ProfilesPage({ onOpenChat }: { onOpenChat?: (userId: string) => void }) {
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, token } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true)
        // Use getBrowseProfiles if token is available to get connection info
        let data;
        if (token) {
          data = await getBrowseProfiles(token);
        } else {
          data = await getAllProfiles();
        }

        // Map backend data to frontend format
        const mappedProfiles = data
          .filter((p: any) => p.user_id !== user?.id) // Filter out current user (backend does this too for browse but safe to keep)
          .map((p: any) => {
            let openFor: string[] = [];
            try {
              openFor = p.open_for ? JSON.parse(p.open_for) : []
            } catch (e) {
              openFor = p.open_for ? [p.open_for] : []
            }

            // Mapping skills and interests from backend response
            const skills = p.skills || [];
            const interests = p.interests || [];

            return {
              id: p.user_id,
              displayName: p.display_name || "User",
              college: p.college || "Unknown College",
              branch: p.branch || "Unknown Branch",
              year: p.year || "Unknown Year",
              bio: p.bio || "No bio available",
              openFor,
              skills,
              interests,
              email: p.email,
              phoneNumber: p.phone_number,
              connectionCount: p.connection_count || 0,
              connectionStatus: p.connection_status || 'NONE'
            }
          })

        setAllProfiles(mappedProfiles)
      } catch (error) {
        console.error("Failed to fetch profiles:", error)
        toast({
          title: "Error",
          description: "Failed to load profiles.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user && token) {
      fetchProfiles()
    }
  }, [user, token, toast])

  const handleConnect = async (targetId: string) => {
    if (!token) return;
    try {
      const result = await createConnection(targetId, token);

      setAllProfiles(prev => prev.map(p => {
        if (p.id === targetId) {
          return {
            ...p,
            connectionStatus: result.isMutual ? 'CONNECTED' : 'SENT'
          }
        }
        return p;
      }));

      toast({
        title: result.isMutual ? "Connected!" : "Request Sent",
        description: result.isMutual ? "You are now connected." : "Connection request sent successfully.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect.",
        variant: "destructive",
      })
    }
  }

  const selectedProfile = selectedProfileId
    ? allProfiles.find((p) => p.id === selectedProfileId)
    : null

  if (selectedProfile) {
    return (
      <ProfileDetail
        profile={selectedProfile}
        onBack={() => setSelectedProfileId(null)}
        onChat={(userId) => {
          if (onOpenChat) {
            onOpenChat(userId)
          }
          setSelectedProfileId(null)
        }}
        onConnect={handleConnect}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Header */}
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-3xl font-bold text-foreground">Community Profiles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and connect with talented developers in your network
        </p>
      </div>

      {/* Profiles Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {allProfiles.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">No profiles available yet</p>
              <p className="text-sm text-muted-foreground mt-2">Check back when more users join!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {allProfiles.map((profile) => (
              <Card
                key={profile.id}
                className="border border-border bg-card rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group flex flex-col"
                onClick={() => setSelectedProfileId(profile.id)}
              >


                {/* Content */}
                <div className="px-6 py-6 space-y-4 flex-1 flex flex-col">
                  {/* Name and Details */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-foreground">{profile.displayName}</h3>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        <Users size={10} className="mr-1" /> {profile.connectionCount}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {profile.branch} • {profile.year}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{profile.college}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-foreground line-clamp-2">{profile.bio}</p>

                  {/* Open For Badge */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Open for</p>
                    <div className="flex flex-wrap gap-1">
                      {(profile.openFor || []).length > 0 ? (
                        profile.openFor.map((item: string) => (
                          <Badge key={item} variant="secondary" className="text-xs px-2 py-1">
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">Not specified</span>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {(profile.skills || []).length > 0 ? (
                        profile.skills.slice(0, 3).map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-xs px-2 py-1">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Push actions to bottom */}
                  <div className="mt-auto pt-4">
                    {profile.connectionStatus === 'CONNECTED' && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onOpenChat) onOpenChat(profile.id)
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-300 text-gray-500 text-sm py-2 flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={16} />
                        Chat
                      </Button>
                    )}

                    {profile.connectionStatus === 'SENT' && (
                      <Button disabled className="w-full bg-muted text-muted-foreground text-sm py-2">
                        <Clock size={16} className="mr-2" /> Pending
                      </Button>
                    )}

                    {(profile.connectionStatus === 'NONE' || profile.connectionStatus === 'RECEIVED') && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(profile.id);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 flex items-center justify-center gap-2"
                      >
                        <UserPlus size={16} />
                        {profile.connectionStatus === 'RECEIVED' ? "Accept" : "Connect"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
