"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface User {
  id: string;
  email: string;
  role?: string;
  phone_number?: string;
  display_name: string;
  profile?: {
    college: string;
    branch: string;
    year: string;
    bio: string;
    skills: string[];
    interests: string[];
    open_for: string[];
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signup: (email: string, display_name: string, password: string, additionalData?: any) => Promise<void>;
  login: (email_or_username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: User["profile"] & { display_name?: string }) => void;
  resendVerification: (email: string) => Promise<void>;
  setAuthTokens: (accessToken: string, refreshToken?: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.ok) {
        const profileData = await res.json();
        setUser({
          id: profileData.user_id,
          email: profileData.email || "",
          role: profileData.role || "user",
          phone_number: profileData.phone_number || "",
          display_name: profileData.display_name || "User",
          profile: {
            college: profileData.college,
            branch: profileData.branch,
            year: profileData.year,
            bio: profileData.bio,
            skills: Array.isArray(profileData.skills) ? profileData.skills : [],
            interests: Array.isArray(profileData.interests) ? profileData.interests : [],
            open_for: (() => {
              try {
                if (!profileData.open_for) return [];
                if (Array.isArray(profileData.open_for)) return profileData.open_for;
                const parsed = JSON.parse(profileData.open_for);
                return Array.isArray(parsed) ? parsed : [parsed];
              } catch (e) {
                return profileData.open_for ? [profileData.open_for] : [];
              }
            })(),
          }
        });
      } else {
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, display_name: string, password: string, additionalData: any = {}) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, display_name, password, ...additionalData }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Signup failed");
    }
    // No auto-login. Flow stops here, UI shows verification message.
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Invalid credentials");
      }

      const data = await res.json();
      // Backend returns { accessToken, refreshToken, user }

      localStorage.setItem("token", data.accessToken);
      setToken(data.accessToken);

      // We can also set user directly from login response if it matches structure, 
      // but keeping fetchUserProfile for consistency with "me" endpoint is fine.
      await fetchUserProfile(data.accessToken);
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const resendVerification = async (email: string) => {
    const res = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to resend verification");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/landing';
    }
  };

  const updateProfile = async (data: User["profile"] & { display_name?: string }) => {
    if (!token) return;

    try {
      const { display_name, ...profile } = data;
      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          display_name: display_name || user?.display_name,
          ...profile
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      // Update local state
      if (user) {
        setUser({
          ...user,
          display_name: display_name || user.display_name,
          profile: profile
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const setAuthTokens = (accessToken: string, refreshToken?: string) => {
    localStorage.setItem("token", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    setToken(accessToken);
    fetchUserProfile(accessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signup,
        login,
        logout,
        updateProfile,
        resendVerification,
        setAuthTokens,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
