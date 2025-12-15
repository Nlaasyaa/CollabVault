"use client"

import FeedbackPageContent from "@/components/pages/feedback-page"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function FeedbackPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="p-4">
                <Link href="/landing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={20} /> Back to Home
                </Link>
            </div>
            <FeedbackPageContent />
        </div>
    )
}
