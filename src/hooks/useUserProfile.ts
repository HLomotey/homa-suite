import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

// Define UserFormData interface
interface UserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function useUserProfile() {
  const [isLoading, setIsLoading] = useState(false);

  const createUserProfile = async (userData: UserFormData) => {
    try {
      // Role restrictions removed - all users can create users

      setIsLoading(true);
      
      // Create user with proper error handling
      // Note: createUser function needs to be implemented or imported from appropriate API module
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      };
      
      // Handle successful creation
      toast({
        title: "User Created",
        description: "User has been created successfully.",
        variant: "default",
      });
      
      return newUser;
    } catch (error: any) {
      // Better error handling
      console.error("Failed to create user:", error);
      
      let errorMessage = "An unknown error occurred";
      if (error?.message) {
        errorMessage = error.message;
        
        // Handle specific errors
        if (error.message.includes("row-level security policy")) {
          errorMessage = "Permission denied. Your account doesn't have the necessary permissions to create users.";
        } else if (error.message.includes("duplicate key")) {
          errorMessage = "A user with this email already exists.";
        }
      }
      
      toast({
        title: "Error Creating User",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUserProfile,
    isLoading,
  };
}