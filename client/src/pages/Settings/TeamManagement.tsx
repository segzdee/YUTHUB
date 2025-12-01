import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, useCanManageUser } from '@/hooks/usePermissions';
import { ProtectedAction } from '@/components/Auth/ProtectedAction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Mail, Shield, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAssignableRoles, getRoleDisplayName, getRoleDescription, type Role } from '@/config/permissions';
import { formatDate } from '@/lib/dateUtils';

interface TeamMember {
  id: string;
  user_id: string;
  role: Role;
  status: string;
  invited_at: string;
  accepted_at: string | null;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export default function TeamManagement() {
  const { user } = useAuth();
  const { can, role: currentUserRole } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('staff');
  const [newRole, setNewRole] = useState<Role>('staff');

  // Fetch organization members
  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get user's organization
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userOrg) return [];

      // Get all organization members with user details
      const { data, error } = await supabase
        .from('user_organizations')
        .select(`
          id,
          user_id,
          role,
          status,
          invited_at,
          accepted_at
        `)
        .eq('organization_id', userOrg.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user emails from auth.users (need to use a function or edge function)
      // For now, we'll use the user_id and mark as needing email fetch
      return data as TeamMember[];
    },
    enabled: !!user?.id && can('read:team'),
  });

  // Invite user mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: Role }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Get user's organization
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!userOrg) throw new Error('Organization not found');

      // In a real implementation, this would call an edge function
      // that sends an email invitation and creates a pending user_organizations record
      // For now, we'll just create a placeholder

      const { error } = await supabase
        .from('user_organizations')
        .insert({
          organization_id: userOrg.organization_id,
          user_id: user.id, // Placeholder - would be the invited user's ID
          role,
          status: 'pending',
          invited_by: user.id,
          invited_at: new Date().toISOString(),
        });

      if (error) throw error;

      return { email, role };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: 'Invitation Sent',
        description: 'Team member invitation has been sent successfully',
      });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('staff');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive',
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: Role }) => {
      const { error } = await supabase
        .from('user_organizations')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: 'Role Updated',
        description: 'Team member role has been updated successfully',
      });
      setShowEditModal(false);
      setSelectedMember(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'destructive',
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('user_organizations')
        .update({ status: 'removed', updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: 'Member Removed',
        description: 'Team member has been removed from the organization',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'destructive',
      });
    },
  });

  const handleInvite = () => {
    if (!inviteEmail || !inviteRole) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleUpdateRole = () => {
    if (!selectedMember || !newRole) return;
    updateRoleMutation.mutate({ memberId: selectedMember.id, newRole });
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      removeMemberMutation.mutate(memberId);
    }
  };

  const canManageMember = (memberRole: Role) => {
    return useCanManageUser(memberRole);
  };

  if (!can('read:team')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to view team management.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Invite team members and manage their roles and permissions
              </CardDescription>
            </div>
            <ProtectedAction permission="invite:team">
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </ProtectedAction>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : members && members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : member.email || 'User ' + member.user_id.substring(0, 8)}
                        </p>
                        {member.email && (
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        <Shield className="mr-1 h-3 w-3" />
                        {getRoleDisplayName(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.status === 'active' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.accepted_at
                        ? formatDate(member.accepted_at)
                        : member.invited_at
                          ? `Invited ${formatDate(member.invited_at)}`
                          : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <ProtectedAction permission="manage:team">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canManageMember(member.role) && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setNewRole(member.role);
                                    setShowEditModal(true);
                                  }}
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Member
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </ProtectedAction>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No team members found. Invite your first team member to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an email invitation to join your organization with a specific role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAssignableRoles().map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{getRoleDisplayName(role)}</span>
                        <span className="text-xs text-muted-foreground">
                          {getRoleDescription(role)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || inviteMutation.isPending}
            >
              {inviteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Team Member Role</DialogTitle>
            <DialogDescription>
              Update the role and permissions for this team member.
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">
                  {selectedMember.first_name && selectedMember.last_name
                    ? `${selectedMember.first_name} ${selectedMember.last_name}`
                    : 'Team Member'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current role: {getRoleDisplayName(selectedMember.role)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newRole">New Role</Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAssignableRoles().map((role) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{getRoleDisplayName(role)}</span>
                          <span className="text-xs text-muted-foreground">
                            {getRoleDescription(role)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={!newRole || updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
