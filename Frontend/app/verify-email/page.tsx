
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const { setAuthTokens } = useAuth();

    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token || !email) {
            setStatus("error");
            setMessage("Invalid verification link.");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/verify-email?token=${token}&email=${email}`);
                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage("Email verified successfully! Redirecting to setup...");

                    // Auto Login if tokens present in response
                    if (data.accessToken) {
                        // Manually set tokens in context/storage
                        setAuthTokens(data.accessToken, data.refreshToken);

                        // Redirect to onboarding (profile creation)
                        setTimeout(() => {
                            router.push("/onboarding");
                        }, 1500);
                    } else {
                        // Fallback in case tokens aren't sent (shouldn't happen with updated backend)
                        setTimeout(() => router.push("/login"), 2000);
                    }

                } else {
                    setStatus("error");
                    setMessage(data.error || "Verification failed.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("Something went wrong. Please try again.");
            }
        };

        verify();
    }, [token, email, router, setAuthTokens]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Email Verification</CardTitle>
                <CardDescription>
                    {status === "verifying" && "Verifying your email..."}
                    {status === "success" && "Verification Complete"}
                    {status === "error" && "Verification Failed"}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {status === "verifying" && (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {status === "success" && (
                    <div className="text-center space-y-4">
                        <p className="text-green-600">{message}</p>
                        <Button onClick={() => router.push("/onboarding")} className="w-full">
                            Complete Setup
                        </Button>
                    </div>
                )}

                {status === "error" && (
                    <div className="text-center space-y-4">
                        <p className="text-red-600">{message}</p>
                        <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                            Back to Login
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
