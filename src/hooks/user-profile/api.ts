/**
 * Clean User Profile API functions for Supabase integration
 * Simplified version that works with current database schema (profiles table only)
 */

import { supabase } from "../../integration/supabase/client";
import { supabaseAdmin } from "../../integration/supabase/admin-client";
import {
  FrontendUser,
  Profile,
  User,
  UserRole,
  UserStatus,
  UserPreferences,
  UserActivity,
  UserWithProfile,
  mapDatabaseUserToFrontend,
  mapDatabaseProfileToProfile,
} from "../../integration/supabase/types";
import { typedSupabaseQuery, safeTypeCast } from "./supabase-helpers";


/**
 * Convert Profile data to FrontendUser format
 */
const profileToFrontendUser = (profile: Profile): FrontendUser => ({
  id: profile.id,
  name: profile.full_name || profile.email.split("@")[0],
  email: profile.email,
  role: (profile.role_id ? "admin" : "staff") as UserRole,
  department: "", // Not available in current schema
  status: (profile.status === "active"
    ? "active"
    : profile.status === "inactive"
    ? "inactive"
    : "pending") as UserStatus,
  lastActive: undefined,
  permissions: [],
  createdAt: profile.created_at,
});

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
  } = await supabase.auth.getUser();
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
 * Fetch a user with their profile information
 */
export const fetchUserWithProfile = async (
  id: string
): Promise<UserWithProfile> => {
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single() as { data: any, error: any };

  if (profileError) {
    console.error(`Error fetching profile with ID ${id}:`, profileError);
    throw new Error(profileError.message);
  }

  const user = profileToFrontendUser(profileData as Profile);
  const profile = mapDatabaseProfileToProfile(profileData as Profile);

  return {
    ...user,
    profile,
  };
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

  // Check if the role exists in roles table and map to valid enum
  const { data: roleData } = await supabaseAdmin
    .from("roles")
    .select("name")
    .eq("name", user.role)
    .single() as { data: any, error: any };

  if (roleData && 'name' in roleData && roleData.name && validEnumRoles.includes(roleData.name)) {
    userRole = roleData.name;
  } else if (validEnumRoles.includes(user.role)) {
    userRole = user.role;
  }

  console.log(`Role mapping: ${user.role} -> ${userRole}`);

  // Convert frontend user to database format for public.users table
  const dbUser = {
    id: user.id, // Use the provided user ID (from auth)
    email: user.email,
    is_active: user.status === "active",
    last_login: user.lastActive || null,
    name: user.name || "",
    department: user.department || null,
  };

  // Check if user already exists in users table
  const { data: existingUser, error: userCheckError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single() as { data: any, error: any };

  let data;
  if (userCheckError && userCheckError.code !== "PGRST116") {
    console.error("Error checking existing user:", userCheckError);
  }

  if (!existingUser) {
    // Create the user record in public.users using admin client
    const { data: newUser, error } = await typedSupabaseQuery<User>(
      supabaseAdmin
        .from("users")
        .insert(dbUser as any)
        .select()
        .single()
    );

    if (error) {
      console.error("Error creating user:", error);
      throw new Error(error.message);
    }
    data = newUser;
  } else {
    console.log("User already exists in users table:", user.id);
    // Update the existing user with new data
    // @ts-ignore - Bypass strict type checking for Supabase query
    const { data: updatedUser, error: updateError } = await typedSupabaseQuery<User>(
      supabaseAdmin
        .from("users")
        // @ts-ignore - Bypass strict type checking for Supabase update
        .update({
          email: dbUser.email,
          is_active: dbUser.is_active,
          name: dbUser.name,
          department: dbUser.department,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()
    );

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
    const { error: profileError } = await typedSupabaseQuery<any>(
      supabaseAdmin
        .from("profiles")
        .insert({
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
        } as any)
    );

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Don't throw here, as the user was created successfully
      // Just log the error and continue
    }
  } else {
    console.log("Profile already exists for user:", data.id);
    // Optionally update the existing profile with new data
    // @ts-ignore - Bypass strict type checking for Supabase query
    const { error: updateError } = await typedSupabaseQuery<any>(
      supabaseAdmin
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
        .eq("id", data.id)
    );

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
  const dbUser: any = {};

  // Fields that go in the users table
  if (user.email !== undefined) dbUser.email = user.email;
  if (user.role !== undefined) dbUser.role = user.role;
  if (user.status !== undefined) dbUser.is_active = user.status === "active";
  if (user.lastActive !== undefined) dbUser.last_login = user.lastActive;
  if (user.department !== undefined) dbUser.department = user.department;
  if (user.permissions !== undefined) dbUser.permissions = user.permissions;

  // Extract profile-related fields
  const profileUpdate: any = {};
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
  const profileUpdates: any = {};
  if (user.name !== undefined) profileUpdates.full_name = user.name;
  if (user.department !== undefined)
    profileUpdates.department = user.department;
  if (user.status !== undefined) profileUpdates.status = user.status;
  profileUpdates.updated_at = new Date().toISOString();

  const { data, error } = await typedSupabaseQuery<Profile>(
    supabaseAdmin
      .from("profiles")
      // @ts-ignore - Bypass strict type checking for Supabase update
      .update(safeTypeCast<typeof profileUpdates, any>(profileUpdates))
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
    .single();

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
      const { error: updateError } = await (supabaseAdmin
      .from("profiles")
      // @ts-ignore - Bypass strict type checking for Supabase update
      .update(safeTypeCast<typeof profileUpdates, any>(profileUpdates))
      .eq("id", id) as unknown as Promise<{ data: any, error: any }>);

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
        email: user.email || (data && data !== null && 'email' in data ? data.email as string : ''), // Use email from user update or existing data
        status: "active", // Required field with valid constraint value
        full_name: user.name || (user.email || (data && data !== null && 'email' in data ? data.email as string : '')).split("@")[0], // Required field
      };

      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        // @ts-ignore - Bypass strict type checking for Supabase insert
        .insert(profileData);

      if (insertError) {
        console.error(`Error creating profile for user ${id}:`, insertError);
        // Don't throw, just log the error
      }
    }
  }

  return mapDatabaseUserToFrontend(data as unknown as User);
};

/**
 * Delete a user
 * @param id User ID
 * @returns Promise with success status
 */
export const deleteUser = async (id: string): Promise<void> => {
  // Use supabaseAdmin to bypass RLS policies
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Create or update a user profile
 * @param userId User ID
 * @param profileData Profile data to create or update
 * @returns Promise with created/updated profile data
 */
export const upsertProfile = async (
  userId: string,
  profileData: Partial<Profile>
): Promise<Profile> => {
  // First, get user email from auth.users if not provided
  let userEmail = profileData.email;
  if (!userEmail) {
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError) {
      console.error(`Error getting auth user:`, authError);
      throw new Error(
        `Cannot create profile without email: ${authError.message}`
      );
    }
    userEmail = authUser.user?.email;
    if (!userEmail) {
      throw new Error("Cannot create profile: user email not found");
    }
  }

  // Convert frontend profile to database format - include required fields
  const dbProfile: any = {
    id: userId, // Use id as primary key
    user_id: userId,
    email: userEmail, // Required field
    status: profileData.status || "active", // Required field with valid constraint value
    full_name: profileData.full_name || userEmail.split("@")[0], // Fallback to email username
    role_id: profileData.role_id ? parseInt(profileData.role_id.toString()) : null, // Add role to profile
  };

  // Only add avatar_url if provided (bio doesn't exist in profiles table)
  if (profileData.avatar_url !== undefined) {
    dbProfile.avatar_url = profileData.avatar_url;
  }

  // Check if profile already exists - check by ID directly since id and user_id should be the same
  const { data: existingData, error: checkError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking existing profile:", checkError);
    throw new Error(checkError.message);
  }

  let result;

  if (existingData) {
    // Update existing profile using admin client - remove required fields for updates
    const updateData = { ...dbProfile };
    delete updateData.id; // Don't update primary key
    delete updateData.email; // Don't update email in existing profile

    const { data, error } = await typedSupabaseQuery<Profile>(
      supabaseAdmin
        .from("profiles")
        // @ts-ignore - Bypass strict type checking for Supabase update
        .update(safeTypeCast<typeof dbProfile, any>(dbProfile))
        .eq("id", userId)
        .select()
        .single()
    );

    if (error) {
      console.error("Error updating profile:", error);
      throw new Error(error.message);
    }

    console.log("✅ Profile updated successfully");
    result = data;
  } else {
    // Create new profile using admin client
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert(dbProfile as any)
      .select()
      .single();

    if (error) {
      console.error(`Error creating profile:`, error);
      throw new Error(error.message);
    }

    result = data;
  }

  return result as Profile;
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

  // Use supabaseAdmin to bypass RLS policies
  const { data, error } = await typedSupabaseQuery<User>(
    supabaseAdmin
      .from("users")
      // @ts-ignore - Bypass strict type checking for Supabase update
      .update({ is_active })
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
  // Use supabaseAdmin to bypass RLS policies
  const { data, error } = await typedSupabaseQuery<User>(
    supabaseAdmin
      .from("users")
      // @ts-ignore - Bypass strict type checking for Supabase update
      .update({ role })
      .eq("id", id)
      .select()
      .single()
  );

  if (error) {
    console.error(`Error updating role for user with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return mapDatabaseUserToFrontend(data as User);
};

/**
 * Update user preferences
 * @param userId User ID
 * @param preferences User preferences to update
 * @returns Promise with updated profile data
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: UserPreferences
): Promise<Profile> => {
  // Check if profile already exists
  const { data: existingData, error: checkError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .limit(1) as { data: any[], error: any };

  if (checkError) {
    console.error(`Error checking existing profile:`, checkError);
    throw new Error(checkError.message);
  }

  let result;

  if (existingData && existingData.length > 0) {
    // Update existing profile preferences
    const existingProfile = existingData[0];
    const currentPreferences = existingProfile && 'preferences' in existingProfile ? existingProfile.preferences || {} : {};
    const updatedPreferences = { ...currentPreferences, ...preferences };

    const { data, error } = await typedSupabaseQuery<Profile>(
      supabaseAdmin
        .from("profiles")
        // @ts-ignore - Bypass strict type checking for Supabase update
        .update({ preferences: updatedPreferences })
        .eq("id", existingData[0].id)
        .select()
        .single()
    );

    if (error) {
      console.error(`Error updating preferences:`, error);
      throw new Error(error.message);
    }

    result = data;
  } else {
    // Create new profile with preferences
    const profilePayload = {
      id: userId,
      user_id: userId,
      preferences: preferences,
      created_at: new Date().toISOString(),
    };
    
    const { data, error } = await typedSupabaseQuery<Profile>(
      supabaseAdmin
        .from("profiles")
        .insert(safeTypeCast<typeof profilePayload, any>(profilePayload))
        .select()
        .single()
    );

    if (error) {
      console.error("Error creating profile:", error);
      throw new Error(error.message);
    }

    console.log("✅ Profile created successfully");
    result = data;
  }
  
  return result as Profile;
};

/**
 * Log user activity
 */
export const logUserActivity = async (
  activity: Omit<UserActivity, "id" | "timestamp">
): Promise<UserActivity> => {
  const dbActivity = {
    user_id: activity.userId,
    action: activity.action,
    details: activity.details || {},
    ip: activity.ip,
    user_agent: activity.userAgent,
  };

  const { data, error } = await typedSupabaseQuery<any>(
    supabaseAdmin
      .from("user_activities")
      .insert(dbActivity as any)
      .select()
      .single()
  );

  if (error) {
    console.error(`Error logging user activity:`, error);
    throw new Error(error.message);
  }

  // Ensure data is not null before accessing properties
  if (!data) {
    throw new Error('No data returned from user activity logging');
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    action: data.action,
    details: data.details,
    timestamp: data.created_at,
    ip: data.ip,
    userAgent: data.user_agent,
  };
};

/**
 * Fetch user activities for a specific user
 * @param userId User ID
 * @returns Promise with array of user activities
 */
export const fetchUserActivities = async (
  userId: string
): Promise<UserActivity[]> => {
  const { data, error } = await supabaseAdmin
    .from("user_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false }) as { data: any[], error: any };

  if (error) {
    console.error(`Error fetching activities for user ${userId}:`, error);
    throw new Error(error.message);
  }

  return (data || []).map((activity) => ({
    id: activity.id,
    userId: activity.user_id,
    action: activity.action,
    details: activity.details,
    timestamp: activity.created_at,
    ip: activity.ip,
    userAgent: activity.user_agent,
  }));
};
