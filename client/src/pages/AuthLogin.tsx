import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Building2,
  DollarSign,
  Eye,
  EyeOff,
  Home,
  Info,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

// Type definitions
type AuthMode = 'signin' | 'signup';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface AuthLoginProps {
  mode?: AuthMode;
  selectedPlan?: string;
}

interface SocialLoginButtonsProps {
  mode: AuthMode;
  isLoading: boolean;
  onError: (error: string) => void;
}

interface BreadcrumbItem {
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

// Enhanced Universal Header Component
const UniversalHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Tagline */}
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center'>
                <Building2 className='w-5 h-5 text-white' />
              </div>
              <span className='text-xl font-bold text-gray-900'>YUTHUB</span>
            </div>
            <div className='hidden sm:block h-6 w-px bg-gray-300'></div>
            <span className='hidden sm:block text-sm text-gray-600 font-medium'>
              Empowering Youth Housing Solutions
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex space-x-8'>
            <a
              href='/'
              className='flex items-center space-x-1 text-blue-600 bg-blue-50 px-3 py-2 rounded-md text-sm font-medium'
            >
              <Home className='w-4 h-4' />
              <span>Home</span>
            </a>
            <a
              href='/features'
              className='flex items-center space-x-1 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors'
            >
              <Zap className='w-4 h-4' />
              <span>Features</span>
            </a>
            <a
              href='/about'
              className='flex items-center space-x-1 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors'
            >
              <Info className='w-4 h-4' />
              <span>About</span>
            </a>
            <a
              href='/pricing'
              className='flex items-center space-x-1 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors'
            >
              <DollarSign className='w-4 h-4' />
              <span>Pricing</span>
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className='flex items-center space-x-3'>
            <Button
              variant='outline'
              size='sm'
              className='hidden sm:inline-flex'
            >
              Sign In
            </Button>
            <Button size='sm' className='bg-blue-600 hover:bg-blue-700'>
              Sign Up
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type='button'
            title='Open mobile menu'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className='md:hidden py-4 border-t border-gray-200'>
            <div className='flex flex-col space-y-2'>
              <a
                href='/'
                className='flex items-center space-x-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-md text-sm font-medium'
              >
                <Home className='w-4 h-4' />
                <span>Home</span>
              </a>
              <a
                href='/features'
                className='flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium'
              >
                <Zap className='w-4 h-4' />
                <span>Features</span>
              </a>
              <a
                href='/about'
                className='flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium'
              >
                <Info className='w-4 h-4' />
                <span>About</span>
              </a>
              <a
                href='/pricing'
                className='flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium'
              >
                <DollarSign className='w-4 h-4' />
                <span>Pricing</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// Social Login Buttons Component
const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  mode,
  isLoading,
  onError,
}) => {
  const handleSocialLogin = (provider: string): void => {
    // Simulate social login
    setTimeout(() => {
      onError(`${provider} login will be available soon`);
    }, 1000);
  };

  return (
    <div className='grid grid-cols-2 gap-3'>
      <Button
        variant='outline'
        onClick={() => handleSocialLogin('Google')}
        disabled={isLoading}
        className='flex items-center justify-center space-x-2'
      >
        <svg className='w-4 h-4' viewBox='0 0 24 24'>
          <path
            fill='#4285F4'
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
          />
          <path
            fill='#34A853'
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
          />
          <path
            fill='#FBBC05'
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
          />
          <path
            fill='#EA4335'
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
          />
        </svg>
        <span>Google</span>
      </Button>

      <Button
        variant='outline'
        onClick={() => handleSocialLogin('Microsoft')}
        disabled={isLoading}
        className='flex items-center justify-center space-x-2'
      >
        <svg className='w-4 h-4' viewBox='0 0 24 24'>
          <path fill='#F25022' d='M1 1h10v10H1z' />
          <path fill='#00A4EF' d='M13 1h10v10H13z' />
          <path fill='#7FBA00' d='M1 13h10v10H1z' />
          <path fill='#FFB900' d='M13 13h10v10H13z' />
        </svg>
        <span>Microsoft</span>
      </Button>
    </div>
  );
};

// Breadcrumbs Component
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => (
  <nav className='flex mb-6' aria-label='Breadcrumb'>
    <ol className='flex items-center space-x-2'>
      <li>
        <a href='/' className='text-gray-500 hover:text-gray-700'>
          Home
        </a>
      </li>
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className='flex items-center'>
          <svg
            className='w-4 h-4 text-gray-400 mx-2'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
              clipRule='evenodd'
            />
          </svg>
          <span className='text-gray-900 font-medium'>{item.label}</span>
        </li>
      ))}
    </ol>
  </nav>
);

// Main Auth Component
const AuthLogin: React.FC<AuthLoginProps> = ({
  mode = 'signin',
  selectedPlan,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>(mode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password) {
      return 'Please fill in all required fields';
    }

    if (authMode === 'signup') {
      if (!formData.firstName || !formData.lastName) {
        return 'Please fill in all required fields';
      }
      if (formData.password !== formData.confirmPassword) {
        return 'Passwords do not match';
      }
      if (formData.password.length < 8) {
        return 'Password must be at least 8 characters';
      }
    }

    return null;
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (authMode === 'signup') {
        alert('Account created successfully! Welcome to YUTHUB.');
      } else {
        alert('Login successful! Redirecting to dashboard...');
      }
    }, 2000);
  };

  const handleSocialError = (error: string): void => {
    setError(error);
  };

  const resetForm = (): void => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    });
  };

  const toggleAuthMode = (): void => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    setError(null);
    resetForm();
  };

  const isSignUp = authMode === 'signup';

  return (
    <div className='min-h-screen bg-gray-50'>
      <UniversalHeader />

      <div className='max-w-md mx-auto py-12 px-4'>
        <Breadcrumbs items={[{ label: isSignUp ? 'Sign Up' : 'Sign In' }]} />

        <Card className='shadow-lg'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className='text-gray-600'>
              {isSignUp
                ? 'Join YUTHUB and start managing your youth housing effectively'
                : 'Sign in to your YUTHUB account to continue'}
            </CardDescription>
            {selectedPlan && (
              <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  Selected Plan:{' '}
                  <span className='font-semibold capitalize'>
                    {selectedPlan}
                  </span>
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent className='space-y-6'>
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Social Login Buttons */}
            <SocialLoginButtons
              mode={authMode}
              isLoading={isLoading}
              onError={handleSocialError}
            />

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-white px-3 text-gray-500 font-medium'>
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <div className='space-y-4'>
              {isSignUp && (
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label
                      htmlFor='firstName'
                      className='text-sm font-medium text-gray-700'
                    >
                      First Name
                    </Label>
                    <Input
                      id='firstName'
                      type='text'
                      value={formData.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('firstName', e.target.value)
                      }
                      disabled={isLoading}
                      className='mt-1'
                      placeholder='John'
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor='lastName'
                      className='text-sm font-medium text-gray-700'
                    >
                      Last Name
                    </Label>
                    <Input
                      id='lastName'
                      type='text'
                      value={formData.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('lastName', e.target.value)
                      }
                      disabled={isLoading}
                      className='mt-1'
                      placeholder='Doe'
                    />
                  </div>
                </div>
              )}

              <div>
                <Label
                  htmlFor='email'
                  className='text-sm font-medium text-gray-700'
                >
                  Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('email', e.target.value)
                  }
                  disabled={isLoading}
                  autoComplete='email'
                  className='mt-1'
                  placeholder='you@example.com'
                />
              </div>

              <div>
                <Label
                  htmlFor='password'
                  className='text-sm font-medium text-gray-700'
                >
                  Password
                </Label>
                <div className='relative mt-1'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('password', e.target.value)
                    }
                    disabled={isLoading}
                    autoComplete={
                      isSignUp ? 'new-password' : 'current-password'
                    }
                    placeholder={
                      isSignUp ? 'At least 8 characters' : 'Enter your password'
                    }
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4 text-gray-400' />
                    ) : (
                      <Eye className='h-4 w-4 text-gray-400' />
                    )}
                  </Button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <Label
                    htmlFor='confirmPassword'
                    className='text-sm font-medium text-gray-700'
                  >
                    Confirm Password
                  </Label>
                  <div className='relative mt-1'>
                    <Input
                      id='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      disabled={isLoading}
                      autoComplete='new-password'
                      placeholder='Confirm your password'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4 text-gray-400' />
                      ) : (
                        <Eye className='h-4 w-4 text-gray-400' />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                className='w-full bg-blue-600 hover:bg-blue-700'
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className='flex items-center space-x-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span>Please wait...</span>
                  </div>
                ) : isSignUp ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>

            <div className='text-center text-sm'>
              <p className='text-gray-600'>
                {isSignUp
                  ? 'Already have an account?'
                  : "Don't have an account?"}
              </p>
              <Button
                variant='link'
                className='p-0 h-auto text-blue-600 hover:underline font-medium'
                onClick={toggleAuthMode}
                disabled={isLoading}
              >
                {isSignUp ? 'Sign in here' : 'Sign up here'}
              </Button>
            </div>

            {!isSignUp && (
              <div className='text-center'>
                <Button
                  variant='link'
                  className='p-0 h-auto text-sm text-gray-600 hover:underline'
                  onClick={() =>
                    alert(
                      'Password reset functionality will be available soon.'
                    )
                  }
                  disabled={isLoading}
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            <div className='text-center text-xs text-gray-500'>
              <p>
                By continuing, you agree to our{' '}
                <a href='/terms' className='text-blue-600 hover:underline'>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href='/privacy' className='text-blue-600 hover:underline'>
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLogin;
