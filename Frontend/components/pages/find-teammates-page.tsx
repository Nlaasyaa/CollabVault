"use client"

import { Card } from "@/components/ui/card"
import { X, Heart, Briefcase, BookOpen, Star, Scale, UserPlus, Users, UserMinus, Check } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/auth-context"
import { createConnection, getRecommendations, getPendingRequests, acceptRequest, rejectRequest, getMyConnections, removeConnection } from "@/lib/apiClient"
import Draggable from 'react-draggable'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function FindTeammatesPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user, token } = useAuth()

  // New State for Features
  const [shortlisted, setShortlisted] = useState<any[]>([])
  const [compareSlots, setCompareSlots] = useState<{ slot1: any | null, slot2: any | null }>({ slot1: null, slot2: null })
  const [showCompareModal, setShowCompareModal] = useState(false)

  // Connection Management State
  const [requests, setRequests] = useState<any[]>([])
  const [myConnections, setMyConnections] = useState<any[]>([])

  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef(null)

  const refreshData = async () => {
    if (!token) return;
    try {
      const [recs, reqs, conns] = await Promise.all([
        getRecommendations(token),
        getPendingRequests(token),
        getMyConnections(token)
      ]);
      setProfiles(recs);
      setRequests(reqs);
      setMyConnections(conns);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && token) {
      setLoading(true);
      refreshData();
    }
  }, [user?.id, token])

  const handleSkip = () => {
    setDragPosition({ x: 0, y: 0 })
    if (currentIndex + 1 < profiles.length) {
      setCurrentIndex(prev => prev + 1);
    }
  }

  const handleConnect = async (targetProfile = profiles[currentIndex]) => {
    if (targetProfile && token) {
      try {
        const result = await createConnection(targetProfile.user_id, token);
        if (result.isMutual) {
          alert(`🎉 It's a match! You and ${targetProfile.display_name} are now connected! Go to Team Chats to message them.`);
          refreshData(); // Refresh to update connections list
        } else {
          alert(`Request sent to ${targetProfile.display_name}!`);
        }
      } catch (error) {
        console.error("Failed to create connection:", error);
        alert("Failed to connect. Please try again.");
      }
    }
    if (targetProfile === profiles[currentIndex] || targetProfile?.user_id === profiles[currentIndex]?.user_id) {
      handleSkip()
    }
  }

  // --- Connection Management Handlers ---
  const handleAccept = async (targetId: number) => {
    try {
      await acceptRequest(targetId, token);
      alert("Request Accepted!");
      refreshData();
    } catch (e) { console.error(e); alert("Failed to accept"); }
  }

  const handleReject = async (targetId: number) => {
    try {
      await rejectRequest(targetId, token);
      setRequests(prev => prev.filter(r => r.user_id !== targetId));
    } catch (e) { console.error(e); alert("Failed to reject"); }
  }

  const handleRemoveConnection = async (targetId: number) => {
    if (!confirm("Are you sure you want to remove this connection? You can send a request again later.")) return;
    try {
      await removeConnection(targetId, token);
      setMyConnections(prev => prev.filter(c => c.user_id !== targetId));
      // Optionally refresh recommendations to see them again immediately
      // refreshData(); 
    } catch (e) { console.error(e); alert("Failed to remove connection"); }
  }


  const handleDrag = (e: any, data: any) => {
    setDragPosition({ x: data.x, y: data.y })
    setIsDragging(true)
  }

  const handleDragStop = (e: any, data: any) => {
    setTimeout(() => setIsDragging(false), 100);
    const DROP_THRESHOLD = 150;
    const X_THRESHOLD = 200;

    // 1. Check Shortlist (Bottom Drop)
    if (data.y > DROP_THRESHOLD) {
      if (!shortlisted.some(p => p.user_id === profiles[currentIndex].user_id)) {
        setShortlisted([...shortlisted, profiles[currentIndex]])
      }
      handleSkip()
      return
    }

    // 2. Check Compare (Top Drop)
    if (data.y < -DROP_THRESHOLD) {
      if (!compareSlots.slot1) {
        setCompareSlots(prev => ({ ...prev, slot1: profiles[currentIndex] }))
        handleSkip()
      } else if (!compareSlots.slot2) {
        setCompareSlots(prev => ({ ...prev, slot2: profiles[currentIndex] }))
        setShowCompareModal(true)
        handleSkip()
      } else {
        alert("Comparison slots full! Remove one to add this profile.")
        setDragPosition({ x: 0, y: 0 })
      }
      return
    }

    // 3. Connect/Skip
    if (data.x > X_THRESHOLD) { handleConnect(); return }
    if (data.x < -X_THRESHOLD) { handleSkip(); return }

    setDragPosition({ x: 0, y: 0 })
  }

  const removeFromCompare = (slot: 'slot1' | 'slot2') => {
    setCompareSlots(prev => ({ ...prev, [slot]: null }))
  }

  const profile = profiles[currentIndex]

  // Loading / Empty States
  if (loading) return <div className="flex-1 flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading profiles...</p></div>

  // Need to handle empty profile list but still show header (for connections management)
  const content = profiles.length === 0 || currentIndex >= profiles.length ? (
    <div className="flex-1 flex items-center justify-center bg-background"><div className="text-center"><p className="text-foreground font-semibold">No more profiles to show! 🎉</p><p className="text-sm text-muted-foreground">Check back later for new teammates.</p></div></div>
  ) : (
    /* Main Draggable Area */
    <div className="flex-1 relative flex items-center justify-center overflow-hidden">

      {/* Drop Zones Indicators */}
      <div className={`absolute top-0 left-0 right-0 h-32 flex items-center justify-center bg-blue-500/10 border-b-2 border-blue-500/30 transition-opacity duration-300 z-0 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-bold text-blue-600 flex items-center gap-2 rounded-md bg-background/50 px-4 py-2"><Scale /> Drop to Compare</p>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-32 flex items-center justify-center bg-yellow-500/10 border-t-2 border-yellow-500/30 transition-opacity duration-300 z-0 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-bold text-yellow-600 flex items-center gap-2 rounded-md bg-background/50 px-4 py-2"><Star /> Drop to Shortlist</p>
      </div>
      <div className={`absolute left-0 top-0 bottom-0 w-32 flex items-center justify-center bg-red-500/10 border-r-2 border-red-500/30 transition-opacity duration-300 z-0 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-bold text-red-600 -rotate-90 rounded-md bg-background/50 px-4 py-2">Pass</p>
      </div>
      <div className={`absolute right-0 top-0 bottom-0 w-32 flex items-center justify-center bg-green-500/10 border-l-2 border-green-500/30 transition-opacity duration-300 z-0 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-bold text-green-600 rotate-90 rounded-md bg-background/50 px-4 py-2">Connect</p>
      </div>

      {/* Draggable Card */}
      <div className="z-20 w-full max-w-2xl px-4 relative">
        <Draggable
          nodeRef={cardRef}
          position={dragPosition}
          onStart={() => setIsDragging(true)}
          onDrag={handleDrag}
          onStop={handleDragStop}
          cancel=".no-drag"
        >
          <div ref={cardRef} className="cursor-grab active:cursor-grabbing transition-transform" style={{
            transform: isDragging ? `rotate(${dragPosition.x * 0.05}deg)` : 'none'
          }}>
            <Card className="border-2 border-border rounded-xl shadow-xl overflow-hidden bg-card select-none">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Use existing card content structure */}
                <div className="p-6 space-y-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/50">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-foreground">{profile.display_name}</h2>
                        <Badge variant="secondary" className="flex items-center gap-1 text-[10px]">
                          <Users size={12} /> {profile.connection_count || 0} connections
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen size={16} />
                          <span className="text-sm">{profile.branch} • {profile.year}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Briefcase size={16} />
                          <span className="text-sm">{profile.college}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm text-foreground leading-relaxed line-clamp-4">{profile.bio}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex flex-col justify-center">
                  {/* Skills & Interests Tags */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {(profile.skills || []).map((skill: string) => (
                          <Badge key={skill} variant="default" className="text-xs px-2.5 py-0.5">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {(profile.interests || []).slice(0, 5).map((interest: string) => (
                          <Badge key={interest} variant="outline" className="text-xs px-2.5 py-0.5">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-border flex justify-between items-center bg-muted/30 px-8">
                <Button
                  size="icon"
                  variant="outline"
                  className="no-drag h-12 w-12 rounded-full border-red-200 hover:bg-red-100 hover:text-red-500 z-50 cursor-pointer"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleSkip}
                >
                  <X className="h-6 w-6" />
                </Button>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest hidden md:block">Drag</span>
                <Button
                  size="icon"
                  className="no-drag h-12 w-12 rounded-full bg-[#e46880] hover:bg-[#dc3d5c] text-white z-50 cursor-pointer"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleConnect()}
                >
                  <Heart className="h-6 w-6" />
                </Button>
              </div>
            </Card>
          </div>
        </Draggable>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Header */}
      <div className="border-b border-border px-8 py-4 flex justify-between items-center z-10 bg-background/80 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Find Your Teammate</h1>
          <p className="text-xs text-muted-foreground">Swipe to connect with potential team members</p>
        </div>

        {/* Top Actions */}
        <div className="flex gap-2">
          {/* Requests Drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className={requests.length > 0 ? "border-red-400 text-red-600" : ""}>
                <UserPlus className="mr-2 h-4 w-4" />
                Requests ({requests.length})
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Connection Requests</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 flex gap-4 overflow-x-auto pb-8">
                {requests.length === 0 && <p className="text-muted-foreground text-center w-full">No pending requests.</p>}
                {requests.map((p) => (
                  <Card key={p.user_id} className="min-w-[250px] p-4 flex flex-col gap-2 relative">
                    <div className="font-bold">{p.display_name}</div>
                    <div className="text-xs text-muted-foreground">{p.branch} • {p.year}</div>
                    <div className="flex gap-2 mt-auto pt-4">
                      <Button size="sm" variant="outline" className="w-1/2 border-red-200 hover:bg-red-50 text-red-600" onClick={() => handleReject(p.user_id)}><X className="mr-1 h-3 w-3" /> Reject</Button>
                      <Button size="sm" className="w-1/2 bg-green-600 hover:bg-green-700" onClick={() => handleAccept(p.user_id)}><Check className="mr-1 h-3 w-3" /> Accept</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </DrawerContent>
          </Drawer>

          <Button
            variant="outline"
            size="sm"
            className={compareSlots.slot1 || compareSlots.slot2 ? "border-blue-400 text-blue-600" : ""}
            onClick={() => setShowCompareModal(true)}
          >
            <Scale className="mr-2 h-4 w-4" />
            Compare
          </Button>

          {/* Shortlist Drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className={shortlisted.length > 0 ? "border-yellow-400 text-yellow-600" : ""}>
                <Star className="mr-2 h-4 w-4" />
                Shortlist
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Shortlisted Candidates</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 flex gap-4 overflow-x-auto pb-8">
                {shortlisted.length === 0 && <p className="text-muted-foreground text-center w-full">Drag cards down to shortlist them.</p>}
                {shortlisted.map((p) => (
                  <Card key={p.user_id} className="min-w-[250px] p-4 flex flex-col gap-2 relative group">
                    <Button
                      variant="ghost" size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setShortlisted(prev => prev.filter(item => item.user_id !== p.user_id))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="font-bold">{p.display_name}</div>
                    <div className="text-xs text-muted-foreground">{p.branch} • {p.year}</div>
                    <Button size="sm" className="w-full mt-2" onClick={() => handleConnect(p)}>Connect</Button>
                  </Card>
                ))}
              </div>
            </DrawerContent>
          </Drawer>

          {/* My Connections Drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-4 w-4" />
                My Connections
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Your Connections ({myConnections.length})</DrawerTitle>
                <DialogDescription>People you can chat with.</DialogDescription>
              </DrawerHeader>
              <div className="p-4 flex gap-4 overflow-x-auto pb-8">
                {myConnections.length === 0 && <p className="text-muted-foreground text-center w-full">No connections yet.</p>}
                {myConnections.map((p) => (
                  <Card key={p.user_id} className="min-w-[250px] p-4 flex flex-col gap-2 relative group border-green-200">
                    <div className="font-bold">{p.display_name}</div>
                    <div className="text-xs text-muted-foreground">{p.branch} • {p.year}</div>
                    <Button
                      size="sm" variant="ghost" className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleRemoveConnection(p.user_id)}>
                      <UserMinus className="mr-2 h-3 w-3" /> Remove
                    </Button>
                  </Card>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {content}

      {/* Comparison Modal */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compare Profiles</DialogTitle>
            <DialogDescription>Review candidates side-by-side.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Slot 1 */}
            <div className="border rounded-lg p-4 relative bg-card">
              {!compareSlots.slot1 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground border-dashed border-2 rounded">Slot Empty</div>
              ) : (
                <div className="space-y-4">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeFromCompare('slot1')}><X className="h-4 w-4" /></Button>
                  <h3 className="font-bold text-xl">{compareSlots.slot1.display_name}</h3>
                  <Badge variant="secondary" className="text-[10px]"><Users size={10} className="mr-1" /> {compareSlots.slot1.connection_count || 0}</Badge>
                  <div className="text-sm text-muted-foreground">{compareSlots.slot1.branch}</div>
                  <div className="bg-muted p-2 rounded text-sm">{compareSlots.slot1.bio}</div>
                  <div className="flex flex-wrap gap-1">
                    {compareSlots.slot1.skills?.map((s: string) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                  </div>
                  <Button className="w-full" onClick={() => handleConnect(compareSlots.slot1)}>Connect</Button>
                </div>
              )}
            </div>

            {/* Slot 2 */}
            <div className="border rounded-lg p-4 relative bg-card">
              {!compareSlots.slot2 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground border-dashed border-2 rounded">Slot Empty</div>
              ) : (
                <div className="space-y-4">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeFromCompare('slot2')}><X className="h-4 w-4" /></Button>
                  <h3 className="font-bold text-xl">{compareSlots.slot2.display_name}</h3>
                  <Badge variant="secondary" className="text-[10px]"><Users size={10} className="mr-1" /> {compareSlots.slot2.connection_count || 0}</Badge>
                  <div className="text-sm text-muted-foreground">{compareSlots.slot2.branch}</div>
                  <div className="bg-muted p-2 rounded text-sm">{compareSlots.slot2.bio}</div>
                  <div className="flex flex-wrap gap-1">
                    {compareSlots.slot2.skills?.map((s: string) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                  </div>
                  <Button className="w-full" onClick={() => handleConnect(compareSlots.slot2)}>Connect</Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
