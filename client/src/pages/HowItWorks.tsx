import { PublicPageLayout } from '@/components/PageLayout';
import HowItWorksSection from '@/components/Landing/HowItWorks';
import SEOHead from '@/components/SEO/SEOHead';

export default function HowItWorks() {
  return (
    <>
      <SEOHead
        title='How It Works - YUTHUB Implementation Guide'
        description='Learn how to get started with YUTHUB in four simple steps: setup, customize, track, and analyze. See how easy it is to transform your youth housing support services.'
        keywords='YUTHUB setup, housing software implementation, platform onboarding, getting started'
        canonicalUrl='https://www.yuthub.com/how-it-works'
      />
      <PublicPageLayout>
        <main>
          <HowItWorksSection />
        </main>
      </PublicPageLayout>
    </>
  );
}
