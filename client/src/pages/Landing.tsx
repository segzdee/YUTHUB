import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Shield, TrendingUp, BarChart3, AlertTriangle } from "lucide-react";
import UniversalHeader from "@/components/Layout/UniversalHeader";
import UniversalFooter from "@/components/Layout/UniversalFooter";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: Building,
      title: "Housing Management",
      description: "Track properties, residents, occupancy, and maintenance issues with comprehensive oversight tools."
    },
    {
      icon: Users,
      title: "Support Services",
      description: "Coordinate key worker caseloads, individual support plans, and life skills programs."
    },
    {
      icon: TrendingUp,
      title: "Independence Pathway",
      description: "Framework with readiness assessments, progression levels, and skills development tracking."
    },
    {
      icon: BarChart3,
      title: "Analytics & Outcomes",
      description: "Comprehensive dashboards for KPIs, impact measurement, and stakeholder reporting."
    },
    {
      icon: Shield,
      title: "Safeguarding & Compliance",
      description: "Tools to ensure safety standards with incident reporting and compliance checks."
    },
    {
      icon: AlertTriangle,
      title: "Crisis Connect",
      description: "Immediate-response system for emergency situations and crisis management."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <UniversalHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Empowering Young Lives Through Better Housing Support
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              A comprehensive SaaS platform for youth housing organizations to manage services, 
              track outcomes, and guide young people toward independent living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3"
              >
                Get Started
              </Button>
              <Button 
                onClick={() => window.location.href = '/pricing'}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-3"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-slate mb-4">
              Everything You Need to Support Young People
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              YUTHUB provides housing associations, local authorities, and charities with 
              the tools they need to deliver exceptional support services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="bg-primary bg-opacity-10 rounded-full p-3 w-fit">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-slate">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-slate mb-6">
            Ready to Transform Your Housing Support Services?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join leading organizations already using YUTHUB to improve outcomes 
            for young people in housing support programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-primary hover:bg-blue-700 text-lg px-8 py-3"
            >
              Sign In to Get Started
            </Button>
            <Button 
              onClick={() => window.location.href = '/pricing'}
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-3"
            >
              View Pricing Plans
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-slate mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your organization's needs. All plans include full access to our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-2 border-gray-200 hover:border-primary transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-slate">Starter</CardTitle>
                <div className="flex items-center justify-center mt-4">
                  <span className="text-4xl font-bold text-primary">£199</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <CardDescription className="text-gray-600 mt-2">
                  Perfect for small organizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center text-sm text-gray-600 mb-4">
                  Up to 25 residents
                </div>
                <ul className="space-y-2 text-sm">
                  <li>✓ Housing Management</li>
                  <li>✓ Support Services</li>
                  <li>✓ Basic Analytics</li>
                  <li>✓ Crisis Connect</li>
                </ul>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-primary shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-slate">Professional</CardTitle>
                <div className="flex items-center justify-center mt-4">
                  <span className="text-4xl font-bold text-primary">£499</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <CardDescription className="text-gray-600 mt-2">
                  Ideal for growing organizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center text-sm text-gray-600 mb-4">
                  Up to 100 residents
                </div>
                <ul className="space-y-2 text-sm">
                  <li>✓ All Starter features</li>
                  <li>✓ Advanced Analytics</li>
                  <li>✓ AI-Powered Insights</li>
                  <li>✓ Custom Reports</li>
                  <li>✓ Priority Support</li>
                </ul>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-200 hover:border-primary transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-slate">Enterprise</CardTitle>
                <div className="flex items-center justify-center mt-4">
                  <span className="text-4xl font-bold text-primary">£1,299</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <CardDescription className="text-gray-600 mt-2">
                  For large organizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center text-sm text-gray-600 mb-4">
                  Unlimited residents
                </div>
                <ul className="space-y-2 text-sm">
                  <li>✓ All Professional features</li>
                  <li>✓ Custom Integrations</li>
                  <li>✓ Dedicated Support</li>
                  <li>✓ Advanced Security</li>
                  <li>✓ Custom Training</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => window.location.href = '/pricing'}
              size="lg"
              className="bg-primary hover:bg-blue-700 text-lg px-8 py-3"
            >
              View All Features & Pricing
            </Button>
          </div>
        </div>
      </section>

      <UniversalFooter />
    </div>
  );
}
