"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";

import { LoginForm, SignupForm, SocialAuth } from "@/components/forms/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { useAuthStore } from "@/store";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState("login");
    const { clearDraft } = useAuthStore();
    const retentionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (activeTab === "signup") {
            if (retentionTimerRef.current) {
                clearTimeout(retentionTimerRef.current);
                retentionTimerRef.current = null;
            }
            return;
        }

        if (retentionTimerRef.current) {
            clearTimeout(retentionTimerRef.current);
        }

        retentionTimerRef.current = setTimeout(() => {
            clearDraft();
        }, 60_000);

        return () => {
            if (retentionTimerRef.current) {
                clearTimeout(retentionTimerRef.current);
                retentionTimerRef.current = null;
            }
        };
    }, [activeTab, clearDraft]);

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center px-4 sm:px-6 md:px-8 py-12">
            <div className="flex h-12 w-12 bg-primary rounded-2xl my-6 items-center justify-center text-primary-foreground font-black text-xl shadow-lg">
                <Landmark className="h-6 w-6" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-6">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                    <Suspense fallback={<div className="text-center py-6 text-sm">Loading sign in...</div>}>
                        <LoginForm />
                    </Suspense>
                </TabsContent>

                <TabsContent value="signup">
                    <SignupForm />
                </TabsContent>
            </Tabs>

            <div className="w-full mt-6">
                <SocialAuth />
            </div>

            <p className="px-6 text-center text-xs text-muted-foreground mt-6 leading-relaxed">
                By clicking continue, you agree to the{" "}
                <Link href="/terms" className="underline hover:text-foreground">
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-foreground">
                    Privacy Policy
                </Link>
                .
            </p>
        </div>
    );
}
