import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-high-contrast mb-6">
            Transform Young Lives Through
            <span className="block text-primary">Smarter Housing Support</span>
          </h1>
          <p className="text-xl text-medium-contrast max-w-3xl mx-auto mb-8 leading-relaxed">
            YUTHUB is the comprehensive platform for youth housing organizations. 
            Streamline support services, track independence pathways, and ensure 
            safeguarding compliance - all in one powerful system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="interactive-element px-8 py-3 text-lg bg-primary hover:bg-blue-700"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="interactive-element px-8 py-3 text-lg"
              onClick={() => window.location.href = '#demo'}
            >
              <Play className="mr-2 h-5 w-5" aria-hidden="true" />
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-medium-contrast">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-success text-white rounded-full text-sm font-semibold">
                ✓
              </span>
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-success text-white rounded-full text-sm font-semibold">
                ✓
              </span>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-success text-white rounded-full text-sm font-semibold">
                ✓
              </span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}