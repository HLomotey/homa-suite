import { useEffect, useState } from "react";
import { supabase } from "@/integration/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

export default function ResetPassword() {
  const [showForm, setShowForm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // If the user clicked the recovery link, Supabase should set a session and emit PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowForm(true);
      }
    });

    // Also check immediately in case the session is already present
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setShowForm(true);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error("Update password error:", error);
        setErr(error.message || "Failed to update password.");
        return;
      }
      toast({
        title: "Password updated",
        description: "Your password has been changed. You can now sign in.",
      });
      // Redirect to login (adjust path)
      window.location.href = "/";
    } catch (e: any) {
      console.error("Unexpected update error:", e);
      setErr(e?.message ?? "Unexpected error updating password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Use the form below to set a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <p className="text-sm text-muted-foreground">
              Looking for a recovery session… If you opened this page directly, please use the password
              reset link from your email again.
            </p>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {err && (
                <Alert variant="destructive">
                  <AlertDescription>{err}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
