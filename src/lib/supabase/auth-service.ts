import { supabase } from "./config";
import {
  AuthError,
  AuthResponse,
  Session,
  User,
} from "@supabase/supabase-js";

/**
 * Authentication Service
 * Clean service layer for Supabase authentication operations
 */

// Type definitions for better type safety
export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Sign up a new user with email and password
 * @param params - User registration details
 * @returns Authentication result
 */
export const signUpWithEmail = async ({
  email,
  password,
  fullName,
}: SignUpParams): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          display_name: fullName,
        },
      },
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: formatAuthError(error),
      };
    }

    // Store tokens in cookies for server-side access
    if (data.session) {
      storeAuthTokensInCookies(data.session);
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
};

/**
 * Sign in an existing user with email and password
 * @param params - User login credentials
 * @returns Authentication result
 */
export const signInWithEmail = async ({
  email,
  password,
}: SignInParams): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: formatAuthError(error),
      };
    }

    // Store tokens in cookies for server-side access
    if (data.session) {
      storeAuthTokensInCookies(data.session);
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
};

/**
 * Sign in with Google OAuth
 * @returns Authentication response
 */
export const signInWithGoogle = async (): Promise<{
  error: AuthError | null;
}> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: formatAuthError(error) };
    }

    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
};

/**
 * Sign out the current user
 * @returns Error if sign out fails
 */
export const signOutUser = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: formatAuthError(error) };
    }

    // Clear auth cookies
    storeAuthTokensInCookies(null);

    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
};

/**
 * Get the current authenticated user
 * @returns Current user or null
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Get the current session
 * @returns Current session or null
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting current session:", error);
    return null;
  }
};

/**
 * Reset password for a user
 * @param email - User's email address
 * @returns Error if reset fails
 */
export const resetPassword = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { error: formatAuthError(error) };
    }

    return { error: null };
  } catch (error) {
    return { error: error as AuthError };
  }
};

/**
 * Format and enhance Supabase auth errors with user-friendly messages
 * @param error - Supabase auth error
 * @returns Formatted error
 */
const formatAuthError = (error: AuthError): AuthError => {
  const errorMessages: Record<string, string> = {
    "Invalid login credentials": "Invalid email or password",
    "Email not confirmed": "Please verify your email address",
    "User already registered": "An account with this email already exists",
    "Password should be at least 6 characters":
      "Password must be at least 6 characters long",
    "Unable to validate email address: invalid format":
      "Please enter a valid email address",
    "Signup requires a valid password": "Please enter a valid password",
  };

  // Check if we have a custom message for this error
  const customMessage = errorMessages[error.message];

  if (customMessage) {
    // Modify the error object directly to preserve all properties including __isAuthError
    (error as any).message = customMessage;
    return error;
  }

  return error;
};

/**
 * Store auth tokens in cookies for server-side access
 */
export const storeAuthTokensInCookies = (session: Session | null) => {
  if (typeof window === "undefined") return;

  if (session) {
    // Store tokens in cookies
    document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
    document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    // Clear cookies on sign out
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

/**
 * Subscribe to auth state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (
  callback: (user: User | null, session: Session | null) => void
) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    // Store tokens in cookies for server-side access
    storeAuthTokensInCookies(session);
    callback(session?.user ?? null, session);
  });

  return () => subscription.unsubscribe();
};

