import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
