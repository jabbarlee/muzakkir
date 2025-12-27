"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase";

/**
 * Protected Layout
 * Ensures only authenticated users can access routes within this group
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect to signin if user is not authenticated
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect is happening)
  if (!user) {
    return null;
  }

  // Render protected content (no layout styling, handled by individual pages)
  return <>{children}</>;
}
