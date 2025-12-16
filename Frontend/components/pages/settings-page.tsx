"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Check, ChevronsUpDown, X, Sun, Moon } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAllSkills, getAllInterests, changePassword } from "@/lib/apiClient"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface UserSettings {
  email: string
  phoneNumber: string
  password: string
  displayName: string
  college: string
  branch: string
  year: string
  bio: string
  skills: string[]
  interests: string[]
  openFor: string[]
}

const OPEN_FOR_OPTIONS = [
  "Hackathons",
  "Projects",
  "Internships",
  "Full-time Jobs",
  "Freelance",
  "Mentorship",
  "Networking",
  "Startup Collaboration",
  "Research",
  "Open Source",
  "Coding Competitions"
]

export default function SettingsPage({ onBack }: { onBack: () => void }) {
  const { user, token, updateProfile } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    email: user?.email || "",
    phoneNumber: user?.phone_number || "",
    password: "••••••••",
    displayName: user?.display_name || "",
    college: user?.profile?.college || "",
    branch: user?.profile?.branch || "",
    year: user?.profile?.year || "",
    bio: user?.profile?.bio || "",
    skills: user?.profile?.skills || [],
    interests: user?.profile?.interests || [],
    openFor: user?.profile?.open_for || [],
  })

  const [availableSkills, setAvailableSkills] = useState<any[]>([])
  const [availableInterests, setAvailableInterests] = useState<any[]>([])
  const [isSkillsOpen, setIsSkillsOpen] = useState(false)
  const [isInterestsOpen, setIsInterestsOpen] = useState(false)
  const [isOpenForOpen, setIsOpenForOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (user) {
      setSettings({
        email: user.email || "",
        phoneNumber: user.phone_number || "",
        password: "••••••••",
        displayName: user.display_name || "",
        college: user.profile?.college || "",
        branch: user.profile?.branch || "",
        year: user.profile?.year || "",
        bio: user.profile?.bio || "",
        skills: user.profile?.skills || [],
        interests: user.profile?.interests || [],
        openFor: user.profile?.open_for || [],
      })
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsData = await getAllSkills()
        const interestsData = await getAllInterests()
        setAvailableSkills(skillsData)
        setAvailableInterests(interestsData)
      } catch (error) {
        console.error("Failed to fetch skills/interests:", error)
      }
    }
    fetchData()
  }, [])

  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const toggleSkill = (skillName: string) => {
    setSettings(prev => {
      const exists = prev.skills.includes(skillName)
      return {
        ...prev,
        skills: exists
          ? prev.skills.filter(s => s !== skillName)
          : [...prev.skills, skillName]
      }
    })
  }

  const toggleInterest = (interestName: string) => {
    setSettings(prev => {
      const exists = prev.interests.includes(interestName)
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter(i => i !== interestName)
          : [...prev.interests, interestName]
      }
    })
  }

  const toggleOpenFor = (option: string) => {
    setSettings(prev => {
      const exists = prev.openFor.includes(option)
      return {
        ...prev,
        openFor: exists
          ? prev.openFor.filter(o => o !== option)
          : [...prev.openFor, option]
      }
    })
  }

  import {
    getAllSkills, getAllInterests, changePassword
  } from "@/lib/apiClient"
  const handleSave = async () => {
    setIsSaving(true)
    try {
      updateProfile({
        display_name: settings.displayName,
        college: settings.college,
        branch: settings.branch,
        year: settings.year,
        bio: settings.bio,
        skills: settings.skills,
        interests: settings.interests,
        open_for: settings.openFor,
      })

      if (showPasswordInput && newPassword) {
        // Line 57: const { user, updateProfile } = useAuth() -> It is NOT destructured currently.
      }

      // We need to fix the imports and the destructuring first, so I will break this thought and execute the tool correctly.
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Update your profile information</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-gray-300 text-primary-foreground flex items-center gap-2"
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Account Section */}
          <Card className="border border-border bg-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Email</label>
                <Input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Phone Number</label>
                <Input
                  type="text"
                  value={settings.phoneNumber}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-foreground">Password</label>
                  <button
                    onClick={() => setShowPasswordInput(!showPasswordInput)}
                    className="text-sm text-primary hover:underline"
                  >
                    {showPasswordInput ? "Cancel" : "Change Password"}
                  </button>
                </div>
                {showPasswordInput ? (
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                ) : (
                  <Input
                    type="password"
                    value={settings.password}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Theme Section */}
          <Card className="border border-border bg-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Appearance</h2>
                <p className="text-sm text-muted-foreground mt-1">Customize how TechTribe looks on your device</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Card>

          {/* Profile Section */}
          <Card className="border border-border bg-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Display Name</label>
                <Input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">College</label>
                  <Input
                    type="text"
                    value={settings.college}
                    onChange={(e) => setSettings({ ...settings, college: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">Branch</label>
                  <Input
                    type="text"
                    value={settings.branch}
                    onChange={(e) => setSettings({ ...settings, branch: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Year</label>
                <Input
                  type="text"
                  value={settings.year}
                  onChange={(e) => setSettings({ ...settings, year: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Bio</label>
                <textarea
                  value={settings.bio}
                  onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
          </Card>

          {/* Skills Section */}
          <Card className="border border-border bg-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Skills</h2>
            <div className="space-y-4">
              <Popover open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isSkillsOpen}
                    className="w-full justify-between"
                  >
                    Select Skills...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search skills..." />
                    <CommandList>
                      <CommandEmpty>No skill found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-y-auto">
                        {availableSkills.map((skill) => (
                          <CommandItem
                            key={skill.id}
                            value={skill.name}
                            onSelect={() => {
                              toggleSkill(skill.name)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                settings.skills.includes(skill.name) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {skill.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-border rounded-lg bg-background/50">
                {settings.skills.length === 0 && (
                  <span className="text-sm text-muted-foreground italic px-2">No skills selected</span>
                )}
                {settings.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-sm px-3 py-1 flex items-center gap-1"
                  >
                    {skill}
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="ml-1 hover:text-destructive focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Interests Section */}
          <Card className="border border-border bg-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Interests</h2>
            <div className="space-y-4">
              <Popover open={isInterestsOpen} onOpenChange={setIsInterestsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isInterestsOpen}
                    className="w-full justify-between"
                  >
                    Select Interests...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search interests..." />
                    <CommandList>
                      <CommandEmpty>No interest found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-y-auto">
                        {availableInterests.map((interest) => (
                          <CommandItem
                            key={interest.id}
                            value={interest.name}
                            onSelect={() => {
                              toggleInterest(interest.name)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                settings.interests.includes(interest.name) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {interest.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-border rounded-lg bg-background/50">
                {settings.interests.length === 0 && (
                  <span className="text-sm text-muted-foreground italic px-2">No interests selected</span>
                )}
                {settings.interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="text-sm px-3 py-1 flex items-center gap-1"
                  >
                    {interest}
                    <button
                      onClick={() => toggleInterest(interest)}
                      className="ml-1 hover:text-destructive focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Open For Section */}
          <Card className="border border-border bg-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Open For</h2>
            <div className="space-y-4">
              <Popover open={isOpenForOpen} onOpenChange={setIsOpenForOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpenForOpen}
                    className="w-full justify-between"
                  >
                    Select Open For Options...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search options..." />
                    <CommandList>
                      <CommandEmpty>No option found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-y-auto">
                        {OPEN_FOR_OPTIONS.map((option) => (
                          <CommandItem
                            key={option}
                            value={option}
                            onSelect={() => {
                              toggleOpenFor(option)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                settings.openFor.includes(option) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-border rounded-lg bg-background/50">
                {settings.openFor.length === 0 && (
                  <span className="text-sm text-muted-foreground italic px-2">No options selected</span>
                )}
                {settings.openFor.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="text-sm px-3 py-1 flex items-center gap-1"
                  >
                    {item}
                    <button
                      onClick={() => toggleOpenFor(item)}
                      className="ml-1 hover:text-destructive focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
