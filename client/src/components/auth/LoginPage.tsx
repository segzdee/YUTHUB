import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginPageProps {
  onLogin?: () => void;
  redirectTo?: string;
}

export default function LoginPage({ onLogin, redirectTo }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && redirectTo) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, redirectTo]);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For OIDC flow, redirect to the login endpoint
      // In a real implementation, this would handle the local auth flow
      window.location.href = '/api/login';
    } catch (err) {
      setError('Unable to sign in. Please check your credentials and try again.');
      setIsLoading(false);
    }
  };

  const handleOIDCLogin = () => {
    setIsLoading(true);
    window.location.href = '/api/login';
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    // In a real implementation, this would handle password reset
    setError('Password reset functionality will be available soon. Please contact support for assistance.');
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, text: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const levels = [
      { level: 0, text: '', color: '' },
      { level: 1, text: 'Very Weak', color: 'bg-error' },
      { level: 2, text: 'Weak', color: 'bg-warning' },
      { level: 3, text: 'Fair', color: 'bg-info' },
      { level: 4, text: 'Good', color: 'bg-success' },
      { level: 5, text: 'Strong', color: 'bg-success' }
    ];
    
    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-high-contrast">YUTHUB</h1>
          <p className="text-medium-contrast mt-2">Youth Housing Management System</p>
        </div>

        {/* Security Indicators */}
        <div className="flex items-center justify-center mb-6 space-x-4">
          <div className="flex items-center space-x-2 text-sm text-success">
            <Lock className="h-4 w-4" />
            <span>Secure Login</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-success">
            <Shield className="h-4 w-4" />
            <span>SSL Protected</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-high-contrast">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-medium-contrast">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <Alert className="border-error bg-error/10">
                <AlertCircle className="h-4 w-4 text-error" />
                <AlertDescription className="text-error">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-high-contrast">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`transition-all duration-200 touch-target ${
                    validationErrors.email ? 'border-error focus:border-error' : 'focus:border-primary'
                  }`}
                  disabled={isLoading}
                  aria-describedby={validationErrors.email ? "email-error" : undefined}
                  aria-invalid={!!validationErrors.email}
                />
                {validationErrors.email && (
                  <p id="email-error" className="text-sm text-error mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-high-contrast">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pr-10 transition-all duration-200 touch-target ${
                      validationErrors.password ? 'border-error focus:border-error' : 'focus:border-primary'
                    }`}
                    disabled={isLoading}
                    aria-describedby={validationErrors.password ? "password-error" : undefined}
                    aria-invalid={!!validationErrors.password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-medium-contrast hover:text-high-contrast transition-colors touch-target min-w-[44px]"
                    onClick={handlePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p id="password-error" className="text-sm text-error mt-1">
                    {validationErrors.password}
                  </p>
                )}
                {password && passwordStrength.level > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-medium-contrast">
                        {passwordStrength.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-600 text-primary-foreground transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-medium-contrast">Or continue with</span>
              </div>
            </div>

            {/* OIDC Login */}
            <Button
              onClick={handleOIDCLogin}
              variant="outline"
              className="w-full border-neutral-300 hover:bg-neutral-50 transition-colors duration-200"
              disabled={isLoading}
              size="lg"
            >
              <Shield className="mr-2 h-4 w-4" />
              Single Sign-On
            </Button>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-medium-contrast">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>GDPR Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>256-bit SSL</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-medium-contrast">
          <p>
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-primary hover:text-primary-600 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:text-primary-600 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}