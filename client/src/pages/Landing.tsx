import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Card, FeatureCard, PricingCard } from '../components/Card';
import { Badge } from '../components/Badge';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <Navbar transparent />

      {/* Main Content */}
      <div className="flex-1">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div>
              <Badge variant="secondary" size="md" className="mb-4">
                Now recruiting beta users
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-700 text-black leading-tight">
                Youth housing,
                <br />
                simplified.
              </h1>
            </div>

            <p className="text-xl sm:text-2xl font-400 text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The platform that brings together housing managers, support teams, and safeguarding specialists to deliver exceptional care for young people.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="primary" size="lg">
                  Get started free
                </Button>
              </Link>
              <Link to="/platform">
                <Button variant="tertiary" size="lg">
                  See how it works
                </Button>
              </Link>
            </div>

            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm font-500 text-gray-500 mb-4">
                Trusted by leading UK youth housing organizations
              </p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                {['Organization A', 'Organization B', 'Organization C', 'Organization D'].map((org) => (
                  <span key={org} className="text-sm font-500 text-gray-400">
                    {org}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-600 text-black mb-4">
                Everything you need
              </h2>
              <p className="text-xl font-400 text-gray-600">
                Comprehensive tools designed for modern youth housing organizations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon="🏠"
                title="Property Management"
                description="Track properties, maintenance schedules, and occupancy with a single interface"
              />
              <FeatureCard
                icon="👥"
                title="Resident Profiles"
                description="Comprehensive resident records with support plans and progress tracking"
              />
              <FeatureCard
                icon="🛡️"
                title="Safeguarding"
                description="Integrated safeguarding tools and incident management for compliance"
              />
              <FeatureCard
                icon="💰"
                title="Financial Management"
                description="Budget tracking, expense management, and financial reporting"
              />
              <FeatureCard
                icon="📊"
                title="Analytics & Insights"
                description="Real-time dashboards and reports to measure organizational impact"
              />
              <FeatureCard
                icon="🔄"
                title="Seamless Collaboration"
                description="Built-in communication tools connecting all team members"
              />
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-600 text-black mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-xl font-400 text-gray-600">
                Choose the plan that fits your organization
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
              <PricingCard
                tier="starter"
                name="Starter"
                price={99}
                description="For small teams"
                features={[
                  'Up to 5 properties',
                  '50 residents',
                  'Basic analytics',
                  'Email support',
                  'Community access',
                ]}
                cta="Start free"
                onCtaClick={() => console.log('Starter clicked')}
              />

              <PricingCard
                tier="professional"
                name="Professional"
                price={299}
                description="For growing organizations"
                features={[
                  'Unlimited properties',
                  'Unlimited residents',
                  'Advanced analytics',
                  'Priority support',
                  'API access',
                  'Custom integrations',
                ]}
                cta="Start free"
                onCtaClick={() => console.log('Professional clicked')}
                isPopular
              />

              <PricingCard
                tier="enterprise"
                name="Enterprise"
                description="Custom solutions"
                features={[
                  'Everything in Professional',
                  'Custom features',
                  'Dedicated support',
                  'SLA guarantee',
                  'On-premise options',
                  'Training & onboarding',
                ]}
                cta="Contact sales"
                onCtaClick={() => console.log('Enterprise clicked')}
              />
            </div>

            <div className="text-center mt-12">
              <Link to="/pricing">
                <Button variant="secondary" size="md">
                  View full pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-600 text-black mb-4">
                Loved by the community
              </h2>
              <p className="text-xl font-400 text-gray-600">
                Hear from housing managers transforming their organizations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    'YUTHUB has transformed how we manage our properties and track resident progress. The safeguarding tools alone have saved us hours each week.',
                  author: 'Sarah Chen',
                  role: 'Housing Manager',
                  org: 'East London Youth Housing',
                },
                {
                  quote:
                    'Finally, a platform built specifically for youth housing organizations. The financial reporting features help us make better decisions.',
                  author: 'James Wilson',
                  role: 'Finance Director',
                  org: 'Northern Youth Alliance',
                },
                {
                  quote:
                    'Our entire team loves the simplicity. We went from juggling spreadsheets to having everything in one place. Highly recommend.',
                  author: 'Emma Rodriguez',
                  role: 'Director of Operations',
                  org: 'South Coast Housing Trust',
                },
              ].map((testimonial, idx) => (
                <Card key={idx} padded="lg" hoverable={false}>
                  <div className="space-y-4">
                    <p className="text-base font-400 text-gray-700 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-600 text-black">{testimonial.author}</p>
                      <p className="text-sm font-400 text-gray-600">{testimonial.role}</p>
                      <p className="text-xs font-400 text-gray-500 mt-1">{testimonial.org}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-4xl sm:text-5xl font-600 text-black mb-4">
                Ready to get started?
              </h2>
              <p className="text-xl font-400 text-gray-600">
                Join leading youth housing organizations using YUTHUB to transform their operations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="primary" size="lg">
                  Get started free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>

            <p className="text-sm font-400 text-gray-500">
              No credit card required. Set up takes less than 5 minutes.
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
