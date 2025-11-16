import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Car,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowLeft,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const signupSchema = z
  .object({
    userName: z.string().min(2, 'User name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    contactNumber: z
      .string()
      .min(10, 'Contact number must be at least 10 digits')
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      termsAccepted: false,
    },
  });

  const termsAccepted = watch('termsAccepted');

  const validateStep1 = async () => {
    const result = await trigger([
      'userName',
      'email',
      'contactNumber',
    ]);
    if (result) {
      setCurrentStep(2);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      // All new users are created as CUSTOMER by default
      // Admins can change roles later in User Management
      await signup({
        userName: data.userName,
        email: data.email,
        password: data.password,
        contactNumber: data.contactNumber,
        role: 'CUSTOMER' // Always CUSTOMER for self-signup
      });

      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
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
                Welcome to Autonova
              </h2>
              <p className="text-muted-foreground">
                {currentStep === 1
                  ? 'Sign up to get started with your vehicle services.'
                  : 'Complete your account setup.'}
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div
              className={`h-2 w-16 rounded-full transition-all duration-300 ${
                currentStep === 1 ? 'bg-primary' : 'bg-primary/30'
              }`}
            />
            <div
              className={`h-2 w-16 rounded-full transition-all duration-300 ${
                currentStep === 2 ? 'bg-primary' : 'bg-muted'
              }`}
            />
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* User Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="userName"
                    className="text-sm font-medium text-foreground"
                  >
                    User Name
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="userName"
                      type="text"
                      placeholder="Enter a user name"
                      className="pl-10 h-12"
                      {...register('userName')}
                      disabled={loading}
                    />
                  </div>
                  {errors.userName && (
                    <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-300">
                      {errors.userName.message}
                    </p>
                  )}
                </div>

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

                {/* Contact Number Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="contactNumber"
                    className="text-sm font-medium text-foreground"
                  >
                    Contact Number
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="contactNumber"
                      type="tel"
                      placeholder="Enter your contact number"
                      className="pl-10 h-12"
                      {...register('contactNumber')}
                      disabled={loading}
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-300">
                      {errors.contactNumber.message}
                    </p>
                  )}
                </div>

                {/* Next Button */}
                <Button
                  type="button"
                  onClick={validateStep1}
                  className="w-full h-12 text-sm font-medium shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Security & Terms */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
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

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 h-12"
                      {...register('confirmPassword')}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
                      disabled={loading}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-300">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) =>
                        setValue('termsAccepted', checked as boolean)
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal text-foreground cursor-pointer leading-relaxed"
                    >
                      I agree to the{' '}
                      <Link
                        to="/terms"
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        to="/privacy"
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </Label>
                  </div>
                  {errors.termsAccepted && (
                    <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-300">
                      {errors.termsAccepted.message}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="h-12 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-sm font-medium shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="text-center animate-in fade-in duration-700 delay-500">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80 transition-all duration-200 hover:underline underline-offset-4"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block w-1/2 bg-muted relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-1000">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 transition-all duration-500" />
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2883&auto=format&fit=crop"
          alt="A luxury car in a modern garage"
          className="object-cover h-full w-full transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent transition-opacity duration-500" />

        {/* Optional: Add overlay text */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <h3 className="text-3xl font-bold mb-4 drop-shadow-lg transition-all duration-300 hover:translate-x-2">
            Join Our Community
          </h3>
          <p className="text-lg drop-shadow-md opacity-90 transition-all duration-300 hover:translate-x-2">
            Get access to premium automotive services and exclusive benefits
          </p>
        </div>
      </div>
    </div>
  );
}
