import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, Loader2, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import * as authService from '@/services/authService';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      
      setResetSuccess(true);
      toast.success('Password reset successfully');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Show error if no token
  if (!token && !resetSuccess) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="w-full flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-hero shadow-glow">
                <Car className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Autonova</h1>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Invalid Reset Link</h2>
              <p className="text-muted-foreground">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Button
                onClick={() => navigate('/forgot-password')}
                className="w-full h-12"
              >
                Request New Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left side - Image */}
      <div className="hidden md:block w-1/2 bg-muted relative overflow-hidden animate-in fade-in slide-in-from-left-8 duration-1000">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 transition-all duration-500" />
        <img
          src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=2940&auto=format&fit=crop"
          alt="Professional car maintenance"
          className="object-cover h-full w-full transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent transition-opacity duration-500" />
        
        {/* Optional: Add overlay text */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <h3 className="text-3xl font-bold mb-4 drop-shadow-lg transition-all duration-300 hover:translate-x-2">
            Secure Your Account
          </h3>
          <p className="text-lg drop-shadow-md opacity-90 transition-all duration-300 hover:translate-x-2">
            Choose a strong password to keep your account safe
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-4 animate-in fade-in slide-in-from-right-4 duration-700">
          {/* Logo and Title */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-hero shadow-glow transition-all duration-300 hover:scale-110 hover:shadow-xl">
                <Car className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Autonova</h1>
            </div>
            
            <div className="space-y-2 animate-in fade-in slide-in-from-top-3 duration-700">
              <h2 className="text-3xl font-bold text-foreground">Reset Password</h2>
              <p className="text-muted-foreground">
                {resetSuccess 
                  ? "Your password has been reset successfully!"
                  : "Enter your new password below"}
              </p>
            </div>
          </div>

          {/* Form or Success Message */}
          {!resetSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    className="pl-10 pr-12 h-12"
                    {...register('password')}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-300">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    className="pl-10 pr-12 h-12"
                    {...register('confirmPassword')}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-300">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-sm font-medium shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="p-6 bg-primary/10 border border-primary/20 rounded-lg space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-primary animate-in zoom-in duration-500" />
                </div>
                <p className="text-sm text-foreground text-center">
                  Your password has been successfully reset. You will be redirected to the login page shortly.
                </p>
              </div>
              
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-12 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* Back to Forgot Password Link */}
          {!resetSuccess && (
            <div className="text-center animate-in fade-in duration-700 delay-500">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200 hover:underline underline-offset-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Forgot Password
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
