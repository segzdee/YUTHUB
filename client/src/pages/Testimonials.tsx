import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import TestimonialsSection from '@/components/Landing/Testimonials';
import SEOHead from '@/components/SEO/SEOHead';

export default function Testimonials() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50'>
      <SEOHead
        title='Customer Stories - YUTHUB Success Stories'
        description='Read real testimonials from housing associations, local authorities, and youth services using YUTHUB to transform their support services and improve outcomes for young people.'
        keywords='YUTHUB reviews, customer testimonials, housing software success stories, client feedback'
        canonicalUrl='https://www.yuthub.com/testimonials'
      />
      <UniversalHeader />
      <main>
        <TestimonialsSection />
      </main>
      <UniversalFooter />
    </div>
  );
}
