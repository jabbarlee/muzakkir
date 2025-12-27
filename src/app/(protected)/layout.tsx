"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // TODO: Replace with Firebase auth check
    // Example Firebase integration:
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   if (user) {
    //     setIsAuthenticated(true);
    //   } else {
    //     router.push("/signin");
    //   }
    //   setIsLoading(false);
    // });
    // return () => unsubscribe();

    // Temporary: Check for authentication (replace with Firebase)
    const checkAuth = async () => {
      try {
        // Placeholder: Replace this with your Firebase auth check
        // For now, we'll check if there's a session/token
        const hasSession = false; // Replace with actual auth check

        if (!hasSession) {
          router.push("/signin");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/signin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Loading state
  if (isLoading) {
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
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
