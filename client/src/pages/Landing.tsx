import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Shield, TrendingUp, BarChart3, AlertTriangle } from "lucide-react";

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
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">YUTHUB</h1>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

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
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3"
            >
              Get Started
            </Button>
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
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-primary hover:bg-blue-700 text-lg px-8 py-3"
          >
            Sign In to Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4">YUTHUB</h4>
            <p className="text-gray-300">
              Comprehensive housing support management platform for youth organizations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
