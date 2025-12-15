"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OnboardingPage() {
    const { user, updateProfile, isLoading } = useAuth();
    const router = useRouter();

    // Profile State
    const [bio, setBio] = useState("");
    const [college, setCollege] = useState("");
    const [branch, setBranch] = useState("");
    const [year, setYear] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [profileError, setProfileError] = useState("");

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
            return;
        }

        if (user?.profile?.college && user?.profile?.branch && user?.profile?.year) {
            router.push("/");
            return;
        }

        if (user?.profile) {
            setBio(user.profile.bio || "");
            setCollege(user.profile.college || "");
            setBranch(user.profile.branch || "");
            setYear(user.profile.year || "");
        }
    }, [user, isLoading, router]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError("");
        setIsSaving(true);

        try {
            await updateProfile({
                bio,
                college,
                branch,
                year,
                skills: user?.profile?.skills || [],
                interests: user?.profile?.interests || [],
                open_for: user?.profile?.open_for || []
            });

            router.push("/");
        } catch (err: any) {
            setProfileError(err.message || "Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading user data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Complete Your Profile</CardTitle>
                    <CardDescription>Tell us a bit about yourself to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label>College</Label>
                            <Input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="e.g. BIT Bangalore" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Branch</Label>
                                <Input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. CSE" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 3rd Year" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Bio</Label>
                            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="I am a developer..." />
                        </div>

                        {profileError && <p className="text-red-500 text-sm">{profileError}</p>}

                        <Button type="submit" className="w-full" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Complete Setup"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
