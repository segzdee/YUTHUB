import { ReactNode } from 'react';
import { useFeatureAccess, useTierAccess, useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

interface FeatureGuardProps {
  feature?: string;
  minTier?: 'starter' | 'professional' | 'enterprise';
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureGuard({
  feature,
  minTier,
  children,
  fallback,
  showUpgradePrompt = true,
}: FeatureGuardProps) {
  const hasFeatureAccess = useFeatureAccess(feature || '');
  const hasTierAccess = useTierAccess(minTier || 'starter');
  const { data: subscription } = useSubscription();

  const hasAccess = feature ? hasFeatureAccess : hasTierAccess;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Feature Locked</CardTitle>
        </div>
        <CardDescription>
          {feature && `The "${feature}" feature is not available in your current plan.`}
          {minTier && `This feature requires the ${minTier} plan or higher.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are currently on the <strong>{subscription?.subscription_tier}</strong> plan.
            Upgrade to unlock this feature and many more.
          </p>
          <Link href="/subscribe">
            <Button className="w-full sm:w-auto">
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureBadgeProps {
  tier: 'starter' | 'professional' | 'enterprise';
}

export function FeatureBadge({ tier }: FeatureBadgeProps) {
  const colors = {
    starter: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    professional: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    enterprise: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors[tier]}`}
    >
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}

interface LimitWarningProps {
  type: 'residents' | 'properties';
  current: number;
  max: number;
}

export function LimitWarning({ type, current, max }: LimitWarningProps) {
  const percentage = (current / max) * 100;

  if (percentage < 80) {
    return null;
  }

  const isAtLimit = current >= max;

  return (
    <Card className={`border-l-4 ${isAtLimit ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold">
              {isAtLimit ? `${type.charAt(0).toUpperCase() + type.slice(1)} Limit Reached` : 'Approaching Limit'}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              You are using {current} of {max} {type}
              {!isAtLimit && ` (${percentage.toFixed(0)}%)`}
            </p>
            {isAtLimit && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Upgrade your plan to add more {type}.
              </p>
            )}
          </div>
          {isAtLimit && (
            <Link href="/subscribe">
              <Button size="sm">Upgrade</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
