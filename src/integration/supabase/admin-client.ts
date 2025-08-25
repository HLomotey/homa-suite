import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database';

// Initialize Supabase admin client with service role key for admin operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Supabase URL is missing. Please check your environment variables.');
}

if (!supabaseServiceRoleKey) {
  console.warn('Supabase Service Role Key is missing. Using anon key as fallback - some admin operations may fail due to RLS.');
}

// Create Supabase admin client with service role key (or anon key as fallback)
// This client has full admin privileges and bypasses RLS policies when using service role key
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Admin user service for user management operations
export const adminUserService = {
  /**
   * Create a new Supabase Auth user using admin privileges
   */
  async createAuthUser(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    department: string;
    requirePasswordChange?: boolean;
  }) {
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email for admin-created users
        user_metadata: {
          name: userData.name,
          role: userData.role,
          department: userData.department,
          require_password_change: userData.requirePasswordChange ?? true
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return {
          success: false,
          error: authError.message
        };
      }

      return {
        success: true,
        authUserId: authData.user?.id,
        user: authData.user
      };
    } catch (error) {
      console.error('Error in createAuthUser:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Send password reset email using admin privileges
   */
  async sendPasswordResetEmail(email: string) {
    try {
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email
      });

      if (error) {
        console.error('Error generating password reset link:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in sendPasswordResetEmail:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Delete a Supabase Auth user using admin privileges
   * Enhanced to handle email-based deletion as a fallback
   */
  async deleteAuthUser(userId: string, email?: string) {
    try {
      // First attempt: Delete by user ID
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) {
        console.error('Error deleting auth user by ID:', error);
        
        // If we have an email and the error is about user not found, try to find by email
        if (email && error.message.includes('User not found')) {
          console.log('User not found by ID, attempting to find by email:', email);
          
          // Query auth.users to find the user by email
          const { data: users, error: queryError } = await supabaseAdmin
            .from('auth.users')
            .select('id')
            .eq('email', email)
            .limit(1);
          
          if (queryError) {
            console.error('Error querying auth user by email:', queryError);
            return {
              success: false,
              error: `Failed to query user by email: ${queryError.message}`
            };
          }
          
          // If we found a user with this email, try to delete it
          if (users && users.length > 0) {
            const authUserId = users[0].id;
            console.log('Found auth user by email with ID:', authUserId);
            
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
            
            if (deleteError) {
              console.error('Error deleting auth user found by email:', deleteError);
              return {
                success: false,
                error: deleteError.message
              };
            }
            
            return {
              success: true,
              message: 'User deleted by email lookup'
            };
          }
        }
        
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in deleteAuthUser:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Update a user's password using admin privileges
   */
  async updateUserPassword(userId: string, newPassword: string) {
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
        user_metadata: {
          require_password_change: true
        }
      });

      if (error) {
        console.error('Error updating user password:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in updateUserPassword:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Delete a user by email address
   */
  async deleteUserByEmail(email: string) {
    try {
      console.log(`🔍 Looking for user with email: ${email}`);
      
      // First, get all users from Supabase Auth
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('❌ Error listing users:', listError);
        throw new Error(`Failed to list users: ${listError.message}`);
      }

      // Find the user by email
      const user = users.find((u: any) => u.email === email);
      
      if (!user) {
        console.log(`⚠️ User with email ${email} not found in auth.users`);
        return { success: false, message: `User with email ${email} not found` };
      }

      console.log(`✅ Found user: ${user.id} (${user.email})`);

      // Clean up database references first to avoid foreign key constraint errors
      console.log('🧹 Cleaning up database references...');
      
      // Note: user_roles table no longer exists - roles are now stored directly in profiles table

      // Delete from user_permissions table (if exists)
      const { error: userPermissionsError } = await supabaseAdmin
        .from('user_permissions')
        .delete()
        .eq('user_id', user.id);
      
      if (userPermissionsError) {
        console.error('❌ Error deleting user permissions:', userPermissionsError);
      } else {
        console.log('✅ Deleted user permissions');
      }

      // Delete from profiles table
      const { error: profilesError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (profilesError) {
        console.error('❌ Error deleting profile:', profilesError);
      } else {
        console.log('✅ Deleted profile');
      }

      // Delete from public.users table (main user data table)
      const { error: usersError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', user.id);
      
      if (usersError) {
        console.error('❌ Error deleting from users table:', usersError);
      } else {
        console.log('✅ Deleted from users table');
      }

      // Delete any notifications for this user
      const { error: notificationsError } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (notificationsError) {
        console.error('❌ Error deleting notifications (table may not exist):', notificationsError);
      } else {
        console.log('✅ Deleted notifications');
      }

      // Finally, delete the auth user
      console.log('🗑️ Deleting auth user...');
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error('❌ Error deleting auth user:', deleteError);
        throw new Error(`Failed to delete auth user: ${deleteError.message}`);
      }

      console.log('✅ Successfully deleted auth user');
      return { success: true, message: `Successfully deleted user: ${email}` };

    } catch (error) {
      console.error('❌ Error in deleteUserByEmail:', error);
      throw error;
    }
  }
};
