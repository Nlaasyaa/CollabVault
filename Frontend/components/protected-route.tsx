"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export function ProtectedRoute({ children, requireProfile = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (requireProfile && !user?.profile) {
      router.push("/profile");
    }
  }, [isAuthenticated, isLoading, user, requireProfile, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireProfile && !user?.profile) {
    return null;
  }

  return <>{children}</>;
}
