"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, UserPlus } from 'lucide-react';

interface ProfileCardProps {
  profile: {
    id: string;
    display_name: string;
    college: string;
    branch: string;
    year: string;
    bio: string;
    skills: string[];
    interests: string[];
    open_for: string[];
  };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{profile.display_name}</CardTitle>
        <p className="text-sm text-slate-600">
          {profile.branch} • {profile.year}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">
            College
          </p>
          <p className="text-slate-900">{profile.college}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Bio</p>
          <p className="text-sm text-slate-700">{profile.bio}</p>
        </div>

        {profile.skills.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-2">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.interests.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-2">
              Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.open_for.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-2">
              Open For
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.open_for.map((item) => (
                <span
                  key={item}
                  className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus size={16} className="mr-2" />
            Connect
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <MessageCircle size={16} className="mr-2" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
