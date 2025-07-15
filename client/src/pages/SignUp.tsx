import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import SEOHead from '@/components/SEO/SEOHead';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';

const pricingTiers = [
  {
    name: 'Starter',
    monthlyPrice: 169,
    annualPrice: 144,
    maxResidents: 25,
    description: 'Perfect for smaller housing associations and local charities',
    features: [
      'Up to 25 residents',
      'Basic property management',
      'Incident reporting',
      'Basic support planning',
      'Monthly reports',
      'Email support',
      'Standard onboarding',
      'Mobile app access',
      'Basic analytics dashboard',
      'Document storage (5GB)',
    ],
    excluded: [
      'Advanced analytics',
      'Custom integrations',
      'Priority support',
      'Advanced reporting',
      'Multi-location management',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    monthlyPrice: 429,
    annualPrice: 365,
    maxResidents: 100,
    description: 'Ideal for growing organizations and regional housing providers',
    features: [
      'Up to 100 residents',
      'Advanced property management',
      'Comprehensive incident tracking',
      'Advanced support planning',
      'Custom report builder',
      'Priority email & phone support',
      'Enhanced onboarding',
      'Mobile app with offline mode',
      'Advanced analytics & insights',
      'Document storage (50GB)',
      'Multi-location management',
      'Staff management tools',
      'Integration with external systems',
      'Automated workflows',
      'Advanced security features',
    ],
    excluded: [
      'White-label options',
      'Custom development',
      'Dedicated account manager',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 1099,
    annualPrice: 934,
    maxResidents: 'Unlimited',
    description: 'Comprehensive solution for large housing associations and councils',
    features: [
      'Unlimited residents',
      'Enterprise property management',
      'Advanced incident & risk management',
      'Comprehensive support planning',
      'Custom report builder & API',
      'Dedicated account manager',
      'White-label options',
      'Mobile app with full customization',
      'AI-powered predictive analytics',
      'Unlimited document storage',
      'Multi-tenancy support',
      'Advanced staff management',
      'Custom integrations & API access',
      'Automated compliance reporting',
      'Advanced security & audit logs',
      'Custom feature development',
      'On-premise deployment options',
      'SLA guarantees',
      'Quarterly business reviews',
      'Custom training programs',
    ],
    excluded: [],
    popular: false,
  },
];

export default function SignUp() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleSelectPlan = (tier: typeof pricingTiers[0]) => {
    setSelectedTier(tier.name);
    // Redirect to authentication with selected plan
    window.location.href = `/login?plan=${tier.name.toLowerCase()}&billing=${isAnnual ? 'annual' : 'monthly'}`;
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Sign Up for YUTHUB - Choose Your Plan",
    "description": "Sign up for YUTHUB youth housing management platform. Choose from Starter, Professional, or Enterprise plans.",
    "url": "https://yuthub.com/signup"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Sign Up for YUTHUB | Choose Your Youth Housing Management Plan"
        description="Sign up for YUTHUB youth housing management platform. Choose from Starter (£169/month), Professional (£429/month), or Enterprise (£1,099/month) plans."
        keywords="sign up YUTHUB, youth housing software registration, housing management signup, social care platform registration"
        canonicalUrl="https://yuthub.com/signup"
        structuredData={structuredData}
      />
      <UniversalHeader />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <Breadcrumbs items={[{ label: 'Sign Up' }]} />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your YUTHUB Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Select the perfect plan for your youth housing organization
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                isAnnual ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            <Badge variant="secondary" className="ml-2">
              Save 15%
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : 'border-gray-200'}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-3 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {tier.name}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {tier.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    £{isAnnual ? tier.annualPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-gray-500 ml-1">/month</span>
                  {isAnnual && (
                    <div className="text-sm text-gray-500 mt-1">
                      £{tier.annualPrice * 12} billed annually
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Up to {tier.maxResidents} residents
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button 
                  onClick={() => handleSelectPlan(tier)}
                  className={`w-full mb-6 ${
                    tier.popular 
                      ? 'bg-primary hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  disabled={selectedTier === tier.name}
                >
                  {selectedTier === tier.name ? 'Selected' : 'Choose Plan'}
                </Button>
                
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    What's included:
                  </div>
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="text-center text-gray-600 mb-8">
          <p className="mb-2">
            All plans include a <strong>30-day free trial</strong> • No setup fees • Cancel anytime
          </p>
          <p className="text-sm">
            Need help choosing? <a href="/help" className="text-primary hover:underline">Contact our team</a>
          </p>
        </div>
      </div>
      <UniversalFooter />
    </div>
  );
}