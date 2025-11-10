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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onEditUser: (user: User) => void;
}

export default function EditUserDialog({
  open,
  onOpenChange,
  user,
  onEditUser,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    userName: user.userName,
    contactOne: user.contactOne,
    contactTwo: user.contactTwo || '',
    address: user.address || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      userName: user.userName,
      contactOne: user.contactOne,
      contactTwo: user.contactTwo || '',
      address: user.address || '',
    });
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    }

    if (!formData.contactOne.trim()) {
      newErrors.contactOne = 'Contact number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onEditUser({
      ...user,
      ...formData,
    });

    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-userName">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-userName"
                placeholder="johndoe"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className={errors.userName ? 'border-destructive' : ''}
              />
              {errors.userName && (
                <p className="text-sm text-destructive">{errors.userName}</p>
              )}
            </div>

            {/* Contact Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-contactOne">
                  Contact Number 1 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-contactOne"
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
                <Label htmlFor="edit-contactTwo">Contact Number 2 (Optional)</Label>
                <Input
                  id="edit-contactTwo"
                  type="tel"
                  placeholder="+1 234 567 8901"
                  value={formData.contactTwo}
                  onChange={(e) => setFormData({ ...formData, contactTwo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address (Optional)</Label>
              <Textarea
                id="edit-address"
                placeholder="123 Main St, City, State, ZIP"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
