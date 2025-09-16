import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { useInactivityTimer } from "@/hooks/auth/useInactivityTimer";

// Import modular authentication components
import {
  AuthUser,
  AuthContextType,
  AuthProviderProps,
  AUTH_CONSTANTS,
} from "./auth/types";
import {
  validateSession,
  updateLastActivity,
  clearLastActivity,
} from "./auth/sessionValidation";
import { validateUserAccess } from "./auth/userValidation";
import {
  buildAuthUser,
  hasPermission,
  hasModule,
  hasRole,
  isManagement,
  isGeneralStaff,
} from "./auth/authUtils";
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
} from "./auth/authOperations";

// Export types for external use
export type { AuthUser, ExternalStaffMember } from "./auth/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle automatic logout due to inactivity
  const handleInactivityLogout = async () => {
    console.log("User inactive for 5 minutes, logging out...");
    if (currentUser) {
      console.log(`Logging out ${currentUser.user.email} due to inactivity`);
      await authSignOut(setCurrentUser);
      // You could add a toast notification here
      // toast.info('You have been logged out due to inactivity');
    }
  };

  // Initialize inactivity timer with activity tracking
  const { resetTimer } = useInactivityTimer({
    timeout: AUTH_CONSTANTS.INACTIVITY_TIMEOUT,
    onTimeout: handleInactivityLogout,
    isActive: !!currentUser && !loading, // Only active when user is logged in and not loading
  });

  // Track user activity in localStorage
  useEffect(() => {
    if (currentUser) {
      const handleActivity = () => {
        updateLastActivity();
        resetTimer();
      };

      // List of events that indicate user activity
      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
        "click",
        "keydown",
      ];

      // Add event listeners
      events.forEach((event) => {
        document.addEventListener(event, handleActivity, true);
      });

      // Set initial activity timestamp
      updateLastActivity();

      // Cleanup function
      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, handleActivity, true);
        });
      };
    }
  }, [currentUser, resetTimer]);

  // Wrapper functions that use the modular auth operations
  const handleSignIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    return authSignIn(email, password, setCurrentUser, setLoading);
  };

  const handleSignUp = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    return authSignUp(email, password, setLoading);
  };

  const handleSignOut = async (): Promise<void> => {
    clearLastActivity();
    return authSignOut(setCurrentUser);
  };

  // Refresh user data with session validation
  const refreshUserData = async (): Promise<void> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Validate session before refreshing user data
        const isValidSession = await validateSession(session);
        if (isValidSession) {
          const authUser = await buildAuthUser(session.user, session);
          setCurrentUser(authUser);
        } else {
          console.log("Invalid session during refresh, signing out");
          await supabase.auth.signOut();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      await supabase.auth.signOut();
      setCurrentUser(null);
    }
  };

  // Initialize auth state with proper session validation
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          if (session?.user) {
            // Validate the session before building auth user
            const isValidSession = await validateSession(session);

            if (isValidSession) {
              console.log("Valid session found, building auth user");
              const authUser = await buildAuthUser(session.user, session);
              setCurrentUser(authUser);
            } else {
              console.log("Invalid session detected, signing out");
              await supabase.auth.signOut();
              setCurrentUser(null);
            }
          } else {
            console.log("No session found");
            setCurrentUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          // Clear any stale auth state on error
          await supabase.auth.signOut();
          setCurrentUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with session validation
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        console.log("Auth state change event:", event);

        if (session?.user) {
          // Skip SIGNED_IN events as they're handled by signIn function
          if (event === "SIGNED_IN") {
            console.log(
              "Skipping SIGNED_IN event - handled by signIn function"
            );
            return;
          }

          // For TOKEN_REFRESHED and other events, validate session first
          if (event === "TOKEN_REFRESHED") {
            const isValidSession = await validateSession(session);
            if (!isValidSession) {
              console.log(
                "Session validation failed after token refresh, signing out"
              );
              await supabase.auth.signOut();
              setCurrentUser(null);
              setLoading(false);
              return;
            }
          }

          console.log(`Auth state change: ${event} - rebuilding user data`);
          const authUser = await buildAuthUser(session.user, session);
          setCurrentUser(authUser);
          setLoading(false);
        } else {
          console.log(`Auth state change: ${event} - clearing user data`);
          setCurrentUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshUserData,
    hasPermission: (permissionKey: string) =>
      hasPermission(currentUser, permissionKey),
    hasModule: (moduleId: string) => hasModule(currentUser, moduleId),
    hasRole: (roleName: string) => hasRole(currentUser, roleName),
    isManagement: () => isManagement(currentUser),
    isGeneralStaff: () => isGeneralStaff(currentUser),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
