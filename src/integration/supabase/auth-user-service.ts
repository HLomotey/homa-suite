import { supabase } from './client';
import { FrontendUser, UserRole } from './types';

export interface CreateAuthUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department: string;
  requirePasswordChange?: boolean;
}

export interface AuthUserResponse {
  success: boolean;
  authUserId?: string;
  error?: string;
}

export const authUserService = {
  /**
   * Create a new Supabase Auth user and corresponding custom user record
   */
  async createAuthUser(userData: CreateAuthUserRequest): Promise<AuthUserResponse> {
    try {
      // Create the auth user using admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
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

      if (!authData.user) {
        return {
          success: false,
          error: 'Failed to create auth user - no user data returned'
        };
      }

      return {
        success: true,
        authUserId: authData.user.id
      };
    } catch (error) {
      console.error('Error in createAuthUser:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Send password reset email to a user
   */
  async sendPasswordResetEmail(email: string): Promise<AuthUserResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Update user metadata in Supabase Auth
   */
  async updateAuthUserMetadata(userId: string, metadata: Record<string, any>): Promise<AuthUserResponse> {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: metadata
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error updating auth user metadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Delete a Supabase Auth user
   */
  async deleteAuthUser(userId: string): Promise<AuthUserResponse> {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting auth user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Check if an auth user exists for the given email
   */
  async checkAuthUserExists(email: string): Promise<{ exists: boolean; userId?: string }> {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Error checking auth user existence:', error);
        return { exists: false };
      }

      const user = data.users.find((u: any) => u.email === email);
      return {
        exists: !!user,
        userId: user?.id
      };
    } catch (error) {
      console.error('Error in checkAuthUserExists:', error);
      return { exists: false };
    }
  }
};
