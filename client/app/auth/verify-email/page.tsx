"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function VerifyEmailContent() {
  const { verifyEmail } = useAuth();
  const searchParams = useSearchParams();
  const key = searchParams.get("key");

  useEffect(() => {
    if (key) {
      verifyEmail.mutate({ key });
    }
  }, [key]);

  if (!key) {
    return (
      <Card className="border-none shadow-none bg-transparent text-center">
        <CardHeader className="px-0">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
          <CardDescription>No verification key was provided.</CardDescription>
        </CardHeader>
        <CardFooter className="px-0 pt-6">
          <Button asChild className="w-full">
            <a href="/auth/login">Back to Sign In</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (verifyEmail.isPending) {
    return (
      <Card className="border-none shadow-none bg-transparent text-center py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <CardTitle>Verifying your email...</CardTitle>
        <CardDescription>
          Please wait a moment while we confirm your account.
        </CardDescription>
      </Card>
    );
  }

  if (verifyEmail.isError) {
    return (
      <Card className="border-none shadow-none bg-transparent text-center">
        <CardHeader className="px-0">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
          <CardDescription>
            The verification link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardFooter className="px-0 pt-6">
          <Button asChild className="w-full">
            <a href="/auth/register">Try Registering Again</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (verifyEmail.isSuccess) {
    return (
      <Card className="border-none shadow-none bg-transparent text-center">
        <CardHeader className="px-0">
          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
          <CardDescription>
            Your email has been successfully verified. You can now access all features.
          </CardDescription>
        </CardHeader>
        <CardFooter className="px-0 pt-6">
          <Button asChild className="w-full">
            <a href="/auth/login">Sign In Now</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
