import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integration/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Lock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Password reset form schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Get token and other params from URL
  const token = searchParams.get("token");
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const type = searchParams.get("type");

  // Initialize form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check for valid reset session
  useEffect(() => {
    const checkResetSession = async () => {
      console.log('URL params:', { token, accessToken, refreshToken, type });
      
      // Method 1: Check if we have URL parameters from Supabase
      if (accessToken && refreshToken && type === 'recovery') {
        try {
          // Set the session using the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setError("Invalid or expired reset link. Please request a new password reset link.");
            return;
          }
          
          console.log('Session set successfully:', data);
          setShowForm(true);
          return;
        } catch (err) {
          console.error('Error setting session:', err);
          setError("Invalid or expired reset link. Please request a new password reset link.");
          return;
        }
      }
      
      // Method 2: Check for existing session (in case user already clicked the link)
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        console.log('Found existing session:', session);
        setShowForm(true);
        return;
      }
      
      // Method 3: Listen for auth state changes (PASSWORD_RECOVERY event)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session);
        if (event === 'PASSWORD_RECOVERY') {
          setShowForm(true);
        }
      });
      
      // If no valid session found, show error
      if (!showForm) {
        setError("Invalid or missing reset token. Please request a new password reset link.");
      }
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkResetSession();
  }, [token, accessToken, refreshToken, type, showForm]);

  // Handle form submission
  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!showForm) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Check if we have a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No valid reset session found. Please use the reset link from your email again.");
      }

      console.log('Updating password with session:', sessionData.session);

      // Update password using the current session
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Show success message
      setSuccess(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });

      // Sign out to clear the reset session
      await supabase.auth.signOut();

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
      toast({
        title: "Password reset failed",
        description: err instanceof Error ? err.message : "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <Card className="w-full max-w-md bg-black/40 border border-white/10 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white">Reset Your Password</CardTitle>
          <CardDescription className="text-center text-white/60">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {!showForm && !error && (
            <div className="bg-blue-900/20 border border-blue-500/30 text-blue-200 p-3 rounded-md text-center">
              <p>Looking for a valid reset session...</p>
              <p className="text-sm mt-2">If you opened this page directly, please use the password reset link from your email.</p>
            </div>
          )}

          {success ? (
            <div className="bg-green-900/20 border border-green-500/30 text-green-200 p-3 rounded-md text-center">
              <p className="mb-2 font-medium">Password Reset Successful!</p>
              <p>You will be redirected to the login page shortly.</p>
            </div>
          ) : showForm ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">New Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="bg-black/20 border-white/10 text-white pr-10"
                            placeholder="Enter your new password"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-white/60" />
                          ) : (
                            <Eye className="h-4 w-4 text-white/60" />
                          )}
                        </Button>
                      </div>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Confirm Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            className="bg-black/20 border-white/10 text-white pr-10"
                            placeholder="Confirm your new password"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-white/60" />
                          ) : (
                            <Eye className="h-4 w-4 text-white/60" />
                          )}
                        </Button>
                      </div>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    className={cn(
                      "w-full bg-blue-600 hover:bg-blue-700 text-white",
                      isSubmitting && "opacity-70 cursor-not-allowed"
                    )}
                    disabled={isSubmitting || !showForm}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-white/60 text-center">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside text-xs space-y-1 mt-1">
              <li>At least 8 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
