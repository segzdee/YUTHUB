import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { getRoleDisplayName } from '@/config/permissions';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { role } = usePermissions();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
                <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
              <p className="text-lg text-muted-foreground">
                You don't have permission to access this page
              </p>
            </div>

            {/* Details */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="bg-background rounded p-2 mt-0.5">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Your Current Role</p>
                  <p className="text-sm text-muted-foreground">
                    {role ? getRoleDisplayName(role) : 'No role assigned'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">
                  This page requires elevated permissions. If you believe you should have
                  access, please contact your organization administrator.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate('/app/dashboard')}
                className="w-full sm:w-auto"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>

            {/* Support Link */}
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Need help?{' '}
                <button
                  onClick={() => navigate('/app/support')}
                  className="text-primary hover:underline font-medium"
                >
                  Contact Support
                </button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
