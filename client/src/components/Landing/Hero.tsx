import { Typography } from '@/components/design-system/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/design-system/BrandLogo';
import { ArrowRight, Play, Shield, Star, Building2 } from 'lucide-react';

export default function Hero() {
  const handleGetStarted = () => {
    window.location.href = '/signup';
  };

  const handleWatchDemo = () => {
    // Open demo video modal or navigate to demo page
    console.log('Watch demo clicked');
  };

  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50 py-16 sm:py-20 lg:py-24'>
      {/* Background decoration */}
      <div className='absolute inset-0 bg-grid-pattern opacity-5' />
      <div className='absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30' />
      <div className='absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-30' />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          {/* Brand Logo */}
          <div className='flex justify-center mb-6'>
            <BrandLogo size='lg' variant='default' showText={true} showSlogan={false} />
          </div>

          {/* Trust indicators */}
          <div className='flex flex-wrap justify-center items-center gap-4 mb-8'>
            <Badge variant='secondary' className='flex items-center gap-2' aria-label='GDPR Compliant certification'>
              <Shield className='h-4 w-4' aria-hidden='true' />
              <span>GDPR Compliant</span>
            </Badge>
            <Badge variant='secondary' className='flex items-center gap-2' aria-label='Trusted by over 500 housing organisations'>
              <Building2 className='h-4 w-4' aria-hidden='true' />
              <span>500+ Properties</span>
            </Badge>
            <Badge variant='secondary' className='flex items-center gap-2' aria-label='Average rating 4.8 out of 5 stars'>
              <Star className='h-4 w-4' aria-hidden='true' />
              <span>4.8/5 Rating</span>
            </Badge>
          </div>

          {/* Main headline */}
          <Typography
            variant='h1'
            className='mb-8 max-w-4xl mx-auto text-center'
            weight='bold'
          >
            More Time Caring.
            <span className='block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent'>
              Less Time on Paperwork.
            </span>
          </Typography>

          {/* Subheadline */}
          <Typography
            variant='lead'
            className='text-lg sm:text-xl max-w-3xl mx-auto mb-10 text-center text-slate-600'
            weight='normal'
          >
            The complete platform that helps UK youth housing providers deliver
            life-changing support while staying compliant—without the
            administrative burden.
          </Typography>

          {/* CTA buttons */}
          <div className='flex flex-col sm:flex-row justify-center items-center gap-4 mb-12'>
            <Button
              size='lg'
              onClick={handleGetStarted}
              className='w-full sm:w-auto px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              aria-label='Start your free 30-day trial'
            >
              Start Free Trial
              <ArrowRight className='ml-2 h-5 w-5' aria-hidden='true' />
            </Button>

            <Button
              variant='outline'
              size='lg'
              onClick={handleWatchDemo}
              className='w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 hover:bg-primary-50 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              aria-label='Watch product demonstration video'
            >
              <Play className='mr-2 h-5 w-5' aria-hidden='true' />
              Watch Demo
            </Button>
          </div>

          {/* Value propositions */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto'>
            <div className='flex items-center justify-center gap-3 p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm'>
              <div className='flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-bold'>
                  ✓
                </span>
              </div>
              <Typography variant='body2' weight='medium' className='text-slate-700'>
                30-day free trial
              </Typography>
            </div>

            <div className='flex items-center justify-center gap-3 p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm'>
              <div className='flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-bold'>
                  ✓
                </span>
              </div>
              <Typography variant='body2' weight='medium' className='text-slate-700'>
                No setup fees
              </Typography>
            </div>

            <div className='flex items-center justify-center gap-3 p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm'>
              <div className='flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                <span className='text-white text-sm font-bold'>
                  ✓
                </span>
              </div>
              <Typography variant='body2' weight='medium' className='text-slate-700'>
                Cancel anytime
              </Typography>
            </div>
          </div>

          {/* Social proof */}
          <div className='mt-16 pt-8 border-t border-slate-200'>
            <p className='text-xs uppercase tracking-wide mb-6 text-slate-600'>
              Trusted by leading organisations
            </p>
            <div className='flex justify-center items-center gap-8 flex-wrap'>
              <div className='h-10 px-4 flex items-center justify-center bg-white rounded border border-slate-200' aria-label='Partner organisation logo'>
                <span className='text-slate-500 font-semibold text-sm'>LB Hackney</span>
              </div>
              <div className='h-10 px-4 flex items-center justify-center bg-white rounded border border-slate-200' aria-label='Partner organisation logo'>
                <span className='text-slate-500 font-semibold text-sm'>LB Tower Hamlets</span>
              </div>
              <div className='h-10 px-4 flex items-center justify-center bg-white rounded border border-slate-200' aria-label='Partner organisation logo'>
                <span className='text-slate-500 font-semibold text-sm'>Peabody Housing</span>
              </div>
              <div className='h-10 px-4 flex items-center justify-center bg-white rounded border border-slate-200' aria-label='Partner organisation logo'>
                <span className='text-slate-500 font-semibold text-sm'>Look Ahead Care</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
