"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

// Tell Next.js to render this page dynamically at request time
export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const next = searchParams.get("next") || "/";
        
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          setStatus("success");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMessage("No code provided in the URL");
        }
      } catch (error) {
        console.error("Error during auth callback:", error);
        setStatus("error");
        setMessage("Failed to verify your email. Please try again.");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-64px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Your email has been verified!"}
            {status === "error" && "Email verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          {status === "loading" && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
          {status === "success" && <CheckCircle2 className="h-16 w-16 text-green-500" />}
          {status === "error" && <XCircle className="h-16 w-16 text-destructive" />}
          
          <p className="text-center text-muted-foreground">
            {status === "loading" && "Please wait while we verify your email..."}
            {status === "success" && "You can now sign in with your credentials."}
            {status === "error" && message}
          </p>
        </CardContent>
        <CardFooter>
          {status !== "loading" && (
            <Button className="w-full" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 