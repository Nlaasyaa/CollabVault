"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/auth-context"
import { createEvent } from "@/lib/apiClient"
import { useToast } from "@/hooks/use-toast"

interface NewEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NewEventModal({ isOpen, onClose, onSuccess }: NewEventModalProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    required_skills: "",
    team_size: "1",
    location: "",
    event_date: "",
    deadline: "",
    registration_link: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    try {
      await createEvent(formData, token)
      toast({ title: "Success", description: "Event created successfully!" })
      onSuccess()
      onClose()
      setFormData({
        title: "",
        description: "",
        required_skills: "",
        team_size: "1",
        location: "",
        event_date: "",
        deadline: "",
        registration_link: ""
      })
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create event", 
        variant: "destructive" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event / Hackathon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input 
              required 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Smart India Hackathon 2024"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              required 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter event details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input 
                required 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. Bangalore / Online"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Team Size</label>
              <Input 
                type="number" 
                min="1"
                required 
                value={formData.team_size}
                onChange={(e) => setFormData({...formData, team_size: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Date</label>
              <Input 
                type="date"
                required 
                value={formData.event_date}
                onChange={(e) => setFormData({...formData, event_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reg. Deadline</label>
              <Input 
                type="date"
                required 
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Required Skills (comma separated)</label>
            <Input 
              value={formData.required_skills}
              onChange={(e) => setFormData({...formData, required_skills: e.target.value})}
              placeholder="e.g. React, Node.js, Python"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Registration Link (Optional)</label>
            <Input 
              value={formData.registration_link}
              onChange={(e) => setFormData({...formData, registration_link: e.target.value})}
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
