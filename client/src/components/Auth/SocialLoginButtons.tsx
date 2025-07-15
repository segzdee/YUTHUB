import { Button } from '@/components/ui/button';
import { Chrome, Apple, Shield, Building } from 'lucide-react';

interface SocialLoginButtonsProps {
  mode: 'signin' | 'signup';
  isLoading?: boolean;
  onError?: (error: string) => void;
}

export default function SocialLoginButtons({ mode, isLoading, onError }: SocialLoginButtonsProps) {
  const handleSocialLogin = (provider: string) => {
    if (isLoading) return;
    
    try {
      const baseUrl = window.location.origin;
      const authUrls = {
        google: `${baseUrl}/auth/google`,
        microsoft: `${baseUrl}/auth/microsoft`,
        apple: `${baseUrl}/auth/apple`,
        replit: `${baseUrl}/api/login`, // Existing Replit OIDC
      };

      const url = authUrls[provider as keyof typeof authUrls];
      if (url) {
        window.location.href = url;
      } else {
        onError?.(`${provider} authentication is not configured`);
      }
    } catch (error) {
      onError?.(`Failed to initialize ${provider} authentication`);
    }
  };

  const actionText = mode === 'signin' ? 'Sign in with' : 'Sign up with';

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or {mode === 'signin' ? 'sign in' : 'sign up'} with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialLogin('google')}
          className="flex items-center space-x-2"
        >
          <Chrome className="h-4 w-4 text-red-600" />
          <span>Google</span>
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialLogin('microsoft')}
          className="flex items-center space-x-2"
        >
          <Building className="h-4 w-4 text-blue-600" />
          <span>Microsoft</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialLogin('apple')}
          className="flex items-center space-x-2"
        >
          <Apple className="h-4 w-4 text-gray-900" />
          <span>Apple</span>
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialLogin('replit')}
          className="flex items-center space-x-2"
        >
          <Shield className="h-4 w-4 text-orange-600" />
          <span>Replit</span>
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-600">
          {mode === 'signin' 
            ? 'Choose your preferred sign-in method' 
            : 'All methods are secure and GDPR compliant'
          }
        </p>
      </div>
    </div>
  );
}