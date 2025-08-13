"use client";

import { useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertTriangle, CheckCircle, Lock, KeyRound, Smartphone, Shield, Eye, EyeOff } from "lucide-react";

export function SecurityTab() {
  const { toast } = useToast();
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState("app");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Session states
  const [activeSessions, setActiveSessions] = useState([
    { id: "1", device: "Chrome on Windows", location: "New York, NY", lastActive: "2025-07-25T15:30:00Z", current: true },
    { id: "2", device: "Safari on iPhone", location: "Boston, MA", lastActive: "2025-07-24T10:15:00Z", current: false },
    { id: "3", device: "Firefox on MacOS", location: "Chicago, IL", lastActive: "2025-07-23T08:45:00Z", current: false },
  ]);
  
  // Calculate password strength when password changes
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 20; // Has uppercase
    if (/[a-z]/.test(password)) strength += 15; // Has lowercase
    if (/[0-9]/.test(password)) strength += 15; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 20; // Has special char
    
    return Math.min(strength, 100);
  };
  
  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
  };
  
  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  // Get password strength text
  const getStrengthText = () => {
    if (passwordStrength < 40) return "Weak";
    if (passwordStrength < 70) return "Moderate";
    return "Strong";
  };
  
  // Handle password update
  const handleUpdatePassword = async () => {
    // Validation
    if (!currentPassword) {
      toast({
        title: "Current Password Required",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPassword) {
      toast({
        title: "New Password Required",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordStrength < 40) {
      toast({
        title: "Password Too Weak",
        description: "Please choose a stronger password.",
        variant: "destructive",
      });
      return;
    }
    
    // Update password using Supabase Auth
    setIsChangingPassword(true);
    try {
      // Get current user's email
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email;
      
      if (!userEmail) {
        toast({
          title: "Authentication Error",
          description: "Could not retrieve your account information. Please try signing in again.",
          variant: "destructive",
        });
        setIsChangingPassword(false);
        return;
      }
      
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword
      });
      
      if (signInError) {
        toast({
          title: "Current Password Incorrect",
          description: "The current password you entered is incorrect.",
          variant: "destructive",
        });
        setIsChangingPassword(false);
        return;
      }
      
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        toast({
          title: "Password Update Failed",
          description: updateError.message || "Could not update password. Please try again.",
          variant: "destructive",
        });
      } else {
        // Clear form fields on success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStrength(0);
        
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Password Update Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Handle 2FA toggle
  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      setTwoFactorEnabled(false);
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "Your account is now less secure. We recommend enabling 2FA for better security.",
        variant: "destructive",
      });
    } else {
      // Enable 2FA - show QR code
      setShowQRCode(true);
    }
  };
  
  // Handle 2FA verification
  const handleVerify2FA = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate API call
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowQRCode(false);
      setTwoFactorEnabled(true);
      setVerificationCode("");
      
      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now more secure with 2FA.",
      });
    }, 1500);
  };
  
  // Handle session termination
  const handleTerminateSession = (sessionId: string) => {
    // Filter out the terminated session
    setActiveSessions(activeSessions.filter(session => session.id !== sessionId));
    
    toast({
      title: "Session Terminated",
      description: "The selected session has been terminated successfully.",
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="mb-4 bg-black/40 border border-white/10">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="2fa">Two-Factor Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="password">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription className="text-white/60">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-black/40 border-white/10 text-white pl-8 pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-white/60 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">New Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    className="bg-black/40 border-white/10 text-white pl-8 pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-white/60 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {newPassword && (
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Password Strength:</span>
                      <span className={`text-sm ${
                        passwordStrength < 40 ? "text-red-400" : 
                        passwordStrength < 70 ? "text-yellow-400" : 
                        "text-green-400"
                      }`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className={`h-1 ${getStrengthColor()}`} />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-black/40 border-white/10 text-white pl-8 pr-10"
                  />
                </div>
                
                {confirmPassword && newPassword !== confirmPassword && (
                  <div className="flex items-center mt-1 text-red-400 text-sm">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>Passwords don't match</span>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={handleUpdatePassword} 
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                >
                  {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="2fa">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-white/60">
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-white">Two-Factor Authentication</div>
                  <div className="text-sm text-white/60">
                    {twoFactorEnabled 
                      ? "Your account is protected with two-factor authentication" 
                      : "Enable two-factor authentication for enhanced security"}
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleToggle2FA}
                />
              </div>
              
              {showQRCode && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-black/60 rounded-md">
                    <div className="text-white mb-2">1. Scan this QR code with your authenticator app</div>
                    <div className="bg-white p-4 w-48 h-48 mx-auto flex items-center justify-center">
                      <div className="text-black text-xs text-center">
                        [QR Code Placeholder]<br />
                        In a real app, a QR code would be displayed here
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-black/60 rounded-md">
                    <div className="text-white mb-2">2. Enter the 6-digit verification code from your app</div>
                    <div className="flex space-x-4">
                      <Input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="bg-black/40 border-white/10 text-white text-center"
                        maxLength={6}
                      />
                      <Button 
                        onClick={handleVerify2FA} 
                        disabled={isVerifying || verificationCode.length !== 6}
                      >
                        {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-300">Important</p>
                        <p className="text-sm text-amber-200/80">
                          Store your backup codes in a safe place. If you lose access to your authenticator app, 
                          you'll need these codes to regain access to your account.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {twoFactorEnabled && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-md">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-300">Two-Factor Authentication is Active</p>
                        <p className="text-sm text-green-200/80">
                          Your account is protected with an additional layer of security.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="2faMethod" className="text-white">Authentication Method</Label>
                    <Select 
                      value={twoFactorMethod}
                      onValueChange={setTwoFactorMethod}
                    >
                      <SelectTrigger className="bg-black/40 border-white/10 text-white">
                        <SelectValue placeholder="Select Authentication Method" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 text-white">
                        <SelectItem value="app">Authenticator App</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button variant="outline" className="bg-black/40 border-white/10 text-white hover:bg-white/10">
                    <Shield className="h-4 w-4 mr-2" />
                    View Backup Codes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions">
          <Card className="bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Active Sessions</CardTitle>
              <CardDescription className="text-white/60">
                Manage your active sessions across different devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={`p-4 rounded-md flex justify-between items-center ${
                      session.current ? "bg-blue-900/20 border border-blue-700/30" : "bg-black/20 border border-white/5"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="font-medium text-white">{session.device}</span>
                        {session.current && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-white/60">
                        {session.location} • Last active {formatDate(session.lastActive)}
                      </div>
                    </div>
                    
                    {!session.current && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleTerminateSession(session.id)}
                      >
                        Terminate
                      </Button>
                    )}
                  </div>
                ))}
                
                {activeSessions.length === 0 && (
                  <div className="text-center py-6 text-white/60">
                    No active sessions found
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive"
                onClick={() => {
                  setActiveSessions(activeSessions.filter(session => session.current));
                  toast({
                    title: "All Other Sessions Terminated",
                    description: "All sessions except your current one have been terminated.",
                  });
                }}
                disabled={activeSessions.filter(session => !session.current).length === 0}
              >
                Terminate All Other Sessions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
