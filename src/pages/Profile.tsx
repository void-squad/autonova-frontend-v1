import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Mail } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import * as authService from '@/services/authService';
import type { MessageResponse } from '@/services/authService';
import type { AuthUser, CustomerUpdate, ProfileResponse } from '@/types';

const profileFormSchema = z.object({
  userName: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  contactOne: z.string(),
  contactTwo: z.string(),
  address: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const toFormValues = (profile: ProfileResponse | null): ProfileFormValues => ({
  userName: profile?.user.userName ?? '',
  email: profile?.user.email ?? '',
  firstName: profile?.user.firstName ?? profile?.customer?.firstName ?? '',
  lastName: profile?.user.lastName ?? profile?.customer?.lastName ?? '',
  contactOne: profile?.user.contactOne ?? profile?.customer?.phoneNumber ?? '',
  contactTwo: profile?.user.contactTwo ?? '',
  address: profile?.user.address ?? '',
  password: '',
  confirmPassword: '',
});

const sanitizeOptional = (value?: string | null) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isObjectLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isMessagePayload = (value: unknown): value is MessageResponse =>
  isObjectLike(value) && ('message' in value || 'success' in value);

const isProfilePayload = (value: unknown): value is ProfileResponse => {
  if (!isObjectLike(value)) {
    return false;
  }

  const candidate = value as Partial<ProfileResponse>;
  return isObjectLike(candidate.user);
};

type DetailRowProps = {
  label: string;
  value: ReactNode;
};

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="flex items-start justify-between gap-3 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="max-w-[60%] break-words text-right text-foreground">
      {value}
    </span>
  </div>
);

const Profile = () => {
  const { user, updateUser, logout: logoutUser } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: toFormValues(null),
    mode: 'onChange',
  });

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authService.getProfile();
      setProfile(data);
      form.reset(toFormValues(data));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to load your profile. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const buildUpdatePayload = (
    values: ProfileFormValues,
    dirty: Partial<Record<keyof ProfileFormValues, boolean>>
  ): CustomerUpdate => {
    const payload: CustomerUpdate = {};

    const requireValue = (value: string, message: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        throw new Error(message);
      }
      return trimmed;
    };

    if (dirty.userName) {
      const value = requireValue(values.userName, 'User name is required');
      if (value.length < 2) {
        throw new Error('User name must be at least 2 characters.');
      }
      if (value.length > 255) {
        throw new Error('User name must be under 255 characters.');
      }
      payload.userName = value;
    }

    if (dirty.email) {
      const value = requireValue(values.email, 'Email is required');
      if (value.length > 255) {
        throw new Error('Email must be under 255 characters.');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw new Error('Enter a valid email address.');
      }
      payload.email = value;
    }

    if (dirty.contactOne) {
      const value = requireValue(
        values.contactOne,
        'Primary contact is required'
      );
      if (value.length > 20) {
        throw new Error('Primary contact must be under 20 characters.');
      }
      payload.contactOne = value;
    }

    if (dirty.firstName) {
      const normalized = sanitizeOptional(values.firstName);
      if (typeof normalized === 'string' && normalized.length > 255) {
        throw new Error('First name must be under 255 characters.');
      }
      payload.firstName = normalized;
    }

    if (dirty.lastName) {
      const normalized = sanitizeOptional(values.lastName);
      if (typeof normalized === 'string' && normalized.length > 255) {
        throw new Error('Last name must be under 255 characters.');
      }
      payload.lastName = normalized;
    }

    if (dirty.contactTwo) {
      const normalized = sanitizeOptional(values.contactTwo);
      if (typeof normalized === 'string' && normalized.length > 20) {
        throw new Error('Secondary contact must be under 20 characters.');
      }
      payload.contactTwo = normalized;
    }

    if (dirty.address) {
      const normalized = sanitizeOptional(values.address);
      if (typeof normalized === 'string' && normalized.length > 500) {
        throw new Error('Address must be under 500 characters.');
      }
      payload.address = normalized;
    }

    const passwordDirty = dirty.password || dirty.confirmPassword;
    if (passwordDirty) {
      const password = values.password.trim();
      const confirm = values.confirmPassword.trim();

      if (!password || !confirm) {
        throw new Error('Enter and confirm your new password.');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      if (password.length > 255) {
        throw new Error('Password must be under 255 characters.');
      }

      if (password !== confirm) {
        throw new Error('Passwords do not match.');
      }

      payload.password = password;
    }

    return payload;
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    if (!profile?.user) {
      toast.error('Profile not loaded yet. Please refresh and try again.');
      return;
    }

    try {
      const payload = buildUpdatePayload(values, form.formState.dirtyFields);

      if (Object.keys(payload).length === 0) {
        toast('No changes to update.');
        return;
      }

      setIsSaving(true);
      const targetUserId = user?.id ?? profile.user.id;
      if (!targetUserId) {
        throw new Error('Unable to determine your account for this update.');
      }

      const response = await authService.updateProfile(targetUserId, payload);

      if (isMessagePayload(response) && response.success === false) {
        throw new Error(
          response.message ??
            'We could not update your profile. Please try again.'
        );
      }

      const fallbackSuccessMessage = 'Profile updated successfully.';
      const responseMessage = isMessagePayload(response)
        ? response.message ?? fallbackSuccessMessage
        : fallbackSuccessMessage;

      if (payload.password) {
        const passwordMessage =
          responseMessage === fallbackSuccessMessage
            ? 'Password updated successfully. Please sign in again.'
            : responseMessage;
        toast.success(passwordMessage);
        await logoutUser();
        return;
      }

      const nextProfile = isProfilePayload(response)
        ? response
        : await authService.getProfile();

      setProfile(nextProfile);
      form.reset(toFormValues(nextProfile));

      const sessionPatch: Partial<AuthUser> = {};
      if (payload.userName) {
        sessionPatch.userName = nextProfile.user.userName ?? payload.userName;
      }
      if (payload.email) {
        sessionPatch.email = nextProfile.user.email ?? payload.email;
      }
      if (payload.firstName !== undefined) {
        sessionPatch.firstName =
          nextProfile.user.firstName ?? payload.firstName ?? null;
      }
      if (payload.lastName !== undefined) {
        sessionPatch.lastName =
          nextProfile.user.lastName ?? payload.lastName ?? null;
      }
      if (payload.contactOne) {
        sessionPatch.contactOne =
          nextProfile.user.contactOne ?? payload.contactOne ?? null;
      }
      if (payload.contactTwo !== undefined) {
        sessionPatch.contactTwo =
          nextProfile.user.contactTwo ?? payload.contactTwo ?? null;
      }
      if (payload.address !== undefined) {
        sessionPatch.address =
          nextProfile.user.address ?? payload.address ?? null;
      }
      if (Object.keys(sessionPatch).length > 0) {
        updateUser(sessionPatch);
      }

      toast.success(responseMessage);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not update your profile. Please try again.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      form.reset(toFormValues(profile));
    }
  };

  const detailValue = (value?: string | number | boolean | null) => {
    if (value === undefined || value === null) {
      return '—';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return '—';
    }

    return value;
  };

  const vehicles = profile?.customer?.vehicles ?? [];

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      await authService.deleteProfile();
      toast.success('Your account has been deleted.');
      setIsDeleteDialogOpen(false);
      await logoutUser();
      navigate('/login', { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not delete your profile. Please try again.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Update your personal information and security details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account information</CardTitle>
            <CardDescription>
              Only the fields you change will be sent to the server.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="userName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>User name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your user name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactOne"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary contact</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Primary phone number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactTwo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary contact</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Optional secondary number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Your mailing address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Leave blank to keep current"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Repeat new password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t bg-muted/50 py-4 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading || isSaving || !form.formState.isDirty}
                >
                  Reset changes
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isSaving || !form.formState.isDirty}
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current details</CardTitle>
            <CardDescription>
              Quick view of your latest saved information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {isLoading || !profile ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-44" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      Account Info
                    </span>
                  </div>
                  <div className="space-y-2 rounded-md border border-border/60 bg-muted/40 p-3">
                    <DetailRow
                      label="User ID"
                      value={detailValue(profile.user.id)}
                    />
                    <DetailRow
                      label="User name"
                      value={detailValue(profile.user.userName)}
                    />
                    <DetailRow
                      label="First name"
                      value={detailValue(
                        profile.user.firstName ?? profile.customer?.firstName
                      )}
                    />
                    <DetailRow
                      label="Last name"
                      value={detailValue(
                        profile.user.lastName ?? profile.customer?.lastName
                      )}
                    />
                    <DetailRow
                      label="Email"
                      value={detailValue(profile.user.email)}
                    />
                    <DetailRow
                      label="Primary contact"
                      value={detailValue(
                        profile.user.contactOne ??
                          profile.customer?.phoneNumber ??
                          '—'
                      )}
                    />
                    <DetailRow
                      label="Secondary contact"
                      value={detailValue(profile.user.contactTwo)}
                    />
                    <DetailRow
                      label="Address"
                      value={detailValue(profile.user.address)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      Vehicles
                    </span>
                  </div>
                  {vehicles.length > 0 ? (
                    <ul className="space-y-2 rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
                      {vehicles.map((vehicle) => (
                        <li
                          key={vehicle.id}
                          className="space-y-1 border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </span>
                          <div className="grid gap-1 uppercase tracking-wide">
                            <span>VIN {vehicle.vin}</span>
                            <span>Plate {vehicle.licensePlate}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="pl-7 text-xs text-muted-foreground">
                      No vehicles recorded yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/60 bg-destructive/5">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Permanently remove your profile and associated customer data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. You will lose access to your account
            and need to register again to use Autonova.
          </p>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                Delete profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete profile?</DialogTitle>
                <DialogDescription>
                  This will permanently remove your profile and linked vehicles.
                  You will be signed out immediately.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isDeleting}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProfile}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
