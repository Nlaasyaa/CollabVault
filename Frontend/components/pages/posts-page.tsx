"use client"

import { useState, useEffect } from "react"
import { Plus, Heart, MessageCircle, Share2, Trash2, MoreHorizontal, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import NewPostModal, { type PostFormData } from "@/components/new-post-modal"
import { getPosts, createPost, likePost, commentPost, getComments, deletePostAdmin, deleteCommentAdmin, getAnnouncements } from "@/lib/apiClient"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"



export default function PostsPage() {
  const { token, user } = useAuth()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false)
  const [allPosts, setAllPosts] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null)
  const [postComments, setPostComments] = useState<any[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const data = await getPosts(token)
      // Map backend data to frontend format
      const mappedPosts = data.map((post: any) => {
        let skills = []
        try {
          skills = post.required_skills ? (
            post.required_skills.startsWith('[')
              ? JSON.parse(post.required_skills)
              : post.required_skills.split(',').map((s: string) => s.trim())
          ) : []
        } catch (e) {
          skills = [post.required_skills]
        }

        return {
          id: post.id,
          author: post.creator_name || `User ${post.creator_id}`, // Now uses creator_name from JOIN
          avatar: "👤", // Placeholder
          timestamp: new Date(post.created_at).toLocaleDateString(),
          title: post.title,
          description: post.description,
          requiredSkills: skills,
          teamSize: post.team_size,
          location: post.location,
          deadline: post.deadline ? new Date(post.deadline).toLocaleDateString() : "No deadline",
          likes: post.likes || 0,
          likedByMe: post.is_liked,
          comments: post.comments || 0,
          shares: 0,
        }
      })
      setAllPosts(mappedPosts)

      // Initialize liked posts
      const initialLiked = new Set<number>()
      data.forEach((post: any) => {
        if (post.is_liked) {
          initialLiked.add(post.id)
        }
      })
      setLikedPosts(initialLiked)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /* ... inside fetchPosts catch ... */

  useEffect(() => {
    fetchPosts()
    const fetchAnnouncements = async () => {
      if (!token) return
      try {
        const data = await getAnnouncements(token)
        setAnnouncements(data)
      } catch (e) { console.error(e) }
    }
    fetchAnnouncements()
  }, [token])

  /* ... */

  const handleNewPost = async (data: PostFormData) => {
    try {
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to create a post.",
          variant: "destructive",
        })
        return
      }

      await createPost({
        title: data.title,
        description: data.description,
        required_skills: JSON.stringify(data.requiredSkills),
        team_size: parseInt(data.teamSize),
        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : null,
        location: data.location
      }, token)

      toast({ title: "Success", description: "Post created successfully!" })
      setIsModalOpen(false)
      fetchPosts()
    } catch (error) {
      console.error("Failed to create post:", error)
      toast({ title: "Error", description: "Failed to create post.", variant: "destructive" })
    }
  }

  const toggleComments = async (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null)
      setPostComments([])
    } else {
      setExpandedPostId(postId)
      setIsLoadingComments(true)
      try {
        const comments = await getComments(postId)
        setPostComments(comments)
      } catch (error) {
        console.error("Failed to fetch comments:", error)
      } finally {
        setIsLoadingComments(false)
      }
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Admin: Permanently delete this post?")) return
    try {
      await deletePostAdmin(postId, token)
      toast({ title: "Post Deleted", description: "Admin action successful" })
      fetchPosts()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" })
    }
  }

  const handleDeleteComment = async (commentId: number, postId: number) => {
    if (!confirm("Admin: Delete this comment?")) return
    try {
      await deleteCommentAdmin(commentId, token)
      const comments = await getComments(postId)
      setPostComments(comments)
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" })
    }
  }

  const handleComment = async (postId: number) => {
    if (!commentText.trim()) return
    if (!token) {
      toast({ title: "Error", description: "Login to comment", variant: "destructive" })
      return
    }
    try {
      await commentPost(postId, commentText, token)
      setCommentText("")
      const comments = await getComments(postId)
      setPostComments(comments)
      fetchPosts()
    } catch (error) {
      console.error("Failed to post comment:", error)
      toast({ title: "Error", description: "Failed to post comment", variant: "destructive" })
    }
  }
  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-8 py-6 bg-background flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Community Feed</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setIsAnnouncementsOpen(true)}
          >
            <Bell size={18} />
            {announcements.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-foreground text-background hover:bg-gray-300"
          >
            <Plus size={18} />
            New Post
          </Button>
        </div>
      </div >

      {/* Announcements Modal */}
      < Dialog open={isAnnouncementsOpen} onOpenChange={setIsAnnouncementsOpen} >
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Announcements</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {announcements.length === 0 ? (
              <p className="text-center text-muted-foreground">No announcements yet.</p>
            ) : announcements.map((a: any) => (
              <div key={a.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{a.title}</h3>
                  {a.is_pinned === 1 && <Badge variant="secondary" className="text-xs">Pinned</Badge>}
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{a.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog >

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {allPosts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No posts yet. Be the first to create one!
              </div>
            ) : (
              allPosts.map((post) => (
                <Card key={post.id} className="border border-border p-6 hover:shadow-sm transition-shadow">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 text-xs font-semibold">
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                    </div>
                    {(user as any)?.role === 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500"
                        onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                        title="Admin: Delete Post"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
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
                      onClick={async () => {
                        try {
                          if (!token) {
                            toast({ title: "Error", description: "Login to like", variant: "destructive" });
                            return;
                          }

                          const isLiked = likedPosts.has(post.id);
                          if (isLiked) {
                            setLikedPosts(prev => {
                              const next = new Set(prev);
                              next.delete(post.id);
                              return next;
                            });
                            await likePost(post.id, token);
                          } else {
                            setLikedPosts(prev => new Set(prev).add(post.id));
                            await likePost(post.id, token);
                          }

                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className={`flex items-center gap-1.5 transition-colors ${likedPosts.has(post.id) ? "text-gray-300" : "hover:text-foreground"}`}
                    >
                      <Heart size={16} className={likedPosts.has(post.id) ? "fill-gray-400" : ""} />
                      <span>{post.likes - (post.likedByMe ? 1 : 0) + (likedPosts.has(post.id) ? 1 : 0)}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
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
                  {
                    expandedPostId === post.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                          {isLoadingComments ? (
                            <p className="text-sm text-muted-foreground text-center">Loading comments...</p>
                          ) : postComments.length > 0 ? (
                            postComments.map((comment: any) => (
                              <div key={comment.id} className="flex gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                  {comment.author_name?.[0] || "U"}
                                </div>
                                <div className="flex-1 bg-muted/50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold">{comment.author_name || "User"}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                                      {(user as any)?.role === 'admin' && (
                                        <button
                                          onClick={() => handleDeleteComment(comment.id, post.id)}
                                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Delete Comment"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
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
                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleComment(post.id)}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleComment(post.id)}
                            disabled={!commentText.trim()}
                          >
                            Post
                          </Button>
                        </div>
                      </div>
                    )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <NewPostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleNewPost} />
    </div >
  )
}
