import React from 'react';
import { useAuth } from './AuthProvider';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  console.log("ProtectedRoute render - loading:", loading, "currentUser:", !!currentUser);

  // Show loading state while authentication is being processed
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user exists and has a valid session
  if (!currentUser || !currentUser.user || !currentUser.session) {
    console.log("No valid user found, showing login form");
    return <LoginForm onLoginSuccess={() => {}} />;
  }

  console.log("User authenticated, rendering protected content");
  return <>{children}</>;
};