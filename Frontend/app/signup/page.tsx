"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Protect route - if already logged in, redirect to home
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const [display_name, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Profile State
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  // Intentionally leaving bio empty as it's not in the requested form snippet, 
  // but preserving variable for compatibility if needed.
  const [bio] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const BRANCHES = [
    "Computer Science",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Electronics",
    "Biotechnology",
    "Chemical Engineering",
    "Aerospace Engineering",
  ];

  const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  // Extract domain helper
  const getDomain = (email: string) => {
    const parts = email.split('@');
    return parts.length > 1 ? parts[1] : null;
  };

  const domain = getDomain(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!college || !branch || !year || !phone) {
      setError("Please fill in all required fields (College, Branch, Year, Phone)");
      return;
    }

    // Client-side domain check (optional, but good UX)
    if (!domain) {
      setError("Invalid email format");
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, display_name, password, { college, branch, year, bio, phone_number: phone });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#191f1d] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl border-none rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4 px-8">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Signup Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center px-8 pb-8 pt-4">
            <p className="text-gray-600">
              We have sent a verification email to <strong className="text-gray-900">{email}</strong>.
            </p>
            <p className="text-sm text-gray-500">
              Please check your inbox (and spam folder) and click the verification link to activate your account.
            </p>
            <Button onClick={() => router.push("/login")} className="w-full bg-black hover:bg-gray-800 text-white h-11 rounded-lg">
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#191f1d] flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-gray-900" />
          </div>
        </div>

        <Card className="bg-white shadow-xl border-none rounded-2xl overflow-hidden">
          <CardHeader className="space-y-2 text-center pt-8 pb-4 px-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-500">Enter your details to create your account</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* College and Branch Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Your display name"
                    value={display_name}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-black focus:border-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    College <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Your college name"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Select a branch</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Select your year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Email  <span className="text-red-500">*</span> </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-black focus:border-black"
                />
                {domain && (
                  <p className="text-xs text-gray-500 font-medium">
                    Registering with: <span className="text-gray-900">{domain}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Phone Number <span className="text-red-500">*</span></label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-black focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Password <span className="text-red-500">*</span></label>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-black focus:border-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Confirm Password <span className="text-red-500">*</span></label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
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
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-semibold hover:underline">
                Sign in here
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
      </div >
    </div>
  );
}
