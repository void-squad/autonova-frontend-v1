import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      // TODO: Implement actual forgot password API call
      // await authApi.forgotPassword(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left side - Image */}
      <div className="hidden md:block w-1/2 bg-muted relative overflow-hidden animate-in fade-in slide-in-from-left-8 duration-1000">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 transition-all duration-500" />
        <img
          src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2940&auto=format&fit=crop"
          alt="Luxury car being serviced"
          className="object-cover h-full w-full transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent transition-opacity duration-500" />
        
        {/* Optional: Add overlay text */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <h3 className="text-3xl font-bold mb-4 drop-shadow-lg transition-all duration-300 hover:translate-x-2">
            Need Help Accessing Your Account?
          </h3>
          <p className="text-lg drop-shadow-md opacity-90 transition-all duration-300 hover:translate-x-2">
            We'll help you get back on track in no time
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
              <h2 className="text-3xl font-bold text-foreground">Forgot Password?</h2>
              <p className="text-muted-foreground">
                {emailSent 
                  ? "Check your email for a link to reset your password."
                  : "Enter the email address associated with your account and we'll send you a link to reset your password."}
              </p>
            </div>
          </div>

          {/* Form or Success Message */}
          {!emailSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12"
                    {...register('email')}
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-300">{errors.email.message}</p>
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
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-foreground text-center">
                  If an account exists with this email, you will receive a password reset link shortly.
                </p>
              </div>
              
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full h-12 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Try Another Email
              </Button>
            </div>
          )}

          {/* Back to Sign In Link */}
          <div className="text-center animate-in fade-in duration-700 delay-500">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200 hover:underline underline-offset-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
