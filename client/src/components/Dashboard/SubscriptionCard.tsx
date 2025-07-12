import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Building2, Zap, Users, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const tierIcons = {
  trial: Building2,
  starter: Building2,
  professional: Zap,
  enterprise: Crown,
};

const tierColors = {
  trial: 'bg-gray-100 text-gray-800',
  starter: 'bg-blue-100 text-blue-800',
  professional: 'bg-green-100 text-green-800',
  enterprise: 'bg-purple-100 text-purple-800',
};

export default function SubscriptionCard() {
  const { user } = useAuth();

  const { data: residents } = useQuery({
    queryKey: ['/api/residents'],
  });

  const currentResidents = residents?.length || 0;
  const maxResidents = user?.maxResidents || 25;
  const usagePercentage = (currentResidents / maxResidents) * 100;

  const subscriptionTier = user?.subscriptionTier || 'trial';
  const subscriptionStatus = user?.subscriptionStatus || 'active';
  const TierIcon = tierIcons[subscriptionTier as keyof typeof tierIcons];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isNearLimit = usagePercentage > 80;
  const isAtLimit = usagePercentage >= 100;

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TierIcon className="h-5 w-5 text-gray-600" />
            <div>
              <CardTitle className="text-lg">Subscription</CardTitle>
              <CardDescription>
                Your current plan and usage
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={tierColors[subscriptionTier as keyof typeof tierColors]}>
              {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
            </Badge>
            <Badge variant="outline" className={getStatusColor(subscriptionStatus)}>
              {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resident Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>Residents</span>
            </div>
            <span className={`font-medium ${isNearLimit ? 'text-orange-600' : isAtLimit ? 'text-red-600' : 'text-gray-600'}`}>
              {currentResidents} / {maxResidents === 999999 ? '∞' : maxResidents}
            </span>
          </div>
          <Progress 
            value={Math.min(usagePercentage, 100)} 
            className="h-2"
            indicatorClassName={isNearLimit ? 'bg-orange-500' : isAtLimit ? 'bg-red-500' : 'bg-green-500'}
          />
          {isNearLimit && (
            <p className="text-sm text-orange-600">
              {isAtLimit ? 'Resident limit reached' : 'Approaching resident limit'}
            </p>
          )}
        </div>

        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Start Date</span>
            </div>
            <p className="font-medium">
              {formatDate(user?.subscriptionStartDate)}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Renewal Date</span>
            </div>
            <p className="font-medium">
              {formatDate(user?.subscriptionEndDate)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {subscriptionTier === 'trial' && (
            <Button 
              onClick={() => window.location.href = '/pricing'}
              className="flex-1 min-w-[120px]"
            >
              Upgrade Plan
            </Button>
          )}
          
          {subscriptionTier !== 'trial' && subscriptionTier !== 'enterprise' && (
            <Button 
              onClick={() => window.location.href = '/pricing'}
              variant="outline"
              className="flex-1 min-w-[120px]"
            >
              Upgrade Plan
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.href = '/subscribe'}
            variant="outline"
            className="flex-1 min-w-[120px]"
          >
            Manage Subscription
          </Button>
        </div>

        {/* Upgrade Recommendations */}
        {isNearLimit && subscriptionTier !== 'enterprise' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Consider Upgrading</h4>
            <p className="text-sm text-blue-800 mb-3">
              You're approaching your resident limit. Upgrade to accommodate more residents and unlock additional features.
            </p>
            <Button 
              onClick={() => window.location.href = '/pricing'}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}