import { Typography } from '@/components/design-system/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Shield, Star, Users } from 'lucide-react';

export default function Hero() {
  const handleGetStarted = () => {
    window.location.href = '/signup';
  };

  const handleWatchDemo = () => {
    // Open demo video modal or navigate to demo page
    console.log('Watch demo clicked');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-background to-accent-50 py-16 sm:py-20 lg:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-20" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              GDPR Compliant
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              500+ Organizations
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              4.8/5 Rating
            </Badge>
          </div>

          {/* Main headline */}
          <Typography 
            variant="h1" 
            className="mb-6 max-w-4xl mx-auto"
            color="primary"
          >
            Transform Young Lives Through
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Smarter Housing Support
            </span>
          </Typography>

          {/* Subheadline */}
          <Typography 
            variant="body1" 
            className="text-lg sm:text-xl max-w-3xl mx-auto mb-8 leading-relaxed"
            color="muted"
          >
            YUTHUB is the comprehensive platform for youth housing organizations. 
            Streamline support services, track independence pathways, and ensure 
            safeguarding compliance - all in one powerful system.
          </Typography>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleWatchDemo}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 hover:bg-primary-50 transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Value propositions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-primary-100">
              <div className="flex-shrink-0 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span className="text-success-foreground text-sm font-bold">✓</span>
              </div>
              <Typography variant="body2" weight="medium">
                30-day free trial
              </Typography>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-primary-100">
              <div className="flex-shrink-0 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span className="text-success-foreground text-sm font-bold">✓</span>
              </div>
              <Typography variant="body2" weight="medium">
                No setup fees
              </Typography>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-primary-100">
              <div className="flex-shrink-0 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span className="text-success-foreground text-sm font-bold">✓</span>
              </div>
              <Typography variant="body2" weight="medium">
                Cancel anytime
              </Typography>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 pt-8 border-t border-primary-100">
            <Typography variant="caption" className="uppercase tracking-wide mb-6" color="muted">
              Trusted by leading organizations
            </Typography>
            <div className="flex justify-center items-center gap-8 opacity-60">
              {/* Add organization logos here */}
              <div className="h-8 w-24 bg-neutral-200 rounded" />
              <div className="h-8 w-24 bg-neutral-200 rounded" />
              <div className="h-8 w-24 bg-neutral-200 rounded" />
              <div className="h-8 w-24 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}