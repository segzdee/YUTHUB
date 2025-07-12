import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-blue-700 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to Transform Your Youth Housing Support?
        </h2>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
          Join hundreds of organizations already using YUTHUB to improve outcomes, 
          ensure compliance, and empower young people on their journey to independence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            size="lg"
            className="interactive-element px-8 py-4 text-lg bg-white text-primary hover:bg-gray-100 font-semibold"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="interactive-element px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary font-semibold"
            onClick={() => window.location.href = '/pricing'}
          >
            View Pricing
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-300" aria-hidden="true" />
            <span className="text-lg">30-day free trial</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-300" aria-hidden="true" />
            <span className="text-lg">No setup fees</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-300" aria-hidden="true" />
            <span className="text-lg">Cancel anytime</span>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-blue-600">
          <p className="text-lg opacity-90 mb-4">
            Questions about YUTHUB? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <a 
              href="mailto:support@yuthub.com" 
              className="interactive-element hover:text-blue-200 transition-colors"
            >
              📧 support@yuthub.com
            </a>
            <a 
              href="tel:+442071234567" 
              className="interactive-element hover:text-blue-200 transition-colors"
            >
              📞 +44 20 7123 4567
            </a>
            <span className="text-blue-200">
              🕒 Monday - Friday, 9am - 5pm GMT
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}