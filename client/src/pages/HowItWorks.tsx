import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import HowItWorksSection from '@/components/Landing/HowItWorks';
import SEOHead from '@/components/SEO/SEOHead';

export default function HowItWorks() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50'>
      <SEOHead
        title='How It Works - YUTHUB Implementation Guide'
        description='Learn how to get started with YUTHUB in four simple steps: setup, customize, track, and analyze. See how easy it is to transform your youth housing support services.'
        keywords='YUTHUB setup, housing software implementation, platform onboarding, getting started'
        canonicalUrl='https://www.yuthub.com/how-it-works'
      />
      <UniversalHeader />
      <main>
        <HowItWorksSection />
      </main>
      <UniversalFooter />
    </div>
  );
}
