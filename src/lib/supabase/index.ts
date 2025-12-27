/**
 * Supabase Module Exports
 * Central export point for all Supabase-related functionality
 */

// Configuration
export { supabase } from "./config";

// Authentication Service
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  getCurrentUser,
  getCurrentSession,
  resetPassword,
  onAuthStateChange,
} from "./auth-service";

export type { SignUpParams, SignInParams, AuthResult } from "./auth-service";

// Authentication Context
export { AuthProvider, useAuth } from "./auth-context";

