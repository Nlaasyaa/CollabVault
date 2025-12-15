"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SKILLS } from "@/lib/skills"

interface NewPostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (postData: PostFormData) => void
}

export interface PostFormData {
  title: string
  description: string
  requiredSkills: string[]
  teamSize: string
  location: string
  deadline: string
}

export default function NewPostModal({ isOpen, onClose, onSubmit }: NewPostModalProps) {
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    description: "",
    requiredSkills: [],
    teamSize: "",
    location: "",
    deadline: "",
  })

  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false)
  const [skillSearchInput, setSkillSearchInput] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredSkills = SKILLS.filter(
    (skill) => skill.toLowerCase().includes(skillSearchInput.toLowerCase()) && !formData.requiredSkills.includes(skill),
  )

  const handleAddSkill = (skill: string) => {
    setFormData({
      ...formData,
      requiredSkills: [...formData.requiredSkills, skill],
    })
    setSkillSearchInput("")
    setIsSkillDropdownOpen(false)
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((s) => s !== skill),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.description && formData.teamSize && formData.location && formData.deadline) {
      onSubmit(formData)
      setFormData({
        title: "",
        description: "",
        requiredSkills: [],
        teamSize: "",
        location: "",
        deadline: "",
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-background border border-border p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Create New Post</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input
              type="text"
              placeholder="What are you looking for?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              placeholder="Describe the opportunity or role..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Required Skills - Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Required Skills</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
              >
                <span>{formData.requiredSkills.length > 0 ? "Select more skills" : "Select skills"}</span>
                <ChevronDown size={18} className={`transition-transform ${isSkillDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isSkillDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-border rounded-md bg-background shadow-lg z-10 max-h-64 overflow-y-auto">
                  {/* Search Input */}
                  <div className="sticky top-0 p-2 border-b border-border bg-background">
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={skillSearchInput}
                      onChange={(e) => setSkillSearchInput(e.target.value)}
                      className="w-full px-2 py-1 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Skills List */}
                  <div>
                    {filteredSkills.length > 0 ? (
                      filteredSkills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleAddSkill(skill)}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-foreground text-sm"
                        >
                          {skill}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-muted-foreground text-sm">No skills found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Skills Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                >
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-blue-900">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Team Size */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Team Size</label>
            <input
              type="text"
              placeholder="e.g., 4"
              value={formData.teamSize}
              onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g., Bangalore"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              disabled={
                !formData.title ||
                !formData.description ||
                !formData.teamSize ||
                !formData.location ||
                !formData.deadline
              }
            >
              Post
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
