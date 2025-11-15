import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { apiConfig } from '@/lib/api/axios-config';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle OAuth2 errors passed from callback
  useEffect(() => {
    if (location.state?.error) {
      toast.error(location.state.error);
      // Clear the error from location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const authUser = await login({
        email: data.email,
        password: data.password,
      });
      const role = authUser.role?.toUpperCase();

      if (role === 'ADMIN') {
        toast.success('Welcome Admin!');
        navigate('/admin', { replace: true });
        return;
      }

      if (role === 'EMPLOYEE') {
        toast.success('Welcome Employee!');
        navigate('/employee', { replace: true });
        return;
      }

      toast.success('Welcome Customer!');
      navigate('/customer', { replace: true });
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-4 animate-in fade-in slide-in-from-left-4 duration-700">
          {/* Logo and Title */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-hero shadow-glow transition-all duration-300 hover:scale-110 hover:shadow-xl">
                <Car className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Autonova</h1>
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-top-3 duration-700">
              <h2 className="text-3xl font-bold text-foreground">
                Welcome Back
              </h2>
              <p className="text-muted-foreground">
                Sign in to continue to your account.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
          >
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
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
                <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-300">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12"
                  {...register('password')}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-300">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 group">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setValue('rememberMe', checked as boolean)
                  }
                  className="transition-all duration-200"
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-normal text-foreground cursor-pointer transition-colors duration-200 group-hover:text-primary"
                >
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200 hover:underline underline-offset-4"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 text-sm font-medium shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 animate-in fade-in duration-700 delay-300">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-sm font-medium hover:bg-muted transition-all duration-300 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 delay-400"
            disabled={loading}
            onClick={() => {
              window.location.href = `${apiConfig.API_BASE_URL}/oauth2/authorization/google`;
            }}
          >
            <svg
              className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Login with Google
          </Button>

          {/* Sign Up Link */}
          <div className="text-center animate-in fade-in duration-700 delay-500">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary/80 transition-all duration-200 hover:underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block w-1/2 bg-muted relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-1000">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 transition-all duration-500" />
        <img
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2832&auto=format&fit=crop"
          alt="A mechanic working on a car"
          className="object-cover h-full w-full transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent transition-opacity duration-500" />

        {/* Optional: Add overlay text */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <h3 className="text-3xl font-bold mb-4 drop-shadow-lg transition-all duration-300 hover:translate-x-2">
            Your Trusted Auto Care Partner
          </h3>
          <p className="text-lg drop-shadow-md opacity-90 transition-all duration-300 hover:translate-x-2">
            Professional service and maintenance for your vehicle
          </p>
        </div>
      </div>
    </div>
  );
}
