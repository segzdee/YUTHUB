import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';

const pricingTiers = [
  {
    name: 'Starter',
    description: 'Perfect for small charities and pilot programs',
    monthlyPrice: 199,
    annualPrice: 169,
    maxResidents: 25,
    features: [
      'Basic resident management (25 residents max)',
      'Essential support worker tools',
      'Standard progress tracking',
      'Mobile app for residents',
      'Email support (business hours)',
      'Single property/location',
      'Basic reporting dashboard',
    ],
    excluded: [
      'Multi-property management',
      'Advanced analytics',
      'Crisis intervention system',
      'Custom branding',
      'API access',
      'AI-powered insights',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Ideal for medium housing associations and local authorities',
    monthlyPrice: 499,
    annualPrice: 429,
    maxResidents: 100,
    features: [
      'Everything in Starter PLUS:',
      'Up to 100 residents',
      'Multi-property management (5 locations)',
      'Advanced analytics & outcome tracking',
      'Crisis intervention system',
      'Life skills progression with gamification',
      'Local authority system integration',
      'Custom branding/white-label',
      'Dedicated customer success manager',
      'API access',
      'Staff scheduling tools',
      'Financial management',
    ],
    excluded: [
      'Unlimited residents',
      'AI-powered predictive analytics',
      'Custom feature development',
      'On-premise deployment',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large national providers and multi-program organizations',
    monthlyPrice: 1299,
    annualPrice: 1099,
    maxResidents: 'Unlimited',
    features: [
      'Everything in Professional PLUS:',
      'Unlimited residents & properties',
      'AI-powered predictive analytics',
      'Custom feature development',
      'On-premise deployment options',
      'Advanced security (SSO)',
      'Multi-tenancy support',
      'Machine learning insights',
      'Custom integrations',
      'Dedicated technical support',
      'Quarterly business reviews',
      'Custom training programs',
    ],
    excluded: [],
    popular: false,
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const { isAuthenticated } = useAuth();

  const handleSubscribe = (tier: typeof pricingTiers[0]) => {
    if (isAuthenticated) {
      // Navigate to subscription page
      window.location.href = `/subscribe?tier=${tier.name.toLowerCase()}`;
    } else {
      // Redirect to login first
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UniversalHeader />
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your YUTHUB Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Purpose-built for vulnerable youth housing sector
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
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
            <Card key={tier.name} className={`relative ${tier.popular ? 'border-blue-500 border-2' : ''}`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription className="text-gray-600">{tier.description}</CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      £{isAnnual ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  {isAnnual && (
                    <div className="text-sm text-gray-500 mt-1">
                      Billed annually (£{tier.annualPrice * 12})
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-2">
                    Max residents: {tier.maxResidents}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {tier.excluded.map((feature, index) => (
                    <li key={index} className="flex items-start opacity-50">
                      <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={() => handleSubscribe(tier)}
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                >
                  {isAuthenticated ? 'Subscribe Now' : 'Get Started'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Setup & Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Free setup and onboarding</li>
                <li>• Includes migration, training, configuration</li>
                <li>• 30-day free trial</li>
                <li>• Flexible tier upgrades/downgrades</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">ROI & Benefits</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• 200-400% ROI through efficiency gains</li>
                <li>• Reduced administrative time</li>
                <li>• Better outcomes tracking</li>
                <li>• Compliance automation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Youth Housing Management?
          </h3>
          <p className="text-gray-600 mb-6">
            Join hundreds of organizations already using YUTHUB to improve outcomes for vulnerable young people.
          </p>
          <Button size="lg" className="px-8">
            Start Free Trial
          </Button>
        </div>
      </div>
      <UniversalFooter />
    </div>
  );
}