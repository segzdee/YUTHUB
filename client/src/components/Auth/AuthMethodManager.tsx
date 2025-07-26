import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Apple, Building, Chrome, Mail, Plus, Shield, Trash2 } from 'lucide-react';

interface AuthMethod {
  id: number;
  provider: string;
  providerEmail: string;
  createdAt: string;
}

const providerIcons = {
  GOOGLE: Chrome,
  MICROSOFT: Building,
  APPLE: Apple,
  EMAIL: Mail,
  REPLIT: Shield,
};

const providerLabels = {
  GOOGLE: 'Google',
  MICROSOFT: 'Microsoft',
  APPLE: 'Apple',
  EMAIL: 'Email & Password',
  REPLIT: 'Replit',
};

const providerColors = {
  GOOGLE: 'bg-red-500',
  MICROSOFT: 'bg-blue-500',
  APPLE: 'bg-gray-900',
  EMAIL: 'bg-green-500',
  REPLIT: 'bg-orange-500',
};

export default function AuthMethodManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authMethods, isLoading } = useQuery({
    queryKey: ['/auth/methods'],
    queryFn: () => apiRequest('/auth/methods'),
  });

  const removeMethodMutation = useMutation({
    mutationFn: (methodId: number) => apiRequest(`/auth/methods/${methodId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/auth/methods'] });
      toast({
        title: "Success",
        description: "Authentication method removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove authentication method",
        variant: "destructive",
      });
    },
  });

  const handleAddMethod = (provider: string) => {
    const authUrls = {
      GOOGLE: '/auth/google',
      MICROSOFT: '/auth/microsoft',
      APPLE: '/auth/apple',
    };

    const url = authUrls[provider as keyof typeof authUrls];
    if (url) {
      window.location.href = url;
    }
  };

  const handleRemoveMethod = (methodId: number) => {
    removeMethodMutation.mutate(methodId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Methods</CardTitle>
          <CardDescription>
            Manage how you sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const methods = authMethods || [];
  const availableProviders = ['GOOGLE', 'MICROSOFT', 'APPLE'].filter(
    provider => !methods.find(m => m.provider === provider)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Methods</CardTitle>
        <CardDescription>
          Manage how you sign in to your account. You must have at least one method enabled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Methods */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Current Methods</h4>
          {methods.map((method: AuthMethod) => {
            const Icon = providerIcons[method.provider as keyof typeof providerIcons];
            const label = providerLabels[method.provider as keyof typeof providerLabels];
            const color = providerColors[method.provider as keyof typeof providerColors];
            
            return (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-gray-500">{method.providerEmail}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    Added {new Date(method.createdAt).toLocaleDateString()}
                  </Badge>
                  {methods.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Authentication Method</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {label}? You won't be able to sign in using this method anymore.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMethod(method.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Available Methods */}
        {availableProviders.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Add New Method</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableProviders.map((provider) => {
                const Icon = providerIcons[provider as keyof typeof providerIcons];
                const label = providerLabels[provider as keyof typeof providerLabels];
                const color = providerColors[provider as keyof typeof providerColors];
                
                return (
                  <Button
                    key={provider}
                    variant="outline"
                    onClick={() => handleAddMethod(provider)}
                    className="flex items-center space-x-2 p-4 h-auto"
                  >
                    <div className={`p-2 rounded-full ${color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">Add {label}</div>
                      <div className="text-sm text-gray-500">Link your {label} account</div>
                    </div>
                    <Plus className="h-4 w-4 ml-auto" />
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Security Recommendation</h4>
              <p className="text-sm text-blue-700 mt-1">
                We recommend having multiple authentication methods enabled for better security and account recovery options.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}