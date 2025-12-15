import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { submitFeedback, getMyFeedbackHistory } from "@/lib/apiClient"
import { toast } from "@/hooks/use-toast"
import { Star } from "lucide-react"

export default function FeedbackPage() {
    const { token } = useAuth()
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [rating, setRating] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [history, setHistory] = useState<any[]>([])

    const fetchHistory = async () => {
        if (!token) return
        try {
            const data = await getMyFeedbackHistory(token)
            setHistory(data)
        } catch (error) {
            console.error("Failed to fetch feedback history", error)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (existing submit logic)
        try {
            await submitFeedback({ subject, message, rating }, token)
            toast({
                title: "Success",
                description: "Your feedback has been submitted. Thank you!",
            })
            setSubject("")
            setMessage("")
            setRating(null)
            fetchHistory() // Refresh history
        } catch (error) {
            console.error("Failed to submit feedback:", error)
            toast({
                title: "Error",
                description: "Failed to submit feedback. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col bg-background overflow-y-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto w-full space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Feedback</h1>
                    <p className="text-muted-foreground">We value your input! Help us improve TechTribe.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Share your thoughts</CardTitle>
                        <CardDescription>
                            Let us know what you like, what we can improve, or report any issues.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ... (existing fields) ... */}
                            {/* Copy existing form fields here exactly or keep as is */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
                                <Input
                                    id="subject"
                                    placeholder="e.g. Suggestion for new feature"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tell us more about your feedback..."
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Rate your experience (Optional)</Label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`transition-colors ${rating && rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-200"}`}
                                        >
                                            <Star className={rating && rating >= star ? "fill-current" : ""} size={32} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit Feedback"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Section */}
                {history.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <h2 className="text-xl font-semibold">Your Previous Feedback ({history.length})</h2>
                        <div className="space-y-4">
                            {history.map((item) => (
                                <Card key={item.id}>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold">{item.subject}</h3>
                                                <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {item.rating && <Badge variant="outline">{item.rating}/5 Stars</Badge>}
                                        </div>
                                        <p className="text-sm text-foreground/80 bg-muted/30 p-3 rounded-md">{item.message}</p>

                                        {/* Admin Reply Display */}
                                        {item.admin_reply && (
                                            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-md mt-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-green-700 text-sm">Admin Reply</span>
                                                    <span className="text-xs text-muted-foreground">• {new Date(item.replied_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-foreground">{item.admin_reply}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
