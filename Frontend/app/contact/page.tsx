"use client"

import Link from "next/link"
import { ArrowLeft, Mail, AlertCircle, Handshake, Target } from "lucide-react"

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#191f1d] text-[#ece0c8] font-sans selection:bg-[#cb5a31] selection:text-white p-6 md:p-12">
            <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Mulish:wght@400;700&display=swap");
        body { font-family: 'Mulish', sans-serif; }
      `}</style>

            <div className="max-w-4xl mx-auto">
                <Link href="/landing" className="inline-flex items-center gap-2 text-[#949993] hover:text-[#ece0c8] transition-colors mb-8">
                    <ArrowLeft size={20} /> Back to Home
                </Link>

                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">📞 Contact Us — CollabVault</h1>
                    <p className="text-lg text-[#949993] leading-relaxed max-w-2xl">
                        At CollabVault, we're here to help you collaborate, create, and grow.
                        Whether you have a question, want to report an issue, or just want to share ideas to improve the platform — we’d love to hear from you!
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Get in Touch */}
                    <section className="bg-[#252b29] border border-[#555a57] p-8 rounded-2xl hover:border-[#ecc947] transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <Mail className="w-6 h-6 text-[#ecc947]" />
                            <h2 className="text-2xl font-bold">Get in Touch</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-[#ecc947] mb-1">📧 Email Support:</h3>
                                <a href="mailto:didikadiscodancer@gmail.com" className="text-xl underline hover:text-white transition-colors">didikadiscodancer@gmail.com</a>
                                <p className="text-[#949993] mt-2 text-sm">Reach us for account issues, bug reports, feature requests, or general queries.</p>
                            </div>

                            <div>
                                <h3 className="font-bold text-[#ecc947] mb-1">🌐 Feedback Form:</h3>
                                <p className="text-[#949993] mb-2">Have suggestions? Tell us what you’d like to see on CollabVault!</p>
                                <Link href="/feedback" className="text-[#cb5a31] hover:text-[#e07b55] underline">
                                    Go to Feedback Page
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Community & Tech Support */}
                    <section className="bg-[#252b29] border border-[#555a57] p-8 rounded-2xl hover:border-[#cb5a31] transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertCircle className="w-6 h-6 text-[#cb5a31]" />
                            <h2 className="text-2xl font-bold">Community & Technical Support</h2>
                        </div>

                        <p className="text-[#949993] mb-4">If you're facing technical issues, errors, or feature glitches, please mention:</p>
                        <ul className="list-disc list-inside space-y-2 text-[#ece0c8] mb-6 pl-2">
                            <li>Your registered email</li>
                            <li>Screenshot (if any)</li>
                            <li>A short description of the issue</li>
                        </ul>
                        <p className="text-sm text-[#949993] italic">Our team will get back to you within 24–48 hours.</p>
                    </section>

                    {/* Partner With Us */}
                    <section className="bg-[#252b29] border border-[#555a57] p-8 rounded-2xl hover:border-[#6f5d79] transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <Handshake className="w-6 h-6 text-[#6f5d79]" />
                            <h2 className="text-2xl font-bold">Partner With Us</h2>
                        </div>
                        <p className="text-[#949993] mb-4">Are you a college club, hackathon organizer, or company looking to collaborate?</p>
                        <p>Email us at <a href="mailto:didikadiscodancer@gmail.com" className="text-[#ecc947] hover:underline">didikadiscodancer@gmail.com</a> — let’s build the next big thing together!</p>
                    </section>

                    {/* Our Mission */}
                    <section className="bg-[#252b29] border border-[#555a57] p-8 rounded-2xl hover:border-[#4e779a] transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-6 h-6 text-[#4e779a]" />
                            <h2 className="text-2xl font-bold">Our Mission</h2>
                        </div>
                        <p className="text-[#ece0c8] leading-relaxed">
                            To make student collaboration simpler, smarter, and more impactful by connecting talent, ideas, and opportunities in one place.
                        </p>
                    </section>
                </div>

                <footer className="mt-16 pt-8 border-t border-[#555a57] text-center text-[#949993] text-sm">
                   
                </footer>
            </div>
        </div>
    )
}
