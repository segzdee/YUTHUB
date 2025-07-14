import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-background py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-high-contrast mb-4 sm:mb-6 leading-tight">
            Transform Young Lives Through
            <span className="block text-primary">Smarter Housing Support</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-medium-contrast max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
            YUTHUB is the comprehensive platform for youth housing organizations. 
            Streamline support services, track independence pathways, and ensure 
            safeguarding compliance - all in one powerful system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4 sm:px-0">
            <Button
              size="lg"
              className="interactive-element w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg bg-primary hover:bg-blue-700"
              onClick={() => window.location.href = '/login'}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="interactive-element w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg"
              onClick={() => window.location.href = '#demo'}
            >
              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-medium-contrast px-4 sm:px-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-success text-success-foreground rounded-full text-xs sm:text-sm font-semibold">
                ✓
              </span>
              <span className="text-sm sm:text-base">30-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-success text-success-foreground rounded-full text-xs sm:text-sm font-semibold">
                ✓
              </span>
              <span className="text-sm sm:text-base">No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-success text-success-foreground rounded-full text-xs sm:text-sm font-semibold">
                ✓
              </span>
              <span className="text-sm sm:text-base">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}