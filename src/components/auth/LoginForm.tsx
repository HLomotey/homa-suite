import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, Building, RefreshCw } from "lucide-react";
import { supabase } from "@/integration/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        onLoginSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password;
  
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address to reset your password");
      return;
    }
    
    setIsSendingResetEmail(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Password reset email sent",
        description: `If an account exists for ${formData.email}, you will receive a password reset link shortly.`,
      });
    } catch (err) {
      console.error("Error sending password reset email:", err);
      // Don't show specific errors for security reasons
      toast({
        title: "Password reset email sent",
        description: `If an account exists for ${formData.email}, you will receive a password reset link shortly.`,
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 pt-32 pb-8">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-16">
          <div className="flex justify-center mb-6">
            <img 
              src="/Compass.png" 
              alt="BOH Concepts Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">BOH Concepts Operations Management System</h1>
          <p className="text-muted-foreground mt-3">Enterprise Resource Planning</p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-card/95 border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              
              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-2 py-1"
                  disabled={isSendingResetEmail || !formData.email}
                >
                  {isSendingResetEmail ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Forgot password?"
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center mt-6 text-sm text-muted-foreground">
              <p>© 2024 BOH Concepts. All rights reserved.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
