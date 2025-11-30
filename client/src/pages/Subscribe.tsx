import { useState, useEffect } from 'react';
import { PublicPageLayout } from '@/components/PageLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, Crown, Building2, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';

const tierIcons = {
  starter: Building2,
  professional: Zap,
  enterprise: Crown,
};

const tierFeatures = {
  starter: {
    name: 'Starter',
    description: 'Perfect for small charities and pilot programs',
    price: 169,
    maxResidents: 10,
    color: 'bg-blue-50 border-blue-200',
    features: [
      'Up to 10 residents',
      '1 property location',
      'Resident intake & comprehensive profiles',
      'Support planning & progress tracking',
      'Digital documentation storage',
      'Mobile app for staff & residents',
      'Basic reporting dashboard',
      'Email support (business hours)',
      '14-day free trial included',
    ],
  },
  professional: {
    name: 'Professional',
    description: 'Ideal for medium housing associations',
    price: 424,
    maxResidents: 25,
    color: 'bg-green-50 border-green-200',
    features: [
      'Everything in Starter, PLUS:',
      'Up to 25 residents',
      'Up to 5 properties/locations',
      'Safeguarding & incident reporting',
      'Financial management & budgeting',
      'Crisis intervention & emergency alerts',
      'Advanced analytics & outcome tracking',
      'Custom branding & API access',
      'Priority support & dedicated success manager',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large national providers',
    price: 849,
    maxResidents: 'Unlimited',
    color: 'bg-purple-50 border-purple-200',
    features: [
      'Everything in Professional, PLUS:',
      'Unlimited residents & properties',
      'AI-powered predictive analytics',
      'Custom feature development',
      'On-premise deployment options',
      'Advanced security (SSO, SAML, LDAP)',
      'Multi-tenancy & organizational hierarchy',
      '24/7 dedicated technical support',
      'Quarterly business reviews with executives',
      'SLA guarantees (99.9% uptime)',
    ],
  },
};

export default function Subscribe() {
  const [selectedTier, setSelectedTier] = useState<string>('');
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get tier from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tierParam = urlParams.get('tier');
    if (tierParam && tierFeatures[tierParam as keyof typeof tierFeatures]) {
      setSelectedTier(tierParam);
    }
  }, []);

  const createSubscriptionMutation = useMutation({
    mutationFn: async (tier: string) => {
      const response = await apiRequest('POST', '/api/subscriptions/create', {
        tier,
      });
      return response.json();
    },
    onSuccess: data => {
      toast({
        title: 'Subscription Created',
        description: 'Your subscription has been created successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: error => {
      toast({
        title: 'Subscription Error',
        description: error.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    },
  });

  const handleSubscribe = (tier: string) => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    createSubscriptionMutation.mutate(tier);
  };

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <UniversalHeader />
        <div className='flex items-center justify-center py-20'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please log in to subscribe to YUTHUB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => (window.location.href = '/login')}
                className='w-full'
              >
                Login to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
        <UniversalFooter />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <UniversalHeader />
      <div className='max-w-4xl mx-auto py-12 px-4'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Subscribe to YUTHUB
          </h1>
          <p className='text-gray-600'>
            Choose the perfect plan for your organization
          </p>
        </div>

        {/* Current Subscription Status */}
        {user && (
          <Alert className='mb-8'>
            <AlertDescription>
              <div className='flex items-center justify-between'>
                <div>
                  <strong>Current Plan:</strong>{' '}
                  {user.subscriptionTier || 'Trial'}
                  <Badge variant='outline' className='ml-2'>
                    {user.subscriptionStatus || 'Active'}
                  </Badge>
                </div>
                <div className='text-sm text-gray-600'>
                  Max residents: {user.maxResidents || 25}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Tiers */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          {Object.entries(tierFeatures).map(([key, tier]) => {
            const Icon = tierIcons[key as keyof typeof tierIcons];
            const isSelected = selectedTier === key;
            const isCurrentTier = user?.subscriptionTier === key;

            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                } ${tier.color} relative`}
                onClick={() => setSelectedTier(key)}
              >
                {isCurrentTier && (
                  <div className='absolute -top-2 -right-2'>
                    <Badge className='bg-green-600 text-white'>Current</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className='flex items-center space-x-3'>
                    <Icon className='h-8 w-8 text-gray-700' />
                    <div>
                      <CardTitle className='text-xl'>{tier.name}</CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                    </div>
                  </div>

                  <div className='mt-4'>
                    <div className='flex items-baseline'>
                      <span className='text-3xl font-bold text-gray-900'>
                        £{tier.price}
                      </span>
                      <span className='text-gray-500 ml-2'>/month</span>
                    </div>
                    <div className='text-sm text-gray-600 mt-1'>
                      Billed annually
                    </div>
                    <div className='text-sm text-gray-600 mt-1'>
                      Max residents: {tier.maxResidents}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className='space-y-2'>
                    {tier.features.map((feature, index) => (
                      <li key={index} className='flex items-start'>
                        <Check className='h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5' />
                        <span className='text-sm text-gray-700'>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Subscribe Button */}
        {selectedTier && (
          <Card className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Ready to subscribe to{' '}
                  {tierFeatures[selectedTier as keyof typeof tierFeatures].name}
                  ?
                </h3>
                <p className='text-gray-600 mt-1'>
                  £
                  {
                    tierFeatures[selectedTier as keyof typeof tierFeatures]
                      .price
                  }
                  /month billed annually
                </p>
                <p className='text-sm text-gray-500 mt-2'>
                  Includes free setup, migration, training, and configuration
                </p>
              </div>
              <Button
                onClick={() => handleSubscribe(selectedTier)}
                disabled={
                  createSubscriptionMutation.isPending ||
                  user?.subscriptionTier === selectedTier
                }
                size='lg'
                className='px-8'
              >
                {createSubscriptionMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Creating...
                  </>
                ) : user?.subscriptionTier === selectedTier ? (
                  'Current Plan'
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Additional Information */}
        <div className='mt-8 text-center text-sm text-gray-600'>
          <p>All plans include a 30-day free trial. Cancel anytime.</p>
          <p className='mt-2'>
            Need help choosing?{' '}
            <a href='/contact' className='text-blue-600 hover:underline'>
              Contact our team
            </a>
          </p>
        </div>
      </div>
      <UniversalFooter />
    </div>
  );
}
