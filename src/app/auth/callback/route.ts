import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/config";

/**
 * OAuth Callback Handler
 * Handles the OAuth redirect after Google sign-in
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page after successful authentication
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}

