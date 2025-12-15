"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getPost, likePost, commentPost, getComments } from "@/lib/apiClient"
import { useAuth } from "@/context/auth-context"
import Sidebar from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Share2, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function SinglePostPage() {
    const params = useParams()
    const id = params?.id
    const { token } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const [post, setPost] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [likedById, setLikedById] = useState(false)

    // Comments state
    const [postComments, setPostComments] = useState<any[]>([])
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [commentText, setCommentText] = useState("")
    const [showComments, setShowComments] = useState(false)

    // Fetch post
    useEffect(() => {
        if (!id) return;

        const fetchPostData = async () => {
            setIsLoading(true)
            try {
                const data = await getPost(id as string, token)

                let skills = []
                try {
                    skills = data.required_skills ? (
                        data.required_skills.startsWith('[')
                            ? JSON.parse(data.required_skills)
                            : data.required_skills.split(',').map((s: string) => s.trim())
                    ) : []
                } catch (e) {
                    skills = [data.required_skills]
                }

                const mappedPost = {
                    id: data.id,
                    author: data.creator_name || `User ${data.creator_id}`,
                    avatar: "👤",
                    timestamp: new Date(data.created_at).toLocaleDateString(),
                    title: data.title,
                    description: data.description,
                    requiredSkills: skills,
                    teamSize: data.team_size,
                    location: data.location,
                    deadline: data.deadline ? new Date(data.deadline).toLocaleDateString() : "No deadline",
                    likes: data.likes || 0,
                    likedByMe: data.is_liked, // Backend should return this if auth'd
                    comments: data.comments || 0,
                }

                setPost(mappedPost)
                setLikedById(data.is_liked) // Initial state
            } catch (error) {
                console.error("Failed to fetch post:", error)
                toast({
                    title: "Error",
                    description: "Could not load post.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchPostData()
    }, [id, token])

    const handleLike = async () => {
        if (!post) return;
        if (!token) {
            toast({ title: "Error", description: "Login to like", variant: "destructive" });
            return;
        }

        try {
            // Optimistic update
            setLikedById(prev => !prev);
            setPost((prev: any) => ({
                ...prev,
                likes: prev.likes + (likedById ? -1 : 1)
            }));

            await likePost(post.id, token);
        } catch (error) {
            console.error("Failed to like:", error);
            // Revert on error
            setLikedById(prev => !prev);
            setPost((prev: any) => ({
                ...prev,
                likes: prev.likes + (likedById ? 1 : -1)
            }));
        }
    }

    const toggleComments = async () => {
        if (showComments) {
            setShowComments(false)
        } else {
            setShowComments(true)
            setIsLoadingComments(true)
            try {
                const comments = await getComments(post.id)
                setPostComments(comments)
            } catch (error) {
                console.error("Failed to fetch comments:", error)
            } finally {
                setIsLoadingComments(false)
            }
        }
    }

    const handleComment = async () => {
        if (!commentText.trim() || !post) return
        if (!token) {
            toast({ title: "Error", description: "Login to comment", variant: "destructive" })
            return
        }

        try {
            await commentPost(post.id, commentText, token)
            setCommentText("")
            // Refresh comments
            const comments = await getComments(post.id)
            setPostComments(comments)
            // Update comment count
            setPost((prev: any) => ({ ...prev, comments: prev.comments + 1 }))
        } catch (error) {
            console.error("Failed to post comment:", error)
            toast({ title: "Error", description: "Failed to post comment", variant: "destructive" })
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-screen bg-background items-center justify-center">
                <p className="text-muted-foreground">Loading post...</p>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="flex h-screen bg-background items-center justify-center flex-col gap-4">
                <p className="text-xl font-bold">Post not found</p>
                <Button onClick={() => router.push("/")}>Go Home</Button>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-background text-foreground">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                onSelectChat={() => { }}
                activeChatId={null}
                activePage="posts"
                onSelectPage={() => router.push("/")}
            />

            <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
                <div className="border-b border-border px-8 py-6 bg-background flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Post Details</h1>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="max-w-3xl mx-auto">
                        <Card className="border border-border p-6 hover:shadow-sm transition-shadow">
                            {/* Post Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 text-xs font-semibold">
                                    {post.avatar}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground text-sm">{post.author}</p>
                                    <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-foreground mb-2">{post.title}</h3>
                                <p className="text-foreground text-sm leading-relaxed mb-3">{post.description}</p>

                                <div className="space-y-2 text-sm text-foreground">
                                    <div>
                                        <span className="font-semibold">Required Skills:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {post.requiredSkills && post.requiredSkills.map((skill: string) => (
                                            <Badge key={skill} variant="secondary" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>

                                    <p>
                                        <span className="font-semibold">Team Size:</span> {post.teamSize}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Location:</span> {post.location}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Deadline:</span> {post.deadline}
                                    </p>
                                </div>
                            </div>

                            {/* Engagement Footer */}
                            <div className="flex items-center gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-1.5 transition-colors ${likedById ? "text-gray-300" : "hover:text-foreground"}`}
                                >
                                    <Heart size={16} className={likedById ? "fill-gray-400" : ""} />
                                    <span>{post.likes}</span>
                                </button>
                                <button
                                    onClick={toggleComments}
                                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                >
                                    <MessageCircle size={16} />
                                    <span>{post.comments}</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const link = `${window.location.origin}/posts/${post.id}`;
                                        navigator.clipboard.writeText(link);
                                        toast({ title: "Shared!", description: "Link copied to clipboard." });
                                    }}
                                    className="ml-auto flex items-center gap-1.5 hover:text-foreground transition-colors"
                                >
                                    <Share2 size={16} />
                                    <span>Share</span>
                                </button>
                            </div>

                            {/* Comments Section */}
                            {showComments && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                                        {isLoadingComments ? (
                                            <p className="text-sm text-muted-foreground text-center">Loading comments...</p>
                                        ) : postComments.length > 0 ? (
                                            postComments.map((comment: any) => (
                                                <div key={comment.id} className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                                        {comment.author_name?.[0] || "U"}
                                                    </div>
                                                    <div className="flex-1 bg-muted/50 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-semibold">{comment.author_name || "User"}</span>
                                                            <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-foreground">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center">No comments yet. Be the first!</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Write a comment..."
                                            value={commentText}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentText(e.target.value)}
                                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleComment()}
                                            className="flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => handleComment()}
                                            disabled={!commentText.trim()}
                                        >
                                            Post
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
