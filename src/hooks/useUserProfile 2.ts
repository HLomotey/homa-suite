import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { createUser, hasPermission } from "@/lib/api"; // Adjust the import based on your project structure

export function useUserProfile() {
  const [isLoading, setIsLoading] = useState(false);

  const createUserProfile = async (userData: UserFormData) => {
    try {
      // Check if the user has permission to create users
      if (!hasPermission('users', 'create')) {
        throw new Error("You don't have permission to create users");
      }

      setIsLoading(true);
      
      // Create user with proper error handling
      const newUser = await createUser({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        // other fields...
      });
      
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