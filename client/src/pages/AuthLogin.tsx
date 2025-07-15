import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import SEOHead from '@/components/SEO/SEOHead';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';
import SocialLoginButtons from '@/components/Auth/SocialLoginButtons';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  subscriptionTier: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthLoginProps {
  mode?: 'signin' | 'signup';
  selectedPlan?: string;
}

export default function AuthLogin({ mode = 'signin', selectedPlan }: AuthLoginProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      subscriptionTier: selectedPlan || 'trial',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Welcome back! Redirecting to your dashboard...",
        });
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        toast({
          title: "Account Created",
          description: response.needsEmailVerification 
            ? "Please check your email to verify your account."
            : "Welcome! Redirecting to your dashboard...",
        });
        
        if (!response.needsEmailVerification) {
          window.location.href = '/dashboard';
        }
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialError = (error: string) => {
    setError(error);
    toast({
      title: "Authentication Error",
      description: error,
      variant: "destructive",
    });
  };

  const isSignUp = authMode === 'signup';
  const currentForm = isSignUp ? registerForm : loginForm;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={isSignUp ? "Sign Up - YUTHUB" : "Sign In - YUTHUB"}
        description={isSignUp ? "Create your YUTHUB account and start managing youth housing effectively." : "Sign in to your YUTHUB account to access the youth housing management platform."}
        keywords={isSignUp ? "sign up YUTHUB, create account, youth housing registration" : "sign in YUTHUB, login, youth housing authentication"}
        canonicalUrl={isSignUp ? "https://yuthub.com/signup" : "https://yuthub.com/login"}
      />
      <UniversalHeader />
      
      <div className="max-w-md mx-auto py-12 px-4">
        <Breadcrumbs items={[{ label: isSignUp ? 'Sign Up' : 'Sign In' }]} />
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Join YUTHUB and start managing your youth housing effectively'
                : 'Sign in to your YUTHUB account to continue'
              }
            </CardDescription>
            {selectedPlan && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Selected Plan: <span className="font-semibold">{selectedPlan}</span>
                </p>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Social Login Buttons */}
            <SocialLoginButtons 
              mode={authMode} 
              isLoading={isLoading}
              onError={handleSocialError}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={currentForm.handleSubmit(isSignUp ? handleRegister : handleLogin)} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      {...registerForm.register('firstName')}
                      disabled={isLoading}
                    />
                    {registerForm.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      {...registerForm.register('lastName')}
                      disabled={isLoading}
                    />
                    {registerForm.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...currentForm.register('email')}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {currentForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {currentForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...currentForm.register('password')}
                    disabled={isLoading}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {currentForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {currentForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {isSignUp && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...registerForm.register('confirmPassword')}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="text-center text-sm">
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:underline"
                onClick={() => {
                  setAuthMode(isSignUp ? 'signin' : 'signup');
                  setError(null);
                  currentForm.reset();
                }}
                disabled={isLoading}
              >
                {isSignUp ? 'Sign in here' : 'Sign up here'}
              </Button>
            </div>

            {!isSignUp && (
              <div className="text-center">
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-gray-600 hover:underline"
                  onClick={() => {
                    // TODO: Implement forgot password
                    toast({
                      title: "Password Reset",
                      description: "Password reset functionality will be available soon.",
                    });
                  }}
                  disabled={isLoading}
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            <div className="text-center text-xs text-gray-500">
              <p>
                By continuing, you agree to our{' '}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <UniversalFooter />
    </div>
  );
}