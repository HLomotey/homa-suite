import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, supabaseAdmin } from "@/integration/supabase/client";
import { getUserModules } from "@/hooks/role/modules-api";
import { NAVIGATION_MODULES } from "@/config/navigation-modules";

// Types for our authentication system
export interface ExternalStaffMember {
  id: string;
  email: string;
  full_name: string;
  position_status: string;
  is_active: boolean;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_system_role: boolean;
  is_active: boolean;
}

interface Permission {
  id: string;
  permission_key: string;
  display_name: string;
  description: string;
}

export interface AuthUser {
  // Supabase auth user
  user: User;
  session: Session;

  // Staff information
  externalStaff: ExternalStaffMember | null;

  // Management information (if applicable)
  profile: Profile | null;
  role: Role | null;
  permissions: Permission[];
  modules: string[];

  // User type
  userType: "general_staff" | "management" | null;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  hasPermission: (permissionKey: string) => boolean;
  hasModule: (moduleId: string) => boolean;
  hasRole: (roleName: string) => boolean;
  isManagement: () => boolean;
  isGeneralStaff: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate if email exists in external staff and is active
  const validateExternalStaffEmail = async (
    email: string
  ): Promise<ExternalStaffMember | null> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Use type assertion to avoid complex type inference
      const { data, error } = await (supabaseAdmin as any)
        .from("external_staff")
        .select("*")
        .eq('"PERSONAL E-MAIL"', normalizedEmail)
        .eq('"POSITION STATUS"', "A - Active")
        .maybeSingle();

      if (error) {
        console.error("Error validating external staff email:", error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: (data as any)["EMPLOYEE ID"] || "",
        email: (data as any)["PERSONAL E-MAIL"] || "",
        full_name: (data as any)["FULL NAME"] || "",
        position_status: (data as any)["POSITION STATUS"] || "",
        is_active: (data as any)["POSITION STATUS"] === "A - Active"
      };
    } catch (error) {
      console.error("Error in validateExternalStaffEmail:", error);
      return null;
    }
  };

  // Get user profile from profiles table
  const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error getting user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  };

  // Get user role
  const getUserRole = async (roleId: string): Promise<Role | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("roles")
        .select("*")
        .eq("id", roleId)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error getting user role:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserRole:", error);
      return null;
    }
  };

  // Get user permissions based on role
  const getUserPermissions = async (roleId: string): Promise<Permission[]> => {
    try {
      // Check if this is an admin role (system role with admin privileges)
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from("roles")
        .select("name, is_system_role")
        .eq("id", roleId)
        .single();

      if (roleError) {
        console.error("Error getting role info:", roleError);
        return [];
      }

      // If it's an admin role, return all permissions
      if (
        roleData &&
        ((roleData as any).name === "Admin" || (roleData as any).is_system_role)
      ) {
        const { data: allPermissions, error: permError } = await supabaseAdmin
          .from("permissions")
          .select(
            "id, permission_key, display_name, description"
          )
          .eq("is_active", true);

        if (permError) {
          console.error("Error getting all permissions for admin:", permError);
          return [];
        }

        return allPermissions || [];
      }

      // For non-admin roles, get specific permissions
      const { data, error } = await supabaseAdmin
        .from("role_permissions")
        .select(
          `
          permissions!inner (
            id,
            permission_key,
            display_name,
            description,
            module_id,
            action_id
          )
        `
        )
        .eq("role_id", roleId);

      if (error) {
        console.error("Error getting user permissions:", error);
        return [];
      }

      return data?.map((item: any) => item.permissions).filter(Boolean) || [];
    } catch (error) {
      console.error("Error in getUserPermissions:", error);
      return [];
    }
  };

  // Build complete user object
  const buildAuthUser = async (
    user: User,
    session: Session
  ): Promise<AuthUser> => {
    const email = user.email!;

    // Get external staff information
    const externalStaff = await validateExternalStaffEmail(email);

    // Get profile information (for management users)
    const profile = await getUserProfile(user.id);

    let role: Role | null = null;
    let permissions: Permission[] = [];
    let modules: string[] = [];
    let userType: "general_staff" | "management" | null = null;

    if (profile && profile.role_id) {
      // User is management - get modules based on role assignment
      role = await getUserRole(profile.role_id);
      permissions = await getUserPermissions(profile.role_id);

      try {
        modules = await getUserModules(user.id);
        console.log(`AuthContext: User ${user.email} has modules:`, modules);
      } catch (error) {
        console.error("AuthContext: Error getting user modules:", error);
        modules = [];
      }

      userType = "management";
    } else if (externalStaff) {
      // User is general staff - only maintenance, complaints (incident report), and profile modules
      const staffModules = ["properties", "complaints", "profile"];
      modules = staffModules.filter((moduleId) =>
        NAVIGATION_MODULES.some((navModule) => navModule.id === moduleId)
      );
      userType = "general_staff";
    }

    return {
      user,
      session,
      externalStaff,
      profile,
      role,
      permissions,
      modules,
      userType,
    };
  };

  // Sign in function
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();

      // First validate that the email exists in external staff
      const externalStaff = await validateExternalStaffEmail(normalizedEmail);
      if (!externalStaff) {
        return {
          success: false,
          error:
            "Email address not found in our staff directory. Please contact HR to verify your email address.",
        };
      }

      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data.user && data.session) {
        const authUser = await buildAuthUser(data.user, data.session);
        setCurrentUser(authUser);
        return { success: true };
      }

      return {
        success: false,
        error: "Sign in failed. Please try again.",
      };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();

      // Validate that email exists in external staff and is active
      const externalStaff = await validateExternalStaffEmail(normalizedEmail);
      if (!externalStaff) {
        return {
          success: false,
          error:
            "Email address not found in our staff directory. Please contact HR to verify your email address.",
        };
      }

      // Create user account using admin client to bypass email confirmation
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          full_name: externalStaff.full_name,
          external_staff_id: externalStaff.id,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Profile creation is handled by database trigger automatically
      // No manual profile creation needed for regular users

      return { success: true };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Refresh user data
  const refreshUserData = async (): Promise<void> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const authUser = await buildAuthUser(session.user, session);
        setCurrentUser(authUser);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setCurrentUser(null);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permissionKey: string): boolean => {
    if (!currentUser) return false;

    // Management users check permissions
    if (currentUser.userType === "management") {
      return currentUser.permissions.some(
        (p) => p.permission_key === permissionKey
      );
    }

    // General staff have limited default permissions
    if (currentUser.userType === "general_staff") {
      const generalStaffPermissions = [
        "dashboard:view",
        "profile:view",
        "profile:edit",
      ];
      return generalStaffPermissions.includes(permissionKey);
    }

    return false;
  };

  // Check if user has access to specific module
  const hasModule = (moduleId: string): boolean => {
    if (!currentUser) return false;
    return currentUser.modules.includes(moduleId);
  };

  // Check if user has specific role
  const hasRole = (roleName: string): boolean => {
    if (!currentUser || !currentUser.role) return false;
    return currentUser.role.name === roleName;
  };

  // Check if user is management
  const isManagement = (): boolean => {
    return currentUser?.userType === "management";
  };

  // Check if user is general staff
  const isGeneralStaff = (): boolean => {
    return currentUser?.userType === "general_staff";
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          if (session?.user) {
            const authUser = await buildAuthUser(session.user, session);
            setCurrentUser(authUser);
          } else {
            setCurrentUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session?.user) {
          const authUser = await buildAuthUser(session.user, session);
          setCurrentUser(authUser);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
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
    signIn,
    signUp,
    signOut,
    refreshUserData,
    hasPermission,
    hasModule,
    hasRole,
    isManagement,
    isGeneralStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
