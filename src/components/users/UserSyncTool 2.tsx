import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabaseAdmin } from '@/integration/supabase/admin-client';
import { supabase } from '@/integration/supabase/client';
import { Users, UserPlus, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface SyncStats {
  totalAuthUsers: number;
  existingProfiles: number;
  missingProfiles: number;
  syncedUsers: number;
}

interface AuthUser {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: any;
}

export function UserSyncTool() {
  const { toast } = useToast();
  const [stats, setStats] = useState<SyncStats>({
    totalAuthUsers: 0,
    existingProfiles: 0,
    missingProfiles: 0,
    syncedUsers: 0
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [missingUsers, setMissingUsers] = useState<AuthUser[]>([]);

  // Analyze current state
  const analyzeUsers = async () => {
    setLoading(true);
    console.log('🔍 Analyzing auth users and profiles...');
    
    try {
      // Get all auth users
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

      // Get all profiles
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

      const profileIds = new Set(profiles?.map(p => p.id) || []);
      const missing = authUsers.filter((user: any) => user.email && !profileIds.has(user.id));

      const newStats = {
        totalAuthUsers: authUsers.length,
        existingProfiles: profiles?.length || 0,
        missingProfiles: missing.length,
        syncedUsers: stats.syncedUsers
      };

      setStats(newStats);
      setMissingUsers(missing);

      console.log('📊 Analysis complete:', newStats);

      if (missing.length === 0) {
        toast({
          title: 'All Synced',
          description: 'All auth users already have profiles.'
        });
      } else {
        toast({
          title: 'Analysis Complete',
          description: `Found ${missing.length} users that need profiles.`
        });
      }

    } catch (error) {
      console.error('❌ Error analyzing users:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync missing users
  const syncMissingUsers = async () => {
    setSyncing(true);
    console.log('🔄 Starting user sync...');
    
    try {
      let syncedCount = 0;
      
      for (const authUser of missingUsers) {
        console.log(`Creating profile for: ${authUser.email}`);
        
        const fullName = authUser.user_metadata?.full_name || 
                        authUser.user_metadata?.name || 
                        authUser.email?.split('@')[0] || 
                        'User';

        const { error } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: fullName,
            status: 'active',
            created_at: authUser.created_at,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error(`❌ Error creating profile for ${authUser.email}:`, error);
          toast({
            title: 'Sync Error',
            description: `Failed to create profile for ${authUser.email}`,
            variant: 'destructive'
          });
        } else {
          syncedCount++;
          console.log(`✅ Created profile for: ${authUser.email}`);
        }
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        missingProfiles: prev.missingProfiles - syncedCount,
        existingProfiles: prev.existingProfiles + syncedCount,
        syncedUsers: prev.syncedUsers + syncedCount
      }));

      setMissingUsers(prev => prev.slice(syncedCount));

      toast({
        title: 'Sync Complete',
        description: `Successfully created ${syncedCount} profiles.`
      });

      console.log(`✅ Sync complete: ${syncedCount} profiles created`);

    } catch (error) {
      console.error('❌ Error syncing users:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync users',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  // Auto-analyze on mount
  useEffect(() => {
    analyzeUsers();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            User Sync Tool
          </CardTitle>
          <CardDescription className="text-white/60">
            Sync auth users to profiles table so they appear in user management
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{stats.totalAuthUsers}</div>
              <div className="text-white/60 text-sm">Auth Users</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-green-400">{stats.existingProfiles}</div>
              <div className="text-white/60 text-sm">With Profiles</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-yellow-400">{stats.missingProfiles}</div>
              <div className="text-white/60 text-sm">Missing Profiles</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-blue-400">{stats.syncedUsers}</div>
              <div className="text-white/60 text-sm">Synced Today</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={analyzeUsers}
              disabled={loading}
              variant="outline"
              className="bg-black/20 border-white/10 text-white hover:bg-white/10"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Analysis
            </Button>

            {stats.missingProfiles > 0 && (
              <Button
                onClick={syncMissingUsers}
                disabled={syncing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {syncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Sync {stats.missingProfiles} Users
              </Button>
            )}
          </div>

          {/* Status */}
          {stats.missingProfiles === 0 && stats.totalAuthUsers > 0 && (
            <div className="flex items-center gap-2 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-medium">All users are synced!</span>
            </div>
          )}

          {stats.missingProfiles > 0 && (
            <div className="flex items-center gap-2 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">
                {stats.missingProfiles} users need profiles to appear in user management
              </span>
            </div>
          )}

          {/* Missing Users List */}
          {missingUsers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-white font-medium">Users Missing Profiles</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {missingUsers.slice(0, 10).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/10"
                  >
                    <div>
                      <p className="text-white font-medium">{user.email}</p>
                      <p className="text-white/60 text-sm">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/30">
                      Missing Profile
                    </Badge>
                  </div>
                ))}
                {missingUsers.length > 10 && (
                  <div className="text-center text-white/60 text-sm">
                    ... and {missingUsers.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
