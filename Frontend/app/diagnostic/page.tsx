"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DiagnosticPage() {
    const [email, setEmail] = useState("nlaasya.04@gmail.com");
    const [password, setPassword] = useState("12345678");
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const checkBackend = async () => {
        setLoading(true);
        setResults(null);

        try {
            console.log("Testing login...");
            console.log("Email:", email);
            console.log("Password:", password);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            console.log("Response status:", response.status);

            const data = await response.json();
            console.log("Response data:", data);

            setResults({
                status: response.status,
                ok: response.ok,
                data: data,
            });
        } catch (error: any) {
            console.error("Error:", error);
            setResults({
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Login Diagnostic Tool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button onClick={checkBackend} disabled={loading} className="w-full">
                        {loading ? "Testing..." : "Test Login"}
                    </Button>

                    {results && (
                        <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                            <h3 className="font-bold mb-2">Result:</h3>
                            <pre className="text-xs overflow-auto">
                                {JSON.stringify(results, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
                        <p className="font-semibold mb-2">Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Click "Test Login" button</li>
                            <li>Check the result below</li>
                            <li>Open browser console (F12) to see detailed logs</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
