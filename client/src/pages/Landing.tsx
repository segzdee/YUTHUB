import React from 'react';
import { Link } from 'react-router-dom';
import { PublicPageLayout } from '../components/PageLayout';
import { Button } from '../components/Button';
import { Card, FeatureCard, PricingCard } from '../components/Card';
import { Badge } from '../components/Badge';
import BrandLogo from '../components/design-system/BrandLogo';
import { Users, Home, CheckCircle, Clock, Building2, UserCheck, Shield, TrendingUp, BarChart3, Network } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <PublicPageLayout>

        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              {/* Brand Logo */}
              <div className="flex justify-center mb-6">
                <BrandLogo size='lg' variant='default' showText={true} showSlogan={false} />
              </div>

              <div className="inline-flex items-center justify-center">
                <Badge variant="secondary" size="md" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-600 text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                  ⚡ Early Partner Program - Limited Spots
                </Badge>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-800 text-black leading-[1.1] tracking-tight">
                More Time Caring.
                <br />
                <span className="text-gray-700">Less Time on Paperwork.</span>
              </h1>
            </div>

            <p className="text-xl sm:text-2xl font-400 text-gray-700 max-w-2xl mx-auto leading-relaxed">
              The complete platform that helps UK youth housing providers deliver life-changing support while staying compliant—without the administrative burden.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button variant="primary" size="lg">
                  Start free trial
                </Button>
              </Link>
              <Link to="/platform" className="group">
                <Button variant="secondary" size="lg">
                  Watch 2-min demo
                </Button>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="pt-16 mt-8">
              <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 rounded-2xl border border-blue-200 shadow-sm py-8 px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { number: "500+", label: "Young people supported", Icon: Users },
                    { number: "50+", label: "Properties managed", Icon: Home },
                    { number: "98%", label: "Compliance rate", Icon: CheckCircle },
                    { number: "10hrs", label: "Saved per week", Icon: Clock },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="flex justify-center mb-3">
                        <stat.Icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="text-3xl sm:text-4xl font-700 text-black mb-1">{stat.number}</div>
                      <div className="text-sm font-500 text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-gradient-to-b from-white via-gray-50 to-gray-50">
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
                icon={<Building2 className="w-10 h-10 text-blue-600" />}
                title="Property Management"
                description="See real-time occupancy across all locations. Schedule inspections, track maintenance, and ensure compliance—without the spreadsheet chaos."
              />
              <FeatureCard
                icon={<UserCheck className="w-10 h-10 text-blue-600" />}
                title="Resident Profiles"
                description="Complete resident records with support plans, progress notes, and risk assessments all in one place. Access critical information instantly."
              />
              <FeatureCard
                icon={<Shield className="w-10 h-10 text-blue-600" />}
                title="Safeguarding"
                description="Log incidents, track follow-ups, and maintain compliance audit trails. Never miss a safeguarding requirement with automated alerts."
              />
              <FeatureCard
                icon={<TrendingUp className="w-10 h-10 text-blue-600" />}
                title="Financial Management"
                description="Track rent payments, manage budgets, and generate financial reports with confidence. Full transparency for residents and auditors."
              />
              <FeatureCard
                icon={<BarChart3 className="w-10 h-10 text-blue-600" />}
                title="Analytics & Insights"
                description="Measure outcomes, track KPIs, and demonstrate impact. Real-time dashboards that help you make data-driven decisions."
              />
              <FeatureCard
                icon={<Network className="w-10 h-10 text-blue-600" />}
                title="Seamless Collaboration"
                description="Connect housing managers, support workers, and external partners. Secure messaging, task assignments, and shared documentation."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-600 text-black mb-4">
                How YUTHUB works
              </h2>
              <p className="text-xl font-400 text-gray-600">
                From setup to impact in under 24 hours
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-700 mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-600 text-black mb-3">Onboard</h3>
                <p className="text-base font-400 text-gray-600 leading-relaxed">
                  Import your existing data or start fresh. Our team helps you set up properties, residents, and team members in minutes.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-700 mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-600 text-black mb-3">Centralize</h3>
                <p className="text-base font-400 text-gray-600 leading-relaxed">
                  Replace spreadsheets and paper files with one secure platform. Everything your team needs, accessible anywhere.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-700 mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-600 text-black mb-3">Optimize</h3>
                <p className="text-base font-400 text-gray-600 leading-relaxed">
                  Track outcomes, measure impact, and continuously improve your service delivery with real-time insights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Security */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-600 text-black mb-4">
                Built for sensitive youth data
              </h2>
              <p className="text-xl font-400 text-gray-600">
                Enterprise-grade security you can trust
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card padded="lg" hoverable={false}>
                <div className="text-center space-y-3">
                  <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-600 text-black">Bank-Level Encryption</h3>
                  <p className="text-sm font-400 text-gray-600 leading-relaxed">
                    AES-256 encryption at rest and in transit protects all data
                  </p>
                </div>
              </Card>

              <Card padded="lg" hoverable={false}>
                <div className="text-center space-y-3">
                  <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-600 text-black">GDPR Compliant</h3>
                  <p className="text-sm font-400 text-gray-600 leading-relaxed">
                    Full compliance with UK data protection laws and regulations
                  </p>
                </div>
              </Card>

              <Card padded="lg" hoverable={false}>
                <div className="text-center space-y-3">
                  <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-600 text-black">Regular Audits</h3>
                  <p className="text-sm font-400 text-gray-600 leading-relaxed">
                    Penetration tested quarterly by independent security experts
                  </p>
                </div>
              </Card>

              <Card padded="lg" hoverable={false}>
                <div className="text-center space-y-3">
                  <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-teal-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-600 text-black">Ofsted Aligned</h3>
                  <p className="text-sm font-400 text-gray-600 leading-relaxed">
                    Purpose-built to support regulatory compliance requirements
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-white">
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
                price={199}
                description="For small charities"
                features={[
                  '1 property location',
                  'Up to 10 residents',
                  'Resident intake & profiles',
                  'Support planning tools',
                  'Progress tracking',
                  'Mobile app access',
                  'Basic reporting dashboard',
                  'Email support (business hours)',
                  'Community forum access',
                  '30-day free trial',
                ]}
                cta="Start free trial"
                onCtaClick={() => console.log('Starter clicked')}
              />

              <PricingCard
                tier="professional"
                name="Professional"
                price={499}
                description="For growing organizations"
                features={[
                  'Everything in Starter, PLUS:',
                  'Up to 5 properties',
                  'Up to 25 residents',
                  'Safeguarding & incident management',
                  'Financial management module',
                  'Crisis intervention system',
                  'Independence skills tracking',
                  'Advanced analytics & reporting',
                  'Custom branding options',
                  'API access & integrations',
                  'Priority email support',
                  'Dedicated success manager',
                ]}
                cta="Start free trial"
                onCtaClick={() => console.log('Professional clicked')}
                isPopular
              />

              <PricingCard
                tier="enterprise"
                name="Enterprise"
                price={999}
                description="For national providers"
                features={[
                  'Everything in Professional, PLUS:',
                  'Unlimited properties',
                  'Unlimited residents',
                  'AI-powered predictive analytics',
                  'Custom feature development',
                  'On-premise deployment options',
                  'Advanced security (SSO, SAML)',
                  'Multi-tenancy support',
                  'Custom integrations',
                  '24/7 dedicated technical support',
                  'Quarterly business reviews',
                  'Custom training programs',
                  'SLA guarantees (99.9% uptime)',
                ]}
                cta="Start free trial"
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
                    'Since implementing YUTHUB, we\'ve reduced admin time by 12 hours per week and improved our Ofsted compliance score from \'Requires Improvement\' to \'Good.\' The safeguarding tools alone have transformed our incident response.',
                  author: 'Sarah Chen',
                  role: 'Housing Manager',
                  org: 'East London Youth Housing',
                  metrics: '12hrs saved/week',
                },
                {
                  quote:
                    'Finally, a platform built specifically for youth housing organizations. Our financial reporting is now accurate to the penny, and we\'ve eliminated duplicate data entry across 8 different systems.',
                  author: 'James Wilson',
                  role: 'Finance Director',
                  org: 'Northern Youth Alliance',
                  metrics: '100% accuracy',
                },
                {
                  quote:
                    'Our entire team loves the simplicity. We went from juggling 15 spreadsheets to having everything in one place. Staff onboarding time dropped from 2 weeks to 2 days.',
                  author: 'Emma Rodriguez',
                  role: 'Director of Operations',
                  org: 'South Coast Housing Trust',
                  metrics: '85% faster onboarding',
                },
              ].map((testimonial, idx) => (
                <Card key={idx} padded="lg" hoverable={false}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-base font-400 text-gray-700 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    {testimonial.metrics && (
                      <div className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-600 rounded-full">
                        {testimonial.metrics}
                      </div>
                    )}
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
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-700 text-black">
                Ready to transform youth housing?
              </h2>
              <p className="text-xl font-400 text-gray-700">
                Join housing managers who are delivering better outcomes for young people.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link to="/signup">
                <Button variant="primary" size="lg">
                  Start free trial
                </Button>
              </Link>
              <Link to="/platform">
                <Button variant="secondary" size="lg">
                  Book a demo
                </Button>
              </Link>
            </div>

            <div className="pt-6 space-y-2">
              <p className="text-sm font-500 text-gray-700">
                No credit card required · 30-day free trial · Setup in under 5 minutes
              </p>
              <p className="text-xs font-400 text-gray-500">
                Cancel anytime. Your data stays yours.
              </p>
            </div>
          </div>
        </section>
    </PublicPageLayout>
  );
};

export default Landing;
