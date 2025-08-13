import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database';

// Initialize Supabase admin client with service role key for admin operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase URL or Service Role Key is missing. Please check your environment variables.');
}

// Create Supabase admin client with service role key
// This client has full admin privileges and bypasses RLS policies
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
  }
};
