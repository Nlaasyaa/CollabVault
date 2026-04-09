"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
// @ts-ignore
import { getEvents, deleteEvent } from "@/lib/apiClient"
import NewEventModal from "@/components/new-event-modal"
import { Trash2, ExternalLink, Calendar, MapPin, Users, Clock } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function EventsPage() {
  const { user, token } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  // ✅ ADMIN CHECK
  const isAdmin = useMemo(() => (user as any)?.role?.toLowerCase() === "admin", [user])

  // ✅ FETCH EVENTS
  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const data = await getEvents()

      if (Array.isArray(data)) {
        const mapped = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          location: e.location,
          teamSize: e.team_size || 1,
          registrationLink: e.registration_link,
          eventDate: e.event_date
            ? new Date(e.event_date).toLocaleDateString()
            : "TBA",
          deadline: e.deadline
            ? new Date(e.deadline).toLocaleDateString()
            : "TBA",
          skills: e.required_skills
            ? e.required_skills.split(",").map((s: string) => s.trim())
            : [],
        }))

        setEvents(mapped)
      } else {
        console.error("Data received is not an array:", data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      setIsDeleting(eventId)
      await deleteEvent(eventId, token!)
      toast.success("Event deleted successfully")
      fetchEvents()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-4 md:px-8 py-4 md:py-6 bg-background flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap">Upcoming Events v2</h1>
        </div>
        <div>
          {isAdmin && (
            <Button onClick={() => setShowModal(true)}>
              + Create Event
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {events.length === 0 ? (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  No upcoming events at the moment.
                </div>
              ) : (
                events.map((event) => (
                  <Card key={event.id} className="p-6 border border-border hover:shadow-sm transition-shadow space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-foreground mb-2">{event.title}</h2>
                        <p className="text-sm text-foreground/80 line-clamp-3">{event.description}</p>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                          onClick={() => handleDelete(event.id)}
                          disabled={isDeleting === event.id}
                        >
                          <Trash2 className={cn("h-5 w-5", isDeleting === event.id && "animate-pulse")} />
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {event.skills.map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 text-sm text-muted-foreground pt-4 border-t border-border/50">
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{event.eventDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span>Max Team: {event.teamSize}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-red-500 font-medium">Deadline: {event.deadline}</span>
                        </div>
                      </div>

                      {event.registrationLink && (
                        <Button 
                          asChild 
                          className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                          variant="default"
                        >
                          <a 
                            href={event.registrationLink.startsWith('http') ? event.registrationLink : `https://${event.registrationLink}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            Register Now
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <NewEventModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={fetchEvents}
      />
    </div>
  )
}
