/**
 * User Management API
 * Handles user CRUD operations and role management
 */
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../integration/supabase/types/database';
import { User, FrontendUser, UserRole, UserStatus } from '../../integration/supabase/types';
import { supabaseAdmin } from '../../integration/supabase/admin-client';
import { profileToFrontendUser } from "./utils";
import { typedSupabaseQuery, safeTypeCast } from "./supabase-helpers";

// Simple string similarity function for role matching
function stringSimilarity(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  // Exact match gets highest score
  if (aLower === bLower) return 1;
  
  // Check if one contains the other
  if (aLower.includes(bLower)) return 0.8;
  if (bLower.includes(aLower)) return 0.8;
  
  // Count matching characters
  let matches = 0;
  const maxLength = Math.max(aLower.length, bLower.length);
  
  for (let i = 0; i < Math.min(aLower.length, bLower.length); i++) {
    if (aLower[i] === bLower[i]) matches++;
  }
  
  return matches / maxLength;
}

/**
 * Fetch all users from profiles table
 */
export const fetchUsers = async (): Promise<FrontendUser[]> => {
  console.log(
    "🔍 Fetching users from profiles table...",
    new Date().toISOString()
  );

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser();
  console.log("🔐 Auth status:", {
    user: user?.email || "Not authenticated",
    authError,
  });

  const { data: profilesData, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("email", { ascending: true }) as { data: any[], error: any };

  console.log("📋 Profiles query result:", {
    count: profilesData?.length || 0,
    error: profilesError,
  });

  if (profilesError) {
    console.error("❌ Error fetching profiles:", profilesError);
    return [];
  }

  if (profilesData && profilesData.length > 0) {
    console.log(`✅ Found ${profilesData.length} profiles`);
    return profilesData.map(profileToFrontendUser);
  }

  console.log("⚠️ No profiles found");
  return [];
};

/**
 * Fetch a single user by ID from profiles table
 */
export const fetchUserById = async (id: string): Promise<FrontendUser> => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single() as { data: any, error: any };

  if (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return profileToFrontendUser(data as Profile);
};

/**
 * Fetch users by role
 * @param role User role to filter by
 * @returns Promise with array of users
 */
export const fetchUsersByRole = async (
  role?: UserRole | null
): Promise<FrontendUser[]> => {
  // If role is null or undefined, fetch all users instead of filtering by role
  let query = supabaseAdmin
    .from("profiles")
    .select("*")
    .order("email", { ascending: true }); // Using email instead of name which doesn't exist

  // Only apply role filter if role is provided and not null
  if (role) {
    query = query.eq("role", role);
  }

  const { data, error } = await query as { data: any[], error: any };

  if (error) {
    console.error(`Error fetching users with role ${role || "all"}:`, error);
    throw new Error(error.message);
  }

  return (data as User[]).map(mapDatabaseUserToFrontend);
};

/**
 * Fetch users by department
 * @param department Department to filter by
 * @returns Promise with array of users
 */
export const fetchUsersByDepartment = async (
  department: string
): Promise<FrontendUser[]> => {
  // Fetch directly from profiles table since department is stored there
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("department", department)
    .order("email", { ascending: true }) as { data: any[], error: any };

  if (error) {
    console.error(`Error fetching users in department ${department}:`, error);
    throw new Error(error.message);
  }

  return (data as User[]).map(mapDatabaseUserToFrontend);
};

/**
 * Fetch users by status
 * @param status User status to filter by
 * @returns Promise with array of users
 */
export const fetchUsersByStatus = async (
  status: UserStatus
): Promise<FrontendUser[]> => {
  // Fetch from profiles table and filter by status
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("status", status)
    .order("email", { ascending: true }) as { data: any[], error: any };

  if (error) {
    console.error(`Error fetching users with status ${status}:`, error);
    throw new Error(error.message);
  }

  return (data as User[]).map(mapDatabaseUserToFrontend);
};

/**
 * Create a new user
 * @param user User data to create
 * @returns Promise with created user data
 */
export const createUser = async (user: FrontendUser): Promise<FrontendUser> => {
  // Map role to valid enum values until we remove the enum constraint
  const validEnumRoles = [
    "admin",
    "manager",
    "staff",
    "tenant",
    "driver",
    "maintenance",
    "guest",
  ];
  let userRole = "staff"; // default fallback

  // Check if the role exists  // Find roles that match the given role name
  const { data: roles, error: rolesError } = await supabaseAdmin
    .from("roles")
    .select("*")
    .ilike("name", `%${user.role}%`) as { data: any[], error: any };

  if (roles && roles.length > 0) {
    // Sort roles by name similarity to the given role name
    const sortedRoles = [...roles].sort((a: any, b: any) => {
      const aSimilarity = stringSimilarity(a.name.toLowerCase(), user.role.toLowerCase());
      const bSimilarity = stringSimilarity(b.name.toLowerCase(), user.role.toLowerCase());
      return bSimilarity - aSimilarity;
    });

    userRole = sortedRoles[0].name;
  }

  console.log(`Role mapping: ${user.role} -> ${userRole}`);

  // Convert frontend user to database format for public.users table
  const dbUser: {
    id: string;
    email: string;
    is_active: boolean;
    last_login: string | null;
    name: string;
    department: string | null;
    role?: string;
  } = {
    id: user.id, // Use the provided user ID (from auth)
    email: user.email,
    is_active: user.status === "active",
    last_login: user.lastActive || null,
    name: user.name || "",
    department: user.department || null,
  };

  // Check if user already exists in users table
  const { data: existingUser, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single() as { data: any, error: any };

  let data;
  if (userError && userError.code !== "PGRST116") {
    console.error("Error checking existing user:", userError);
  }

  if (!existingUser) {
    // Create the user record in public.users using admin client
    // Use helper function to safely type the Supabase query
    const { data: insertData, error: insertError } = await typedSupabaseQuery<User>(
      supabaseAdmin
        .from("users")
        .insert([dbUser] as any)
        .select()
        .single()
    );

    if (insertError) {
      console.error("Error creating user:", insertError);
      throw new Error(insertError.message);
    }
    data = safeTypeCast<any, User>(insertData);
  } else {
    console.log("User already exists in users table:", user.id);
    // Update the existing user with new data
    // @ts-ignore - Bypass strict type checking for Supabase query
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("users")
      // @ts-ignore - Bypass strict type checking for Supabase update
      .update({
        email: dbUser.email,
        is_active: dbUser.is_active,
        name: dbUser.name,
        department: dbUser.department,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating existing user:", updateError);
      throw new Error(updateError.message);
    }
    data = updatedUser;
  }

  // Check if profile already exists before creating
  const { data: existingProfile, error: profileCheckError } =
    await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", data.id)
      .single() as { data: any, error: any };

  if (profileCheckError && profileCheckError.code !== "PGRST116") {
    console.error("Error checking existing profile:", profileCheckError);
  }

  if (!existingProfile) {
    // Create the profile record in public.profiles using admin client
    // Use helper function to safely type the Supabase query
    const { error: profileError } = await typedSupabaseQuery<any>(
      supabaseAdmin
        .from("profiles")
        .insert(safeTypeCast<{
          id: string,
          email: string,
          full_name: string,
          status: string,
          user_id: string
        }, any>({
          id: data.id, // Use id as primary key that references auth.users(id)
          email: user.email, // Required field
          full_name: user.name || user.email.split("@")[0], // Fallback to email username
          status:
            user.status === "active"
              ? "active"
              : user.status === "inactive"
              ? "inactive"
              : "active", // Ensure valid status
          user_id: data.id, // Add user_id field
        }))
    );

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Don't throw here, as the user was created successfully
      // Just log the error and continue
    }
  } else {
    console.log("Profile already exists for user:", data.id);
    // Optionally update the existing profile with new data
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      // @ts-ignore - Bypass strict type checking for Supabase update
      .update({
        full_name: user.name || user.email.split("@")[0],
        status:
          user.status === "active"
            ? "active"
            : user.status === "inactive"
            ? "inactive"
            : "active",
        role_id: userRole ? parseInt(userRole.toString()) : null, // Update role in profile
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (updateError) {
      console.error("Error updating existing profile:", updateError);
    }
  }

  // Role is now stored directly in users table, no need for separate assignment

  return mapDatabaseUserToFrontend(data as User);
};

/**
 * Update an existing user
 * @param id User ID
 * @param user User data to update
 * @returns Promise with updated user data
 */
export const updateUser = async (
  id: string,
  user: Partial<Omit<FrontendUser, "id">>
): Promise<FrontendUser> => {
  // Convert frontend user to database format - only use columns that exist in users table
  const dbUser: {
    email?: string;
    role?: string;
    is_active?: boolean;
    last_login?: string | null;
    department?: string | null;
    permissions?: any;
  } = {};

  // Fields that go in the users table
  if (user.email !== undefined) dbUser.email = user.email;
  if (user.role !== undefined) dbUser.role = user.role;
  if (user.status !== undefined) dbUser.is_active = user.status === "active";
  if (user.lastActive !== undefined) dbUser.last_login = user.lastActive;
  if (user.department !== undefined) dbUser.department = user.department;
  if (user.permissions !== undefined) dbUser.permissions = safeTypeCast<any, any>(user.permissions);

  // Extract profile-related fields
  const profileUpdate: {
    first_name?: string;
    last_name?: string;
    bio?: string;
    avatar_url?: string;
  } = {};
  let hasProfileUpdates = false;

  if (user.name !== undefined) {
    profileUpdate.first_name = user.name.split(" ")[0] || "";
    profileUpdate.last_name = user.name.split(" ").slice(1).join(" ") || "";
    hasProfileUpdates = true;
  }
  if (user.bio !== undefined) {
    profileUpdate.bio = user.bio;
    hasProfileUpdates = true;
  }
  if (user.avatar !== undefined) {
    profileUpdate.avatar_url = user.avatar;
    hasProfileUpdates = true;
  }

  // Update profile table - only update fields that are provided
  const profileUpdates: {
    full_name?: string;
    department?: string | null;
    status?: string;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString()
  };
  if (user.name !== undefined) profileUpdates.full_name = user.name;
  if (user.department !== undefined)
    profileUpdates.department = user.department;
  if (user.status !== undefined) profileUpdates.status = user.status;

  const { data, error } = await typedSupabaseQuery<User>(
    supabaseAdmin
      .from("profiles")
      // @ts-ignore - Bypass strict type checking for Supabase update
      .update(profileUpdates)
      .eq("id", id)
      .select()
      .single()
  );

  if (error) {
    console.error(`Error updating user profile with ID ${id}:`, error);
    throw new Error(error.message);
  }

  // Update profile if we have profile updates
  if (hasProfileUpdates) {
    // Check if profile exists - check by ID directly since id and user_id should be the same
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single() as { data: any, error: any };

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error(
        `Error checking profile for user ${id}:`,
        profileCheckError
      );
      // Don't throw, just log the error
    }

    if (existingProfile) {
      // Update existing profile
      console.log(`Updating existing profile for user ${id}`);
      // Use helper function to safely type the Supabase query
      const { error: updateError } = await typedSupabaseQuery<any>(
        supabaseAdmin
          .from("profiles")
          // @ts-ignore - Bypass strict type checking for Supabase update
          .update(profileUpdate as any)
          .eq("id", id)
      );

      if (updateError) {
        console.error(`Error updating profile for user ${id}:`, updateError);
        // Don't throw, just log the error
      }
    } else {
      // Create new profile with required fields
      console.log(`Creating new profile for user ${id}`);
      const profileData = {
        ...profileUpdate,
        id: id,
        user_id: id,
        email: user.email || (data && 'email' in data ? data.email as string : ''), // Use email from user update or existing data
        status: "active", // Required field with valid constraint value
        full_name: user.name || (user.email || (data && 'email' in data ? data.email as string : '')).split("@")[0], // Required field
      };

      // Use helper function to safely type the Supabase query
      const { error: insertError } = await typedSupabaseQuery<any>(
        supabaseAdmin
          .from("profiles")
          // @ts-ignore - Bypass strict type checking for Supabase insert
          .insert(profileData)
      );

      if (insertError) {
        console.error(`Error creating profile for user ${id}:`, insertError);
        // Don't throw, just log the error
      }
    }
  }

  return mapDatabaseUserToFrontend(data as User);
};

/**
 * Delete a user
 * @param id User ID
 * @returns Promise with success status
 */
export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await typedSupabaseQuery<any>(
    supabaseAdmin.from("users").delete().eq("id", id)
  );

  if (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Update user status
 * @param id User ID
 * @param status New user status
 * @returns Promise with updated user data
 */
export const updateUserStatus = async (
  id: string,
  status: UserStatus
): Promise<FrontendUser> => {
  // Convert status to is_active boolean since status column doesn't exist
  const is_active = status === "active";

  // Use helper function to safely type the Supabase query
  const { data, error } = await typedSupabaseQuery<User>(
    supabaseAdmin
      .from("users")
      // @ts-ignore - Bypass strict type checking for Supabase update
      .update(safeTypeCast<{is_active: boolean}, any>({
        is_active,
      }))
      .eq("id", id)
      .select()
      .single()
  );

  if (error) {
    console.error(`Error updating status for user with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseUserToFrontend(data as User);
};

/**
 * Update user role
 * @param id User ID
 * @param role New user role
 * @returns Promise with updated user data
 */
export const updateUserRole = async (
  id: string,
  role: UserRole
): Promise<FrontendUser> => {
  // First get the role ID
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from("roles")
    .select("id")
    .eq("name", role)
    .single();

  if (roleError || !roleData) {
    throw new Error(`Role '${role}' not found`);
  }

  // Update role in profiles table instead of users table (users table doesn't have role column)
  // @ts-ignore - Bypass type checking for schema mismatch
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ role_id: roleData.id })
    .eq("user_id", id)
    .select(`
      *,
      role:roles(*)
    `)
    .single();

  if (error) {
    console.error(`Error updating role for user with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseUserToFrontend(data as User);
};
