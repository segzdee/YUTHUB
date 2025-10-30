import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import FeaturesSection from '@/components/Landing/Features';
import SEOHead from '@/components/SEO/SEOHead';

export default function Features() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-50'>
      <SEOHead
        title='Features - YUTHUB Youth Housing Platform'
        description='Discover all the powerful features of YUTHUB: resident management, support planning, progress tracking, safeguarding tools, and comprehensive reporting for youth housing organizations.'
        keywords='housing management features, resident tracking, support planning, safeguarding tools, housing software features'
        canonicalUrl='https://www.yuthub.com/features'
      />
      <UniversalHeader />
      <main>
        <FeaturesSection />
      </main>
      <UniversalFooter />
    </div>
  );
}
