"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { TagInput } from "@/components/tag-input"
import { getAllSkills, getAllInterests } from "@/lib/apiClient"

import { SKILLS } from "@/lib/skills"
import { INTERESTS } from "@/lib/interests"

const BRANCHES = [
  "Computer Science",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Electronics",
  "Biotechnology",
  "Chemical Engineering",
  "Aerospace Engineering",
]

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]



const OPEN_FOR_OPTIONS = [
  "Internship",
  "Full-time",
  "Freelance",
  "Project Collaboration",
  "Mentorship",
  "Co-founder",
  "Hackathon",
]

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(user?.display_name || "")
  const [college, setCollege] = useState("")
  const [branch, setBranch] = useState("")
  const [year, setYear] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [openFor, setOpenFor] = useState<string[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [availableInterests, setAvailableInterests] = useState<string[]>([])

  useEffect(() => {
    // Load skills and interests from backend
    const loadOptions = async () => {
      try {
        const [skillsData, interestsData] = await Promise.all([
          getAllSkills(),
          getAllInterests()
        ])

        if (Array.isArray(skillsData)) {
          setAvailableSkills(skillsData.map((s: any) => s.name))
        }

        if (Array.isArray(interestsData)) {
          setAvailableInterests(interestsData.map((i: any) => i.name))
        }
      } catch (error) {
        console.error("Failed to load options", error)
        // Fallback or just empty
      }
    }

    loadOptions()
  }, [])

  useEffect(() => {
    if (user) {
      if (user.display_name) setDisplayName(user.display_name)
      if (user instanceof Object && 'phone_number' in user) {
        // @ts-ignore
        setPhone(user.phone_number || "")
      }
      if (user.profile) {
        setCollege(user.profile.college || "")
        setBranch(user.profile.branch || "")
        setYear(user.profile.year || "")
        setBio(user.profile.bio || "")
        // @ts-ignore
        setSkills(user.profile.skills || [])
        // @ts-ignore
        setInterests(user.profile.interests || [])
        // @ts-ignore
        setOpenFor(user.profile.open_for || [])
      }
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!college || !branch || !year || !bio) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      updateProfile({
        display_name: displayName,
        college,
        branch,
        year,
        bio,
        skills,
        interests,
        open_for: openFor,
        // @ts-ignore
        phone_number: phone,
      })
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-3xl">Complete Your Profile</CardTitle>
              <CardDescription>
                Tell us about yourself to help others discover you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* College and Branch Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="border-border bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      College <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Your college name"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      required
                      className="border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select a branch</option>
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select your year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Update your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-slate-200"
                  />
                </div>

                {/* Bio */}

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Tell us about yourself (max 200 characters)"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 200))}
                    maxLength={200}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">{bio.length}/200 characters</p>
                </div>

                {/* Skills Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Skills
                  </label>
                  <TagInput
                    value={skills}
                    onChange={setSkills}
                    options={availableSkills.length > 0 ? availableSkills : SKILLS}
                    placeholder="Select or type your skills"
                  />
                </div>

                {/* Interests Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Interests
                  </label>
                  <TagInput
                    value={interests}
                    onChange={setInterests}
                    options={availableInterests.length > 0 ? availableInterests : INTERESTS}
                    placeholder="Select your interests"
                  />
                </div>

                {/* Open For Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Open For
                  </label>
                  <TagInput
                    value={openFor}
                    onChange={setOpenFor}
                    options={OPEN_FOR_OPTIONS}
                    placeholder="What opportunities are you open to?"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Profile..." : "Complete Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
