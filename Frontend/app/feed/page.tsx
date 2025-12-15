"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { LogOut, Plus } from 'lucide-react';
import Link from "next/link";
import { ProfileCard } from "@/components/profile-card";
import { useRouter } from 'next/navigation';
import { getAllProfiles } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

export default function FeedPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const data = await getAllProfiles();

        // Map backend data to frontend format
        const mappedProfiles = data
          .filter((p: any) => p.user_id !== user?.id) // Filter out current user
          .map((p: any) => {
            let open_for: string[] = [], skills: string[] = [], interests: string[] = [];
            try {
              open_for = p.open_for ? JSON.parse(p.open_for) : [];
            } catch (e) {
              open_for = p.open_for ? [p.open_for] : [];
            }

            return {
              id: p.user_id,
              display_name: p.display_name || "User",
              college: p.college || "Unknown College",
              branch: p.branch || "Unknown Branch",
              year: p.year || "Unknown Year",
              bio: p.bio || "No bio available",
              open_for,
              skills,
              interests
            };
          });

        setProfiles(mappedProfiles);
        setFilteredProfiles(mappedProfiles);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        toast({
          title: "Error",
          description: "Failed to load profiles.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfiles();
    }
  }, [user?.id, toast]);

  const handleFilter = (filter: string) => {
    setSelectedFilter(filter);

    if (filter === "all") {
      setFilteredProfiles(profiles);
    } else if (filter === "same-college" && user?.profile?.college) {
      setFilteredProfiles(
        profiles.filter((p) => p.college === user.profile?.college)
      );
    } else if (filter === "same-branch" && user?.profile?.branch) {
      setFilteredProfiles(
        profiles.filter((p) => p.branch === user.profile?.branch)
      );
    } else if (filter === "common-interests" && user?.profile?.interests) {
      setFilteredProfiles(
        profiles.filter(
          (p) =>
            p.interests.some((interest: string) =>
              user.profile?.interests.includes(interest)
            )
        )
      );
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <ProtectedRoute requireProfile>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Connect</h1>
              <p className="text-sm text-slate-600">
                Welcome back, {user?.display_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="outline">Edit Profile</Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="text-slate-600 hover:text-slate-900"
              >
                <LogOut size={20} />
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Your Profile Summary */}
          <Card className="mb-8 bg-white">
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900">Your Profile</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">College</p>
                  <p className="font-semibold text-slate-900">
                    {user?.profile?.college}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Branch</p>
                  <p className="font-semibold text-slate-900">
                    {user?.profile?.branch}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Year</p>
                  <p className="font-semibold text-slate-900">
                    {user?.profile?.year}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-600">Bio</p>
                <p className="text-slate-900">{user?.profile?.bio}</p>
              </div>
            </CardContent>
          </Card>

          {/* Filter Buttons */}
          <div className="mb-8 flex flex-wrap gap-3">
            <Button
              onClick={() => handleFilter("all")}
              variant={selectedFilter === "all" ? "default" : "outline"}
              className={
                selectedFilter === "all"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : ""
              }
            >
              All Students
            </Button>
            <Button
              onClick={() => handleFilter("same-college")}
              variant={
                selectedFilter === "same-college" ? "default" : "outline"
              }
              className={
                selectedFilter === "same-college"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : ""
              }
            >
              Same College
            </Button>
            <Button
              onClick={() => handleFilter("same-branch")}
              variant={
                selectedFilter === "same-branch" ? "default" : "outline"
              }
              className={
                selectedFilter === "same-branch"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : ""
              }
            >
              Same Branch
            </Button>
            <Button
              onClick={() => handleFilter("common-interests")}
              variant={
                selectedFilter === "common-interests" ? "default" : "outline"
              }
              className={
                selectedFilter === "common-interests"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : ""
              }
            >
              Common Interests
            </Button>
          </div>

          {/* Community Feed */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Discover Students
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>

            {filteredProfiles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">
                  No students found with selected filters
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
