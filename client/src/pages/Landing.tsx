import UniversalHeader from '@/components/Layout/UniversalHeader';
import SEOHead from '@/components/SEO/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Shield, Users, Star } from 'lucide-react';

export default function Landing() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'YUTHUB',
    description:
      'Comprehensive youth housing management platform for UK housing associations, local authorities, and social care organizations',
    url: 'https://www.yuthub.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter Plan',
        price: '169',
        priceCurrency: 'GBP',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '169',
          priceCurrency: 'GBP',
          unitText: 'MONTH',
        },
      },
      {
        '@type': 'Offer',
        name: 'Professional Plan',
        price: '429',
        priceCurrency: 'GBP',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '429',
          priceCurrency: 'GBP',
          unitText: 'MONTH',
        },
      },
      {
        '@type': 'Offer',
        name: 'Enterprise Plan',
        price: '1099',
        priceCurrency: 'GBP',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '1099',
          priceCurrency: 'GBP',
          unitText: 'MONTH',
        },
      },
    ],
    creator: {
      '@type': 'Organization',
      name: 'YUTHUB',
      url: 'https://www.yuthub.com',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GB',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
  };

  const handleGetStarted = () => {
    window.location.href = '/signup';
  };

  const handleWatchDemo = () => {
    console.log('Watch demo clicked');
  };

  return (
    <div className='h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50'>
      <SEOHead
        title='YUTHUB - Youth Housing Management Platform | UK Housing Software'
        description='Comprehensive SaaS platform for youth housing organizations in the UK. Manage residents, track outcomes, and guide young people toward independent living with our specialized housing management software.'
        keywords='youth housing management, UK housing software, social care platform, supported housing system, council housing management, housing association software, young people accommodation'
        canonicalUrl='https://www.yuthub.com'
        structuredData={structuredData}
      />
      <UniversalHeader />

      <section className='h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden'>
        <div className='absolute inset-0 bg-grid-pattern opacity-5' />
        <div className='absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30' />
        <div className='absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-30' />

        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <div className='flex justify-center items-center gap-6 mb-8 flex-wrap'>
              <Badge variant='secondary' className='flex items-center gap-2'>
                <Shield className='h-4 w-4' />
                <span>GDPR Compliant</span>
              </Badge>
              <Badge variant='secondary' className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                <span>500+ Organisations</span>
              </Badge>
              <Badge variant='secondary' className='flex items-center gap-2'>
                <Star className='h-4 w-4' />
                <span>4.8/5 Rating</span>
              </Badge>
            </div>

            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 max-w-5xl mx-auto text-slate-900 leading-tight'>
              Transform Young Lives Through
              <span className='block bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mt-2'>
                Smarter Housing Support
              </span>
            </h1>

            <p className='text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed text-slate-700'>
              YUTHUB is the comprehensive platform for youth housing organizations.
              Streamline support services, track independence pathways, and ensure
              safeguarding compliance - all in one powerful system.
            </p>

            <div className='flex flex-col sm:flex-row justify-center items-center gap-4 mb-12'>
              <Button
                size='lg'
                onClick={handleGetStarted}
                className='w-full sm:w-auto px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-blue-500 hover:bg-blue-600'
              >
                Start Free Trial
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>

              <Button
                variant='outline'
                size='lg'
                onClick={handleWatchDemo}
                className='w-full sm:w-auto px-8 py-6 text-lg font-semibold border-2 border-slate-300 hover:bg-slate-100 transition-all duration-300'
              >
                <Play className='mr-2 h-5 w-5' />
                Watch Demo
              </Button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto'>
              <div className='flex items-center justify-center gap-3 p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-blue-200'>
                <div className='flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                  <span className='text-white text-sm font-bold'>✓</span>
                </div>
                <span className='text-sm font-medium text-slate-700'>30-day free trial</span>
              </div>

              <div className='flex items-center justify-center gap-3 p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-blue-200'>
                <div className='flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                  <span className='text-white text-sm font-bold'>✓</span>
                </div>
                <span className='text-sm font-medium text-slate-700'>No setup fees</span>
              </div>

              <div className='flex items-center justify-center gap-3 p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-blue-200'>
                <div className='flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                  <span className='text-white text-sm font-bold'>✓</span>
                </div>
                <span className='text-sm font-medium text-slate-700'>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
