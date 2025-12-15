"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { forgotPassword } from "@/lib/apiClient";

export default function LoginPage() {
  const { login, resendVerification, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Protect route - if already logged in, redirect to home
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowResend(false);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      const msg = err.message || "Login failed";
      setError(msg);
      // Backend says: "Please verify your email..."
      if (msg.toLowerCase().includes("verify")) {
        setShowResend(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus("sending");
    try {
      await resendVerification(email);
      setResendStatus("sent");
    } catch (err: any) {
      setResendStatus("error");
      setError(err.message || "Failed to resend");
    }
  };


  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");
    try {
      const res = await forgotPassword(forgotEmail);
      setForgotMessage(res.message || "Reset link sent!");
      // Don't close immediately so they can see the message
    } catch (err: any) {
      setForgotMessage(err.message || "Failed to send reset link");
    } finally {
      setForgotLoading(false);
    }
  };

  if (authLoading) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-[#191f1d] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <LogIn className="h-6 w-6 text-gray-900" />
          </div>
        </div>

        <Card className="bg-white shadow-xl border-none rounded-2xl overflow-hidden">
          <CardHeader className="space-y-2 text-center pt-8 pb-4 px-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-500">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-black focus:border-black"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:text-white"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                >
                  Remember me
                </label>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              {showResend && (
                <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 flex flex-col gap-2">
                  <p>Haven't received the email?</p>
                  {resendStatus === "sent" ? (
                    <span className="text-green-600 font-bold">Verification email sent!</span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResend}
                      disabled={resendStatus === "sending"}
                      className="border-yellow-200 hover:bg-yellow-100 text-yellow-900"
                    >
                      {resendStatus === "sending" ? "Sending..." : "Resend Verification Email"}
                    </Button>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-600 text-white hover:text-white h-11 rounded-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-black font-semibold hover:underline">
                Create one here
              </Link>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="forgot-email" className="text-sm font-medium">Email Address</label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            {forgotMessage && (
              <p className={`text-sm ${forgotMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}>
                {forgotMessage}
              </p>
            )}
            <DialogFooter className="sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowForgotModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
