import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import Hero from '@/components/Landing/Hero';
import Features from '@/components/Landing/Features';
import HowItWorks from '@/components/Landing/HowItWorks';
import Testimonials from '@/components/Landing/Testimonials';
import PricingSection from '@/components/Landing/Pricing';
import SEOHead from '@/components/SEO/SEOHead';

export default function Landing() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "YUTHUB",
    "description": "Comprehensive youth housing management platform for UK housing associations, local authorities, and social care organizations",
    "url": "https://yuthub.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": "169",
        "priceCurrency": "GBP",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "169",
          "priceCurrency": "GBP",
          "unitText": "MONTH"
        }
      },
      {
        "@type": "Offer",
        "name": "Professional Plan", 
        "price": "429",
        "priceCurrency": "GBP",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "429",
          "priceCurrency": "GBP",
          "unitText": "MONTH"
        }
      },
      {
        "@type": "Offer",
        "name": "Enterprise Plan",
        "price": "1099", 
        "priceCurrency": "GBP",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "1099",
          "priceCurrency": "GBP",
          "unitText": "MONTH"
        }
      }
    ],
    "creator": {
      "@type": "Organization",
      "name": "YUTHUB",
      "url": "https://yuthub.com",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "GB"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="YUTHUB - Youth Housing Management Platform | UK Housing Software"
        description="Comprehensive SaaS platform for youth housing organizations in the UK. Manage residents, track outcomes, and guide young people toward independent living with our specialized housing management software."
        keywords="youth housing management, UK housing software, social care platform, supported housing system, council housing management, housing association software, young people accommodation"
        canonicalUrl="https://yuthub.com"
        structuredData={structuredData}
      />
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