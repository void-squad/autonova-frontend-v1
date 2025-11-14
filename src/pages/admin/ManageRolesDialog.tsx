import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Role, User } from '@/types';
import { Shield, Users, UserCheck } from 'lucide-react';

interface ManageRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onUpdateRole: (userId: string, role: Role) => void;
}

export default function ManageRolesDialog({
  open,
  onOpenChange,
  user,
  onUpdateRole,
}: ManageRolesDialogProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedRole(user.role);
    setError('');
  }, [user]);

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setError('A role must be selected');
      return;
    }

    onUpdateRole(user.id, selectedRole);
    setError('');
  };

  const roleConfigs = [
    {
      role: 'Admin' as Role,
      icon: Shield,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'Full access to all system features and settings',
      permissions: [
        'Manage all users and roles',
        'View and manage all appointments',
        'Access analytics and reports',
        'Configure system settings',
      ],
    },
    {
      role: 'Employee' as Role,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      description: 'Access to employee dashboard, time logs, and assigned tasks',
      permissions: [
        'View assigned tasks and projects',
        'Log work hours and activities',
        'Update project progress',
        'Communicate with team members',
      ],
    },
    {
      role: 'Customer' as Role,
      icon: UserCheck,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      description: 'Access to book appointments and view service history',
      permissions: [
        'Book and manage appointments',
        'View service history',
        'Track vehicle information',
        'Receive notifications',
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Change the role for{' '}
            <span className="font-semibold">{user.firstName} {user.lastName}</span>. Each user can only have one role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Role */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Role</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
              <Badge variant="outline" className="font-semibold">
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Select Role <span className="text-destructive">*</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose one role to grant appropriate permissions
              </p>
            </div>

            <div className="space-y-4">
              {roleConfigs.map(({ role, icon: Icon, color, bgColor, description, permissions }) => (
                <div
                  key={role}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedRole === role
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'bg-card hover:bg-accent/5'
                  }`}
                  onClick={() => handleRoleChange(role)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id={`role-${role}`}
                      name="role"
                      checked={selectedRole === role}
                      onChange={() => handleRoleChange(role)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${bgColor}`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                          </div>
                          <div>
                            <Label
                              htmlFor={`role-${role}`}
                              className="text-base font-semibold cursor-pointer"
                            >
                              {role}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {description}
                            </p>
                          </div>
                        </div>
                        {selectedRole === role && (
                          <Badge className="bg-primary text-primary-foreground">
                            Selected
                          </Badge>
                        )}
                      </div>

                      {/* Permissions List */}
                      <div className="pl-11 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Key Permissions
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {permissions.map((permission, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{permission}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Role Change Summary */}
          {selectedRole !== user.role && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm font-medium mb-2">Role Change</p>
              <div className="space-y-2 text-sm">
                <p className="text-destructive">
                  Removing role: <span className="font-semibold">{user.role}</span>
                </p>
                <p className="text-green-600">
                  Assigning role: <span className="font-semibold">{selectedRole}</span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedRole(user.role);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedRole}>
              Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
