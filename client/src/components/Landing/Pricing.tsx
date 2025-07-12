import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingSection() {
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
      popular: false,
      color: 'border-gray-200'
    },
    {
      name: 'Professional',
      description: 'Ideal for medium housing associations',
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
      ],
      popular: true,
      color: 'border-primary ring-2 ring-primary'
    },
    {
      name: 'Enterprise',
      description: 'For large national providers',
      monthlyPrice: 1299,
      annualPrice: 1099,
      maxResidents: 'Unlimited',
      features: [
        'Everything in Professional PLUS:',
        'Unlimited residents & properties',
        'AI-powered predictive analytics',
        'Custom feature development',
        'On-premise deployment options',
        'Advanced integrations & API',
        'Priority support (24/7)',
        'Custom training programs',
        'Dedicated account manager',
        'SLA guarantees',
      ],
      popular: false,
      color: 'border-gray-200'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Transparent Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-high-contrast mb-4">
            Choose the Right Plan for Your Organization
          </h2>
          <p className="text-xl text-medium-contrast max-w-3xl mx-auto">
            Simple, transparent pricing with no hidden fees. All plans include free setup, training, and onboarding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={`interactive-element hover:shadow-lg transition-all duration-300 relative ${tier.color}`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-high-contrast">
                  {tier.name}
                </CardTitle>
                <CardDescription className="text-medium-contrast">
                  {tier.description}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-high-contrast">
                      £{tier.annualPrice}
                    </span>
                    <span className="text-medium-contrast">/month</span>
                  </div>
                  <div className="text-sm text-medium-contrast mt-1">
                    Annual billing (save 15%)
                  </div>
                  <div className="text-sm text-medium-contrast">
                    £{tier.monthlyPrice}/month if billed monthly
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-high-contrast font-semibold">
                    Max Residents: {tier.maxResidents}
                  </div>
                  <div className="text-xs text-medium-contrast mt-1">
                    Free setup and onboarding included
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span className="text-medium-contrast text-sm leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </CardContent>
              
              <CardFooter className="pt-6">
                <Button 
                  className={`w-full interactive-element ${tier.popular ? 'bg-primary hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                  onClick={() => window.location.href = `/subscribe?tier=${tier.name.toLowerCase()}`}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-white rounded-xl shadow-sm">
            <div className="text-high-contrast font-semibold">
              All plans include:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-medium-contrast">
              <span>✓ 30-day free trial</span>
              <span>✓ Free setup & training</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}