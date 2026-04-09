"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { getEvents } from "@/lib/apiClient"
import NewEventModal from "@/components/new-event-modal"

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // ✅ ADMIN CHECK
  useEffect(() => {
    console.log("Current user role:", user?.role)
    setIsAdmin((user as any)?.role === "admin")
  }, [user])

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
          eventDate: e.event_date
            ? new Date(e.event_date).toLocaleDateString()
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

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-4 md:px-8 py-4 md:py-6 bg-background flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap">Upcoming Events</h1>
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
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-2">{event.title}</h2>
                      <p className="text-sm text-foreground/80 line-clamp-3">{event.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {event.skills.map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1 text-sm text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{event.eventDate}</span>
                      </div>
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
