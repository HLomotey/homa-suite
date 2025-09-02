import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, RefreshCw, UserPlus } from "lucide-react";
import { supabase } from "@/integration/supabase/client";
import { supabaseAdmin } from "@/integration/supabase/admin-client";
import { useToast } from "@/components/ui/use-toast";
import { useExternalStaff } from "@/hooks/external-staff/useExternalStaff";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { externalStaff } = useExternalStaff();

  // Forgot password state
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [resetCooldownEnd, setResetCooldownEnd] = useState<number | null>(null);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const { toast } = useToast();

  // Restore cooldown from localStorage on mount
  useEffect(() => {
    const last = localStorage.getItem("lastPasswordResetAttempt");
    if (last) {
      const lastAttemptTime = parseInt(last);
      const cooldownDuration = 5 * 60 * 1000; // 5 minutes
      const cooldownEnd = lastAttemptTime + cooldownDuration;
      const now = Date.now();
      if (now < cooldownEnd) {
        setResetCooldownEnd(cooldownEnd);
        setCooldownTimeLeft(Math.ceil((cooldownEnd - now) / 1000));
      }
    }
  }, []);

  // Tick cooldown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (resetCooldownEnd) {
      interval = setInterval(() => {
        const now = Date.now();
        const secs = Math.ceil((resetCooldownEnd - now) / 1000);
        if (secs <= 0) {
          setResetCooldownEnd(null);
          setCooldownTimeLeft(0);
          localStorage.removeItem("lastPasswordResetAttempt");
        } else {
          setCooldownTimeLeft(secs);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resetCooldownEnd]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSignUpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
    if (signUpError) setSignUpError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        onLoginSuccess();
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", {
        message: err?.message,
        raw: JSON.stringify(err, Object.getOwnPropertyNames(err || {})),
      });
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address to reset your password");
      return;
    }

    if (resetCooldownEnd && Date.now() < resetCooldownEnd) {
      toast({
        title: "Please wait",
        description: `You can request another password reset in ${Math.ceil(
          cooldownTimeLeft / 60
        )} minute(s).`,
        variant: "destructive",
      });
      return;
    }

    setIsSendingResetEmail(true);
    setError(null);

    try {
      const email = formData.email.trim().toLowerCase();
      const redirectTo = `${window.location.origin}/reset-password`;

      console.log('Attempting password reset for:', email, 'with redirect:', redirectTo);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      
      console.log('Reset password response:', { data, error });

      if (error) {
        const anyErr = error as any;
        console.error("Supabase reset error:", {
          name: error.name,
          message: error.message,
          status: anyErr?.status,
          raw: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });

        if (anyErr?.status === 429 || /rate limit|429/i.test(error.message)) {
          const cdEnd = Date.now() + 5 * 60 * 1000;
          setResetCooldownEnd(cdEnd);
          setCooldownTimeLeft(5 * 60);
          localStorage.setItem("lastPasswordResetAttempt", String(Date.now()));
          toast({
            title: "Too many requests",
            description:
              "Please wait 5 minutes before requesting another password reset email.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Reset email failed",
          description: error.message || "We couldn't send the reset email.",
          variant: "destructive",
        });
        return;
      }

      // Success → start cooldown
      const cdEnd = Date.now() + 5 * 60 * 1000;
      setResetCooldownEnd(cdEnd);
      setCooldownTimeLeft(5 * 60);
      localStorage.setItem("lastPasswordResetAttempt", String(Date.now()));

      toast({
        title: "Password reset email sent",
        description: `If an account exists for ${email}, you will receive a password reset link shortly.`,
      });
    } catch (err: any) {
      console.error("Error sending password reset email:", {
        message: err?.message,
        raw: JSON.stringify(err, Object.getOwnPropertyNames(err || {})),
      });
      toast({
        title: "Reset email failed",
        description:
          err?.message ?? "Something went wrong sending the reset email.",
        variant: "destructive",
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  // Validate external staff email against personal email field using admin client
  const validateExternalStaffEmail = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      console.log('Validating email:', normalizedEmail);
      
      const { data, error } = await supabaseAdmin
        .from('external_staff')
        .select('*')
        .eq('"PERSONAL E-MAIL"', normalizedEmail)
        .is('"TERMINATION DATE"', null)
        .limit(1);
      
      console.log('Validation query result:', { data, error });
      
      if (error) {
        console.error('Error validating external staff email:', error);
        return null;
      }
      
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in validateExternalStaffEmail:', error);
      return null;
    }
  };

  // Handle sign up submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    setSignUpError(null);

    try {
      const email = signUpData.email.trim().toLowerCase();
      const password = signUpData.password;
      const confirmPassword = signUpData.confirmPassword;

      // Validate passwords match
      if (password !== confirmPassword) {
        setSignUpError("Passwords do not match");
        return;
      }

      // Validate password strength
      if (password.length < 8) {
        setSignUpError("Password must be at least 8 characters long");
        return;
      }

      // Check if email exists in external staff
      const externalStaffMember = await validateExternalStaffEmail(email);
      if (!externalStaffMember) {
        setSignUpError("Email address not found in our staff directory. Please contact HR to verify your email address.");
        return;
      }

      // Check if staff member is active (not terminated)
      if (externalStaffMember["TERMINATION DATE"]) {
        setSignUpError("Cannot create account for terminated staff. Please contact HR for assistance.");
        return;
      }

      // Create user with external staff data
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${externalStaffMember["PAYROLL FIRST NAME"]} ${externalStaffMember["PAYROLL LAST NAME"]}`,
            first_name: externalStaffMember["PAYROLL FIRST NAME"],
            last_name: externalStaffMember["PAYROLL LAST NAME"],
            job_title: externalStaffMember["JOB TITLE"],
            department: externalStaffMember["HOME DEPARTMENT"],
            location: externalStaffMember["LOCATION"],
            business_unit: externalStaffMember["BUSINESS UNIT"],
            position_id: externalStaffMember["POSITION ID"],
            associate_id: externalStaffMember["ASSOCIATE ID"],
            hire_date: externalStaffMember["HIRE DATE"],
            work_email: externalStaffMember["WORK E-MAIL"],
            personal_email: externalStaffMember["PERSONAL E-MAIL"],
            external_staff_id: externalStaffMember.id
          }
        }
      });

      if (error) {
        setSignUpError(error.message);
        return;
      }

      if (data.user) {
        toast({
          title: "Account Created",
          description: "Your account has been created successfully. Please check your email to verify your account.",
          variant: "default",
        });
        
        // Switch to login tab
        setActiveTab("login");
        
        // Pre-fill login email
        setFormData(prev => ({ ...prev, email }));
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      setSignUpError("An unexpected error occurred. Please try again.");
    } finally {
      setSignUpLoading(false);
    }
  };

  const isFormValid = Boolean(formData.email && formData.password);
  const isSignUpFormValid = Boolean(
    signUpData.email && 
    signUpData.password && 
    signUpData.confirmPassword &&
    signUpData.password === signUpData.confirmPassword
  );
  const isInCooldown =
    resetCooldownEnd !== null && Date.now() < resetCooldownEnd;

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
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            BOH Concepts Operations Management System
          </h1>
          <p className="text-muted-foreground mt-3">Enterprise Resource Planning</p>
        </div>

        {/* Auth Card with Tabs */}
        <Card className="backdrop-blur-sm bg-card/95 border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Welcome
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
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
                    onClick={() => setShowPassword((s) => !s)}
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
              <Button type="submit" className="w-full" disabled={!isFormValid || loading}>
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
                  className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-2 py-1 disabled:text-gray-400 disabled:hover:no-underline"
                  disabled={isSendingResetEmail || !formData.email || isInCooldown}
                >
                  {isSendingResetEmail ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </span>
                  ) : isInCooldown ? (
                    `Wait ${Math.floor(cooldownTimeLeft / 60)}:${String(
                      cooldownTimeLeft % 60
                    ).padStart(2, "0")}`
                  ) : (
                    "Forgot password?"
                  )}
                </button>
              </div>
              </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  {/* Sign Up Error Alert */}
                  {signUpError && (
                    <Alert variant="destructive">
                      <AlertDescription>{signUpError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Work or Personal Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your work or personal email"
                        value={signUpData.email}
                        onChange={handleSignUpInputChange}
                        className="pl-10"
                        required
                        disabled={signUpLoading}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must match an email in our staff directory
                    </p>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showSignUpPassword ? "text" : "password"}
                        placeholder="Create a password (min 8 characters)"
                        value={signUpData.password}
                        onChange={handleSignUpInputChange}
                        className="pl-10 pr-10"
                        required
                        disabled={signUpLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSignUpPassword((s) => !s)}
                        disabled={signUpLoading}
                      >
                        {showSignUpPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={handleSignUpInputChange}
                        className="pl-10 pr-10"
                        required
                        disabled={signUpLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        disabled={signUpLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={!isSignUpFormValid || signUpLoading}>
                    {signUpLoading ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>

                  <div className="text-center text-xs text-muted-foreground">
                    <p>Only staff members with verified email addresses can create accounts.</p>
                    <p>Contact HR if your email is not recognized.</p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="text-center mt-6 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} BOH Concepts. All rights reserved.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
