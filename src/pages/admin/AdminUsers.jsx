import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreVertical,
  Ban,
  UserX,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  Shield,
  AlertTriangle,
} from 'lucide-react';

export default function AdminUsers() {
  const { hasPermission } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [userNotes, setUserNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_admin_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        method: 'GET',
        path: `/admin/users/${userId}`,
      });

      if (error) throw error;
      
      setSelectedUser(data.user);
      setUserNotes(data.notes || []);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error fetching user detail:', error);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser || !suspendReason) return;

    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        path: `/admin/users/${selectedUser.id}/suspend`,
        body: { reason: suspendReason },
      });

      if (error) throw error;

      setIsSuspendDialogOpen(false);
      setSuspendReason('');
      fetchUsers();
      fetchUserDetail(selectedUser.id);
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleUnsuspend = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        path: `/admin/users/${selectedUser.id}/unsuspend`,
        body: { reason: 'Admin action' },
      });

      if (error) throw error;

      fetchUsers();
      fetchUserDetail(selectedUser.id);
    } catch (error) {
      console.error('Error unsuspending user:', error);
    }
  };

  const handleAddNote = async () => {
    if (!selectedUser || !newNote.trim()) return;

    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        path: `/admin/users/${selectedUser.id}/notes`,
        body: { content: newNote, note_type: 'general' },
      });

      if (error) throw error;

      setNewNote('');
      fetchUserDetail(selectedUser.id);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Suspended</Badge>;
      case 'banned':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Banned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and basic account operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer" onClick={() => fetchUserDetail(user.id)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.account_status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        )) || <span className="text-muted-foreground text-sm">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{user.photo_count || 0}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => fetchUserDetail(user.id)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {hasPermission('suspend_users') && user.account_status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setIsSuspendDialogOpen(true);
                              }}
                              className="text-amber-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend Account
                            </DropdownMenuItem>
                          )}
                          {hasPermission('suspend_users') && user.account_status === 'suspended' && (
                            <DropdownMenuItem onClick={() => handleUnsuspend(user.id)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Unsuspend Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <p className="font-medium">{getStatusBadge(selectedUser.account_status)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Sign In</p>
                  <p className="font-medium">
                    {selectedUser.last_sign_in_at 
                      ? new Date(selectedUser.last_sign_in_at).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email Verified</p>
                  <p className="font-medium">{selectedUser.email_verified ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {hasPermission('suspend_users') && selectedUser.account_status === 'active' && (
                  <Button 
                    variant="outline" 
                    className="text-amber-600"
                    onClick={() => setIsSuspendDialogOpen(true)}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Suspend Account
                  </Button>
                )}
                {hasPermission('suspend_users') && selectedUser.account_status === 'suspended' && (
                  <Button 
                    variant="outline"
                    onClick={handleUnsuspend}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Unsuspend Account
                  </Button>
                )}
                {hasPermission('revoke_sessions') && (
                  <Button variant="outline">
                    <Ban className="mr-2 h-4 w-4" />
                    Revoke Sessions
                  </Button>
                )}
              </div>

              {/* Internal Notes */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Internal Notes
                </h3>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {userNotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No notes yet</p>
                  ) : (
                    userNotes.map((note) => (
                      <div key={note.id} className="rounded-lg border p-3 text-sm">
                        <p>{note.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {hasPermission('manage_users') && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <Button onClick={handleAddNote} size="sm">
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Admin Warning */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Admin Access Notice</p>
                    <p className="text-xs mt-1">
                      All actions are logged for compliance. Sensitive user data (workouts, 
                      nutrition, body metrics, photos) require separate permissions and are 
                      not accessible through this interface.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Suspend Account
            </DialogTitle>
            <DialogDescription>
              You are about to suspend {selectedUser?.email}. This will immediately block 
              access to Atlas Core and preserve all user data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Reason for suspension</label>
              <select
                className="mt-1 w-full rounded-md border p-2"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                <option value="terms_violation">Terms of Service Violation</option>
                <option value="fraud">Fraudulent Activity</option>
                <option value="safety">Safety Concern</option>
                <option value="spam">Spam/Abuse</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSuspend}
              disabled={!suspendReason}
            >
              Confirm Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
