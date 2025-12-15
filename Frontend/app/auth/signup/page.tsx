"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()
  const [display_name, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      await signup(email, display_name, password)
      router.push("/profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292m7.753 3.854A4 4 0 0019 12.354m1 0a4 4 0 01-4 4m-7.753-3.854a4 4 0 110-5.292m7.753 3.854A4.354 4.354 0 0019 12.354" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Create an Account</h1>
          <p className="text-center text-slate-500 text-sm mb-6">Join the Tech community and start collaborating</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={display_name}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="border-slate-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-slate-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-slate-200 bg-white"
              />
              <p className="text-xs text-slate-500">Must be at least 8 characters long</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-slate-200 bg-white"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-slate-900 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>

          <div className="text-center mt-6">
            <Link href="/landing" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
