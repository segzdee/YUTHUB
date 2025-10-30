import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlatformAdminGuardProps {
  children: React.ReactNode;
}

export default function PlatformAdminGuard({
  children,
}: PlatformAdminGuardProps) {
  const [, setLocation] = useLocation();

  const {
    data: adminAuth,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/platform-admin/auth'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-medium-contrast'>
            Verifying platform admin access...
          </p>
        </div>
      </div>
    );
  }

  if (error || !adminAuth?.isPlatformAdmin) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-error'>
              <Shield className='h-5 w-5' />
              Platform Admin Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Alert className='border-error bg-error/10'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                You need platform administrator privileges to access this area.
              </AlertDescription>
            </Alert>

            <div className='space-y-2 text-sm text-medium-contrast'>
              <p>
                <strong>Access Requirements:</strong>
              </p>
              <ul className='list-disc pl-5 space-y-1'>
                <li>Platform admin role assignment</li>
                <li>Multi-factor authentication enabled</li>
                <li>IP address must be whitelisted</li>
                <li>Active admin session required</li>
              </ul>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={() => setLocation('/dashboard')}
                className='flex-1'
                variant='outline'
              >
                Return to Dashboard
              </Button>
              <Button
                onClick={() => setLocation('/settings')}
                className='flex-1'
              >
                Account Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Additional security warnings
  if (!adminAuth.mfaRequired || !adminAuth.ipWhitelisted) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='max-w-4xl mx-auto p-4'>
          <Alert className='border-warning bg-warning/10 mb-6'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <strong>Security Warning:</strong> Platform admin access requires
              additional security measures.
              {!adminAuth.mfaRequired &&
                ' Multi-factor authentication is not enabled.'}
              {!adminAuth.ipWhitelisted &&
                ' Your IP address is not whitelisted for admin access.'}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Complete Security Setup</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-medium-contrast'>
                Platform admin access requires enhanced security measures to be
                enabled:
              </p>

              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='font-medium'>Multi-Factor Authentication</p>
                    <p className='text-sm text-medium-contrast'>
                      Enable TOTP-based MFA
                    </p>
                  </div>
                  <Button size='sm' disabled={adminAuth.mfaRequired}>
                    {adminAuth.mfaRequired ? 'Enabled' : 'Enable MFA'}
                  </Button>
                </div>

                <div className='flex items-center justify-between p-3 border rounded-lg'>
                  <div>
                    <p className='font-medium'>IP Whitelisting</p>
                    <p className='text-sm text-medium-contrast'>
                      Contact system admin
                    </p>
                  </div>
                  <Button size='sm' disabled={adminAuth.ipWhitelisted}>
                    {adminAuth.ipWhitelisted ? 'Whitelisted' : 'Pending'}
                  </Button>
                </div>
              </div>

              <div className='flex gap-2 pt-4'>
                <Button
                  onClick={() => setLocation('/settings')}
                  className='flex-1'
                >
                  Security Settings
                </Button>
                <Button
                  onClick={() => setLocation('/dashboard')}
                  variant='outline'
                  className='flex-1'
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
