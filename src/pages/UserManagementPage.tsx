import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserCheck, UserX, Shield, Users } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  approved: boolean;
  created_at: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load users');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleApproval = async (userId: string, approved: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ approved })
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update user');
    } else {
      toast.success(approved ? 'User approved!' : 'User access revoked');
      fetchUsers();
    }
  };

  const makeAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' });

    if (error) {
      toast.error('Failed to assign admin role');
    } else {
      toast.success('Admin role assigned!');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading users...</div>;
  }

  const pendingUsers = users.filter(u => !u.approved);
  const approvedUsers = users.filter(u => u.approved);

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-warning" />
            Pending Approvals ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending approvals</p>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <p className="font-medium text-foreground">{user.display_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Registered: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => toggleApproval(user.user_id, true)}>
                      <UserCheck className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Users */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <UserCheck className="w-5 h-5 text-success" />
            Approved Users ({approvedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved users</p>
          ) : (
            <div className="space-y-3">
              {approvedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-foreground">{user.display_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="text-success border-success/30">Approved</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => makeAdmin(user.user_id)}>
                      <Shield className="w-4 h-4 mr-1" /> Make Admin
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => toggleApproval(user.user_id, false)}>
                      <UserX className="w-4 h-4 mr-1" /> Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
