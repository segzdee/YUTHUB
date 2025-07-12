import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import Hero from '@/components/Landing/Hero';
import Features from '@/components/Landing/Features';
import HowItWorks from '@/components/Landing/HowItWorks';
import Testimonials from '@/components/Landing/Testimonials';
import PricingSection from '@/components/Landing/Pricing';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <UniversalHeader />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <UniversalFooter />
    </div>
  );
}