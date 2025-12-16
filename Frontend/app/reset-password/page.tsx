"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/lib/apiClient";

import { Suspense } from 'react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setError("Invalid reset link. Please check your email and try again.");
        }
    }, [token, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!token || !email) {
            setError("Missing token or email");
            return;
        }

        setIsLoading(true);

        try {
            const res = await resetPassword(email, token, password);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#191f1d] flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <KeyRound className="h-6 w-6 text-gray-900" />
                    </div>
                </div>

                <Card className="bg-white shadow-xl border-none rounded-2xl overflow-hidden">
                    <CardHeader className="space-y-2 text-center pt-8 pb-4 px-8">
                        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
                            Set New Password
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 pt-4">
                        {success ? (
                            <div className="space-y-6 text-center">
                                <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                                    <p className="font-medium">Password reset successfully!</p>
                                    <p className="text-sm mt-1">You can now valid log in with your new password.</p>
                                </div>
                                <Button
                                    className="w-full bg-black hover:bg-gray-800 text-white"
                                    onClick={() => router.push("/login")}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">New Password</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-black focus:border-black"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">Confirm Password</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-black focus:border-black"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-black hover:bg-gray-600 text-white hover:text-white h-11 rounded-lg font-medium"
                                    disabled={isLoading || !token || !email}
                                >
                                    {isLoading ? "Resetting..." : "Reset Password"}
                                </Button>

                                <div className="mt-8 text-center">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
