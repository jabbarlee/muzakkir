"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dictionary lookups are stable - cache for 30 minutes
            staleTime: 30 * 60 * 1000,
            // Keep cached data for 1 hour
            gcTime: 60 * 60 * 1000,
            // Don't retry on failure for dictionary lookups
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}




