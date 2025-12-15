"use client"

import { useAuth } from "@/context/auth-context"
import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Users, MessageSquare } from 'lucide-react'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-gray-200">
        <div className="text-2xl font-bold text-gray-900">Tech</div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="text-gray-900 font-medium hover:text-gray-600 transition">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gray-900 text-white hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-900 transition-all px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-20 md:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-block">
            <div className="bg-gray-100 rounded-full px-6 py-3 flex items-center gap-2 w-fit mx-auto">
              <Zap className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 font-medium">Your Tech Community Hub</span>
            </div>
          </div>

          {/* Main Heading */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Find Your Perfect<br />Hackathon Team
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with talented developers, share projects, and build amazing things together. Your next great collaboration starts here.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/signup">
              <Button className="bg-gray-900 text-white hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-900 transition-all px-8 py-6 text-lg">
                Start Building Together →
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="px-8 py-6 text-lg border-gray-300 hover:bg-gray-50">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 md:px-12 py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Everything You Need to Collaborate
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you connect, communicate, and create together.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Share & Discover */}
            <div className="border border-gray-200 rounded-2xl p-8 space-y-4 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Share & Discover</h3>
              <p className="text-gray-600 leading-relaxed">
                Post about hackathons, projects, and ideas. Discover what the community is building and get inspired by innovative projects.
              </p>
            </div>

            {/* Find Teammates */}
            <div className="border border-gray-200 rounded-2xl p-8 space-y-4 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Find Teammates</h3>
              <p className="text-gray-600 leading-relaxed">
                Swipe through developer profiles and connect with people who match your skills and interests. Build your dream team effortlessly.
              </p>
            </div>

            {/* Real-Time Chat */}
            <div className="border border-gray-200 rounded-2xl p-8 space-y-4 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Real-Time Chat</h3>
              <p className="text-gray-600 leading-relaxed">
                Communicate seamlessly with 1-on-1 messaging and team chats. Stay connected and collaborate in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-4xl mx-auto bg-gray-100 rounded-3xl px-8 md:px-16 py-16 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Ready to Join the Community?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Thousands of developers are already connecting, collaborating, and building amazing projects together. Don't miss out!
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button className="bg-gray-900 text-white hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-900 transition-all px-8 py-6 text-lg">
                Create Your Account →
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="px-8 py-6 text-lg bg-white text-gray-900 hover:bg-gray-50 border-gray-300">
                Already a Member?
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
