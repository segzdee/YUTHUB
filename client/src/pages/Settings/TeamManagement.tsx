import React, { useState, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  History,
  CheckSquare,
  Square,
  Users2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  getAssignableRoles,
  getRoleDisplayName,
  getRoleDescription,
  isHigherRole,
  type Role,
} from '@/config/permissions';
import { formatDate } from '@/lib/dateUtils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';

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

interface ActivityLogEntry {
  id: string;
  action: string;
  details: string;
  user_id: string;
  target_user_id?: string;
  created_at: string;
}

export default function TeamManagement() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);

  // Form states
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('staff');
  const [inviteMessage, setInviteMessage] = useState('');
  const [newRole, setNewRole] = useState<Role>('staff');

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [sortField, setSortField] = useState<'name' | 'role' | 'status' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Bulk actions
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'role' | 'remove' | null>(null);
  const [bulkNewRole, setBulkNewRole] = useState<Role>('staff');

  // Fetch organization members
  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userOrg) return [];

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

      return data as TeamMember[];
    },
    enabled: !!user?.id && can('read:team'),
  });

  // Fetch activity log
  const { data: activityLog } = useQuery({
    queryKey: ['team-activity-log', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userOrg) return [];

      const { data, error } = await supabase
        .from('team_activity_log')
        .select('*')
        .eq('organization_id', userOrg.organization_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching activity log:', error);
        return [];
      }

      return (data || []) as ActivityLogEntry[];
    },
    enabled: !!user?.id && showActivityLog,
  });

  // Log activity helper
  const logActivity = async (action: string, details: string, targetUserId?: string) => {
    try {
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user?.id || '')
        .maybeSingle();

      if (!userOrg) return;

      await supabase.from('team_activity_log').insert({
        organization_id: userOrg.organization_id,
        user_id: user?.id,
        action,
        details,
        target_user_id: targetUserId,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Invite user mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: Role }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!userOrg) throw new Error('Organization not found');

      const { error } = await supabase.from('user_organizations').insert({
        organization_id: userOrg.organization_id,
        user_id: user.id,
        role,
        status: 'pending',
        invited_by: user.id,
        invited_at: new Date().toISOString(),
      });

      if (error) throw error;

      await logActivity('invite', `Invited ${email} as ${getRoleDisplayName(role)}`);
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
      setInviteMessage('');
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

      await logActivity('role_change', `Changed role to ${getRoleDisplayName(newRole)}`, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-activity-log'] });
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

      await logActivity('remove', 'Removed team member', memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-activity-log'] });
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

  // Handlers
  const handleInvite = () => {
    if (!inviteEmail || !inviteRole) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleUpdateRole = () => {
    if (!selectedMember || !newRole) return;

    const isDemotion = isHigherRole(selectedMember.role, newRole);

    if (isDemotion) {
      const confirmMsg = `Are you sure you want to change ${selectedMember.first_name || 'this member'}'s role from ${getRoleDisplayName(selectedMember.role)} to ${getRoleDisplayName(newRole)}? This will reduce their access and permissions.`;
      if (!confirm(confirmMsg)) {
        return;
      }
    }

    updateRoleMutation.mutate({ memberId: selectedMember.id, newRole });
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    removeMemberMutation.mutate(memberToRemove.id);
    setShowRemoveDialog(false);
    setMemberToRemove(null);
  };

  const canManageMember = (memberRole: Role) => {
    return useCanManageUser(memberRole);
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'removed':
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'removed':
      case 'suspended':
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Filter and sort logic
  const filteredAndSortedMembers = useMemo(() => {
    if (!members) return [];

    let filtered = [...members];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((member) => {
        const name = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
        const email = (member.email || '').toLowerCase();
        return name.includes(query) || email.includes(query);
      });
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((member) => member.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((member) => member.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          const nameA = `${a.first_name || ''} ${a.last_name || ''} ${a.email || ''}`;
          const nameB = `${b.first_name || ''} ${b.last_name || ''} ${b.email || ''}`;
          comparison = nameA.localeCompare(nameB);
          break;
        case 'role':
          comparison = a.role.localeCompare(b.role);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'date':
          const dateA = new Date(a.accepted_at || a.invited_at).getTime();
          const dateB = new Date(b.accepted_at || b.invited_at).getTime();
          comparison = dateA - dateB;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [members, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  // Bulk selection
  const toggleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.size === filteredAndSortedMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredAndSortedMembers.map((m) => m.id)));
    }
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction) return;

    const selectedMembersList = Array.from(selectedMembers);

    if (bulkAction === 'role') {
      for (const memberId of selectedMembersList) {
        await updateRoleMutation.mutateAsync({ memberId, newRole: bulkNewRole });
      }
      toast({
        title: 'Roles Updated',
        description: `Updated ${selectedMembersList.length} member(s) to ${getRoleDisplayName(bulkNewRole)}`,
      });
    } else if (bulkAction === 'remove') {
      for (const memberId of selectedMembersList) {
        await removeMemberMutation.mutateAsync(memberId);
      }
      toast({
        title: 'Members Removed',
        description: `Removed ${selectedMembersList.length} member(s)`,
      });
    }

    setSelectedMembers(new Set());
    setShowBulkActionsDialog(false);
    setBulkAction(null);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredAndSortedMembers.length) return;

    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined Date'];
    const rows = filteredAndSortedMembers.map((member) => [
      `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'N/A',
      member.email || 'N/A',
      getRoleDisplayName(member.role),
      member.status,
      member.accepted_at || member.invited_at || 'N/A',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-roster-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `Exported ${filteredAndSortedMembers.length} team members to CSV`,
    });
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
                Manage your team members and their roles. Invite new members, update permissions,
                and control access to your organization.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowActivityLog(true)}>
                <History className="mr-2 h-4 w-4" />
                Activity Log
              </Button>
              <ProtectedAction permission="invite:team">
                <Button onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </ProtectedAction>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as Role | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {getAssignableRoles().map((role) => (
                    <SelectItem key={role} value={role}>
                      {getRoleDisplayName(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedMembers.size > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {selectedMembers.size} member(s) selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <ProtectedAction permission="manage:team">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setBulkAction('role');
                        setShowBulkActionsDialog(true);
                      }}
                    >
                      Change Role
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setBulkAction('remove');
                        setShowBulkActionsDialog(true);
                      }}
                    >
                      Remove
                    </Button>
                  </ProtectedAction>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedMembers(new Set())}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Members Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAndSortedMembers && filteredAndSortedMembers.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedMembers.size === filteredAndSortedMembers.length &&
                          filteredAndSortedMembers.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => handleSort('name')}
                      >
                        User
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => handleSort('role')}
                      >
                        Role
                        {getSortIcon('role')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => handleSort('date')}
                      >
                        Last Active
                        {getSortIcon('date')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMembers.has(member.id)}
                          onCheckedChange={() => toggleSelectMember(member.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(member.first_name, member.last_name, member.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.first_name && member.last_name
                                ? `${member.first_name} ${member.last_name}`
                                : member.email || 'User ' + member.user_id.substring(0, 8)}
                            </p>
                            {member.email && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          <Shield className="mr-1 h-3 w-3" />
                          {getRoleDisplayName(member.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getStatusColor(member.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(member.status)}
                            {member.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {member.accepted_at
                            ? formatDistanceToNow(new Date(member.accepted_at), { addSuffix: true })
                            : member.invited_at
                              ? `Invited ${formatDistanceToNow(new Date(member.invited_at), { addSuffix: true })}`
                              : '-'}
                        </div>
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
                                  {member.status === 'pending' && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        toast({
                                          title: 'Invitation Resent',
                                          description: 'Team member invitation has been resent',
                                        });
                                      }}
                                    >
                                      <Mail className="mr-2 h-4 w-4" />
                                      Resend Invite
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setMemberToRemove(member);
                                      setShowRemoveDialog(true);
                                    }}
                                    className="text-red-600 focus:text-red-600"
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
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No team members found</p>
              <p className="text-sm">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Invite your first team member to get started'}
              </p>
            </div>
          )}

          {/* Results Count */}
          {filteredAndSortedMembers && filteredAndSortedMembers.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredAndSortedMembers.length} of {members?.length || 0} team members
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

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to the invitation email..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail || inviteMutation.isPending}>
              {inviteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            <Button onClick={handleUpdateRole} disabled={!newRole || updateRoleMutation.isPending}>
              {updateRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold">
                {memberToRemove?.first_name && memberToRemove?.last_name
                  ? `${memberToRemove.first_name} ${memberToRemove.last_name}`
                  : memberToRemove?.email || 'this member'}
              </span>{' '}
              from your organization? They will lose access to all organization data and resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Actions Dialog */}
      <AlertDialog open={showBulkActionsDialog} onOpenChange={setShowBulkActionsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'role' ? 'Change Roles' : 'Remove Members'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'role' ? (
                <div className="space-y-4">
                  <p>Change the role for {selectedMembers.size} selected member(s).</p>
                  <div className="space-y-2">
                    <Label htmlFor="bulkRole">New Role</Label>
                    <Select
                      value={bulkNewRole}
                      onValueChange={(value) => setBulkNewRole(value as Role)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAssignableRoles().map((role) => (
                          <SelectItem key={role} value={role}>
                            {getRoleDisplayName(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <p>
                  Are you sure you want to remove {selectedMembers.size} member(s) from your
                  organization? This action cannot be undone.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              className={bulkAction === 'remove' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {bulkAction === 'role' ? 'Update Roles' : 'Remove Members'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Log Sheet */}
      <Sheet open={showActivityLog} onOpenChange={setShowActivityLog}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Activity Log</SheetTitle>
            <SheetDescription>
              Recent team management activities and changes
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {activityLog && activityLog.length > 0 ? (
              activityLog.map((entry) => (
                <div key={entry.id} className="flex gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    {entry.action === 'invite' && <UserPlus className="h-5 w-5 text-blue-600" />}
                    {entry.action === 'role_change' && <Shield className="h-5 w-5 text-orange-600" />}
                    {entry.action === 'remove' && <Trash2 className="h-5 w-5 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{entry.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity recorded yet</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
