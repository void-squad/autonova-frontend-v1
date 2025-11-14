import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Role, User } from '@/types';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (user: Omit<User, 'id'>) => void;
}

export default function CreateUserDialog({
  open,
  onOpenChange,
  onCreateUser,
}: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    contactOne: '',
    password: '',
    role: '' as Role | '',
    status: 'active' as 'active' | 'disabled',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.contactOne.trim()) {
      newErrors.contactOne = 'Contact number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onCreateUser({
      ...formData,
      role: formData.role as Role,
      contactTwo: undefined,
      avatarUrl: undefined,
    });

    // Reset form
    setFormData({
      userName: '',
      email: '',
      contactOne: '',
      password: '',
      role: '',
      status: 'active',
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleRoleChange = (role: Role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
    setErrors((prev) => ({ ...prev, role: '' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign roles. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="userName">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userName"
                placeholder="johndoe"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className={errors.userName ? 'border-destructive' : ''}
              />
              {errors.userName && (
                <p className="text-sm text-destructive">{errors.userName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactOne">
                Contact Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactOne"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.contactOne}
                onChange={(e) => setFormData({ ...formData, contactOne: e.target.value })}
                className={errors.contactOne ? 'border-destructive' : ''}
              />
              {errors.contactOne && (
                <p className="text-sm text-destructive">{errors.contactOne}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? 'border-destructive' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <span className="text-sm">Hide</span>
                  ) : (
                    <span className="text-sm">Show</span>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Assign Role <span className="text-destructive">*</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select one role for this user. Each user can only have one role.
              </p>
            </div>

            <div className="space-y-3">
              <div 
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.role === 'Admin' ? 'border-primary bg-primary/5' : 'bg-card hover:bg-accent/5'
                }`}
                onClick={() => handleRoleChange('Admin')}
              >
                <input
                  type="radio"
                  id="role-admin"
                  name="role"
                  checked={formData.role === 'Admin'}
                  onChange={() => handleRoleChange('Admin')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="role-admin"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Admin
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Full access to all system features and settings
                  </p>
                </div>
              </div>

              <div 
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.role === 'Employee' ? 'border-primary bg-primary/5' : 'bg-card hover:bg-accent/5'
                }`}
                onClick={() => handleRoleChange('Employee')}
              >
                <input
                  type="radio"
                  id="role-employee"
                  name="role"
                  checked={formData.role === 'Employee'}
                  onChange={() => handleRoleChange('Employee')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="role-employee"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Employee
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Access to employee dashboard, time logs, and assigned tasks
                  </p>
                </div>
              </div>

              <div 
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.role === 'Customer' ? 'border-primary bg-primary/5' : 'bg-card hover:bg-accent/5'
                }`}
                onClick={() => handleRoleChange('Customer')}
              >
                <input
                  type="radio"
                  id="role-customer"
                  name="role"
                  checked={formData.role === 'Customer'}
                  onChange={() => handleRoleChange('Customer')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="role-customer"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Customer
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Access to book appointments and view service history
                  </p>
                </div>
              </div>
            </div>

            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>

          {/* Account Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Account Status</h3>
            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
              <Checkbox
                id="status-active"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 'active' : 'disabled' })
                }
              />
              <Label htmlFor="status-active" className="cursor-pointer">
                Active (User can log in and access the system)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFormData({
                  userName: '',
                  email: '',
                  contactOne: '',
                  password: '',
                  role: '',
                  status: 'active',
                });
                setErrors({});
                setShowPassword(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
