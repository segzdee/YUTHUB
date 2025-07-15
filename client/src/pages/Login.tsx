import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import { LogIn, Shield, Users, Building } from 'lucide-react';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UniversalHeader />
      
      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                <LogIn className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Welcome to YUTHUB
              </CardTitle>
              <CardDescription>
                Sign in to your youth housing management platform
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 mr-3" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Secure Authentication</p>
                    <p className="text-blue-700">SSO integration with role-based access</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 mr-3" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Multi-Tenant Support</p>
                    <p className="text-green-700">Organization-isolated data and settings</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <Building className="h-5 w-5 text-purple-600 mr-3" />
                  <div className="text-sm">
                    <p className="font-medium text-purple-900">Comprehensive Management</p>
                    <p className="text-purple-700">Housing, support, and financial tools</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-primary hover:bg-primary/90 text-white"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign in with Replit
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  By signing in, you agree to our{' '}
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
      </div>
      
      <UniversalFooter />
    </div>
  );
}