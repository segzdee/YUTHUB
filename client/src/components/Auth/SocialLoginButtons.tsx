import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Apple, Building, Chrome, Shield } from 'lucide-react';

interface SocialLoginButtonsProps {
  mode: 'signin' | 'signup';
  isLoading?: boolean;
  onError?: (error: string) => void;
}

export default function SocialLoginButtons({
  mode,
  isLoading,
  onError,
}: SocialLoginButtonsProps) {
  const { toast } = useToast();

  const handleSocialLogin = (provider: string) => {
    if (isLoading) return;

    try {
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? window.location.origin
          : 'http://localhost:3000';

      const authUrls = {
        google: `/api/auth/google`,
        microsoft: `/api/auth/microsoft`,
        apple: `/api/auth/apple`,
        replit: `/api/auth/replit`,
      };

      const url = authUrls[provider as keyof typeof authUrls];
      if (url) {
        window.location.href = `${baseUrl}${url}`;
      } else {
        const errorMsg = `${provider} authentication is not configured`;
        onError?.(errorMsg);
        toast({
          title: 'Authentication Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (_error) {
      const errorMsg = `Failed to initialize ${provider} authentication`;
      onError?.(errorMsg);
      toast({
        title: 'Authentication Error',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='space-y-3'>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or {mode === 'signin' ? 'sign in' : 'sign up'} with
          </span>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <Button
          variant='outline'
          type='button'
          disabled={isLoading}
          onClick={() => handleSocialLogin('google')}
          className='flex items-center space-x-2'
        >
          <Chrome className='h-4 w-4 text-red-600' />
          <span>Google</span>
        </Button>

        <Button
          variant='outline'
          type='button'
          disabled={isLoading}
          onClick={() => handleSocialLogin('microsoft')}
          className='flex items-center space-x-2'
        >
          <Building className='h-4 w-4 text-blue-600' />
          <span>Microsoft</span>
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <Button
          variant='outline'
          type='button'
          disabled={isLoading}
          onClick={() => handleSocialLogin('apple')}
          className='flex items-center space-x-2'
        >
          <Apple className='h-4 w-4 text-gray-900' />
          <span>Apple</span>
        </Button>

        <Button
          variant='outline'
          type='button'
          disabled={isLoading}
          onClick={() => handleSocialLogin('replit')}
          className='flex items-center space-x-2'
        >
          <Shield className='h-4 w-4 text-orange-600' />
          <span>Replit</span>
        </Button>
      </div>

      <div className='text-center'>
        <p className='text-xs text-gray-600'>
          {mode === 'signin'
            ? 'Choose your preferred sign-in method'
            : 'All methods are secure and GDPR compliant'}
        </p>
      </div>
    </div>
  );
}
