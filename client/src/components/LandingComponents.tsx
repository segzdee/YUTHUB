import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  href,
}) => {
  const content = (
    <>
      <div className="flex justify-center mb-4">{icon}</div>
      <CardTitle className="text-2xl font-600 text-center mb-2">{title}</CardTitle>
      <CardDescription className="text-base font-400 text-center">{description}</CardDescription>
    </>
  );

  return (
    <Card className={`${href ? 'hover:shadow-md cursor-pointer' : ''} text-center transition-all duration-300`}>
      <CardContent className="pt-6 pb-6">
        {href ? (
          <a href={href} className="block">
            {content}
          </a>
        ) : (
          content
        )}
      </CardContent>
    </Card>
  );
};

interface PricingCardProps {
  tier: 'starter' | 'professional' | 'enterprise';
  name: string;
  price?: string | number;
  description: string;
  features: string[];
  cta: string;
  onCtaClick?: () => void;
  isPopular?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  name,
  price,
  description,
  features,
  cta,
  onCtaClick,
  isPopular = false,
}) => {
  return (
    <Card
      className={`relative flex flex-col ${
        isPopular ? 'ring-4 ring-blue-600 shadow-xl scale-[1.05] bg-gradient-to-b from-blue-50 to-white' : ''
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-700 px-4 py-1.5 rounded-full shadow-lg">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl font-600">{name}</CardTitle>
        <CardDescription className="text-base font-400">{description}</CardDescription>
        {price && (
          <div className="mt-4">
            <span className="text-5xl font-600 text-foreground">£{price}</span>
            <span className="text-base font-400 text-muted-foreground ml-2">/mo</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        <Button
          onClick={onCtaClick}
          className={`w-full ${
            isPopular
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:scale-105'
              : ''
          }`}
          variant={isPopular ? 'default' : 'outline'}
        >
          {cta}
        </Button>

        <div className="space-y-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-base font-400 text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
