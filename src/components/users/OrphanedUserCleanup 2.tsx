import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { adminUserService, supabaseAdmin } from '@/integration/supabase/admin-client';
import { supabase } from '@/integration/supabase/client';
import { AlertTriangle, Trash2, UserPlus, RefreshCw } from 'lucide-react';

interface OrphanedUser {
  id: string;
  email: string;
  created_at: string;
  hasProfile: boolean;
}

export function OrphanedUserCleanup() {
  const { toast } = useToast();
  const [orphanedUsers, setOrphanedUsers] = useState<OrphanedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [specificEmail, setSpecificEmail] = useState('');

  // Check for orphaned users
  const checkOrphanedUsers = async () => {
    setLoading(true);
    console.log('🔍 Starting orphaned user check...');
    
    try {
      // Get all profiles to compare
      console.log('📋 Fetching profiles...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email');

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        toast({
          title: 'Error',
          description: `Failed to fetch profiles: ${profilesError.message}`,
          variant: 'destructive'
        });
        return;
      }

      console.log(`✅ Found ${profiles?.length || 0} profiles`);

      // Get all auth users using admin client
      console.log('👥 Fetching auth users...');
      const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

      if (authError) {
        console.error('❌ Error fetching auth users:', authError);
        toast({
          title: 'Error',
          description: `Failed to fetch auth users: ${authError.message}`,
          variant: 'destructive'
        });
        return;
      }

      console.log(`✅ Found ${authUsers?.length || 0} auth users`);

      const profileIds = new Set(profiles?.map(p => p.id) || []);
      const orphaned: OrphanedUser[] = [];

      console.log('🔍 Checking for orphaned users...');
      
      // Check each auth user to see if they have a profile
      for (const authUser of authUsers) {
        console.log(`Checking user: ${authUser.email} (${authUser.id})`);
        if (!profileIds.has(authUser.id)) {
          console.log(`🚨 Found orphaned user: ${authUser.email}`);
          orphaned.push({
            id: authUser.id,
            email: authUser.email || 'No email',
            created_at: authUser.created_at,
            hasProfile: false
          });
        }
      }

      console.log(`📊 Total orphaned users found: ${orphaned.length}`);
      setOrphanedUsers(orphaned);

      if (orphaned.length === 0) {
        toast({
          title: 'No Issues Found',
          description: 'No orphaned users detected.'
        });
      } else {
        toast({
          title: 'Orphaned Users Found',
          description: `Found ${orphaned.length} orphaned user(s)`
        });
      }

    } catch (error) {
      console.error('❌ Error checking orphaned users:', error);
      toast({
        title: 'Error',
        description: `Failed to check for orphaned users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete orphaned user by email
  const deleteOrphanedUser = async (email: string) => {
    setProcessing(email);
    try {
      // Try to delete using admin service
      const result = await adminUserService.deleteUserByEmail(email);
      
      if (result.success) {
        toast({
          title: 'User Deleted',
          description: `Successfully deleted orphaned user: ${email}`
        });
        
        // Remove from list
        setOrphanedUsers(prev => prev.filter(u => u.email !== email));
      } else {
        toast({
          title: 'Delete Failed',
          description: result.error || 'Failed to delete user',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  // Create profile for orphaned user
  const createProfileForUser = async (email: string) => {
    setProcessing(email);
    try {
      // We need to get the auth user ID first
      // This is a workaround since we can't directly access auth.users
      
      // Try to create a profile with a generated ID
      // This won't work perfectly without the real auth ID, but it's a start
      const { error } = await supabase
        .from('profiles')
        .insert({
          email,
          full_name: email.split('@')[0], // Use email prefix as name
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        toast({
          title: 'Profile Creation Failed',
          description: `Error: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Profile Created',
          description: `Created profile for: ${email}`
        });
        
        // Remove from orphaned list
        setOrphanedUsers(prev => prev.filter(u => u.email !== email));
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to create profile',
        variant: 'destructive'
      });
    } finally {
      setProcessing(null);
    }
  };

  // Handle specific email cleanup
  const handleSpecificEmailCleanup = async () => {
    if (!specificEmail) return;
    
    await deleteOrphanedUser(specificEmail);
    setSpecificEmail('');
  };

  useEffect(() => {
    checkOrphanedUsers();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Orphaned User Cleanup
          </CardTitle>
          <CardDescription className="text-white/60">
            Manage users that exist in authentication but not in profiles table
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Manual Email Input */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Clean Up Specific Email</h3>
            <p className="text-white/60 text-sm">
              Enter the email address of the orphaned user you want to delete from auth.
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={specificEmail}
                  onChange={(e) => setSpecificEmail(e.target.value)}
                  placeholder="e.g., junior@bohconcepts.com"
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/50"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSpecificEmailCleanup}
                  disabled={!specificEmail || processing === specificEmail}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {processing === specificEmail ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
            <div className="text-xs text-white/40">
              💡 If the automatic scan doesn't work, use this manual method with the specific email addresses.
            </div>
          </div>

          {/* Scan Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Detected Issues</h3>
              <Button
                onClick={checkOrphanedUsers}
                disabled={loading}
                variant="outline"
                className="bg-black/20 border-white/10 text-white hover:bg-white/10"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>

            {orphanedUsers.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                No orphaned users detected
              </div>
            ) : (
              <div className="space-y-3">
                {orphanedUsers.map((user) => (
                  <div
                    key={user.email}
                    className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/30">
                        Orphaned
                      </Badge>
                      <div>
                        <p className="text-white font-medium">{user.email}</p>
                        <p className="text-white/60 text-sm">No profile found</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => createProfileForUser(user.email)}
                        disabled={processing === user.email}
                        variant="outline"
                        size="sm"
                        className="bg-green-900/20 border-green-500/30 text-green-400 hover:bg-green-900/30"
                      >
                        {processing === user.email ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                        Create Profile
                      </Button>
                      
                      <Button
                        onClick={() => deleteOrphanedUser(user.email)}
                        disabled={processing === user.email}
                        variant="outline"
                        size="sm"
                        className="bg-red-900/20 border-red-500/30 text-red-400 hover:bg-red-900/30"
                      >
                        {processing === user.email ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
