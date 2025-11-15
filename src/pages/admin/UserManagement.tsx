import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Shield,
  Trash2,
  Edit,
  Mail,
  Phone,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Role } from '@/types';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import ManageRolesDialog from './ManageRolesDialog';
import * as userService from '@/services/userService';
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

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    employees: 0,
    customers: 0,
  });
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Store filtered users for pagination
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Load stats from backend on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load users on mount and when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    loadUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  // Update pagination when currentPage changes
  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  // Load stats from backend API
  const loadStats = async () => {
    try {
      const fetchedStats = await userService.getUserStats();
      setStats(fetchedStats);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load statistics',
        variant: 'destructive',
      });
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Call backend with server-side filtering
      const fetchedUsers = await userService.getAllUsers({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter.toUpperCase() : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      
      // Transform backend User to frontend User format
      const transformedUsers: User[] = fetchedUsers.map(user => ({
        id: user.id.toString(),
        userName: user.userName,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        email: user.email,
        contactOne: user.contactOne,
        contactTwo: user.contactTwo,
        address: user.address,
        role: user.role as Role,
        avatarUrl: undefined,
        status: user.enabled ? 'active' : 'disabled',
      }));
      
      // Store filtered users for pagination
      setFilteredUsers(transformedUsers);
      
      // Calculate pagination
      const total = Math.ceil(transformedUsers.length / usersPerPage);
      setTotalPages(total);
      
      // Get paginated users
      const startIndex = (currentPage - 1) * usersPerPage;
      const endIndex = startIndex + usersPerPage;
      const paginatedUsers = transformedUsers.slice(startIndex, endIndex);
      
      setUsers(paginatedUsers);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // No client-side filtering needed - all filtering is done server-side via API

  const handleCreateUser = async (newUser: Omit<User, 'id'>) => {
    try {
      await userService.createUser({
        userName: newUser.userName,
        email: newUser.email,
        contactOne: newUser.contactOne,
        password: (newUser as any).password || 'defaultPassword123',
        role: newUser.role.toUpperCase() as any,
      });
      
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: `User ${newUser.userName} has been created successfully.`,
      });
      
      await loadStats(); // Reload stats
      await loadUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    try {
      await userService.updateUser(parseInt(updatedUser.id), {
        userName: updatedUser.userName,
        contactOne: updatedUser.contactOne,
        contactTwo: updatedUser.contactTwo,
        address: updatedUser.address,
      });
      
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: `User ${updatedUser.userName} has been updated successfully.`,
      });
      
      await loadStats(); // Reload stats
      await loadUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      await userService.updateUserRole(parseInt(userId), {
        role: newRole.toUpperCase() as any,
      });
      
      setIsRolesDialogOpen(false);
      toast({
        title: 'Success',
        description: 'User role has been updated successfully.',
      });
      
      await loadStats(); // Reload stats
      await loadUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.deleteUser(parseInt(selectedUser.id));
      
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: 'Success',
        description: `User ${selectedUser.userName} has been deleted successfully.`,
      });
      
      await loadStats(); // Reload stats
      await loadUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newEnabled = user.status !== 'active';
      
      await userService.toggleUserStatus(parseInt(user.id), {
        enabled: newEnabled,
      });
      
      const newStatus = newEnabled ? 'active' : 'disabled';
      toast({
        title: 'Success',
        description: `User ${user.userName} has been ${newStatus === 'active' ? 'activated' : 'disabled'}.`,
      });
      
      await loadStats(); // Reload stats
      await loadUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to toggle status',
        variant: 'destructive',
      });
    }
  };

  const getUserName = (user: User) => user.userName;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'Admin':
        return 'bg-primary text-primary-foreground';
      case 'Employee':
        return 'bg-secondary text-secondary-foreground';
      case 'Customer':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const statsCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'text-green-600' },
    { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-primary' },
    { label: 'Employees', value: stats.employees, icon: Users, color: 'text-secondary' },
    { label: 'Customers', value: stats.customers, icon: Users, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all users, assign roles, and control access
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statsCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>
            Search, filter, and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as Role | 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-muted-foreground">Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatarUrl} alt={getUserName(user)} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(getUserName(user))}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{getUserName(user)}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{user.contactOne}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'active' ? 'default' : 'destructive'}
                          className={
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                          }
                        >
                          {user.status === 'active' ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsRolesDialogOpen(true);
                              }}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                              <Users className="h-4 w-4 mr-2" />
                              {user.status === 'active' ? 'Disable' : 'Activate'} User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateUser={handleCreateUser}
      />

      {selectedUser && (
        <>
          <EditUserDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            user={selectedUser}
            onEditUser={handleEditUser}
          />

          <ManageRolesDialog
            open={isRolesDialogOpen}
            onOpenChange={setIsRolesDialogOpen}
            user={selectedUser}
            onUpdateRole={handleUpdateRole}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user{' '}
              <span className="font-semibold">{selectedUser && getUserName(selectedUser)}</span> and remove their data
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
