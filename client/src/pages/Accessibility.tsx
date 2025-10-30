import { PublicPageLayout } from '@/components/PageLayout';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';
import SEOHead from '@/components/SEO/SEOHead';

export default function Accessibility() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Accessibility Statement',
    description:
      'YUTHUB Accessibility Statement - Our commitment to digital accessibility and WCAG 2.1 compliance',
    url: 'https://www.yuthub.com/accessibility',
    isPartOf: {
      '@type': 'WebSite',
      name: 'YUTHUB',
      url: 'https://www.yuthub.com',
    },
  };

  return (
    <>
      <SEOHead
        title='Accessibility Statement - YUTHUB | WCAG 2.1 AA Compliance'
        description="Learn about YUTHUB's commitment to digital accessibility. Our youth housing management platform meets WCAG 2.1 Level AA standards for all users."
        keywords='YUTHUB accessibility, WCAG compliance, digital accessibility, youth housing platform accessibility, screen reader compatible'
        canonicalUrl='https://www.yuthub.com/accessibility'
        structuredData={structuredData}
      />
      <PublicPageLayout>
        <div className='max-w-4xl mx-auto px-4 py-12'>
          <Breadcrumbs items={[{ label: 'Accessibility Statement' }]} />
          <h1 className='text-3xl font-bold text-high-contrast mb-8'>
            Accessibility Statement
          </h1>

          <div className='space-y-8 text-medium-contrast'>
          <section>
            <h2 className='text-2xl font-semibold text-high-contrast mb-4'>
              Our Commitment
            </h2>
            <p>
              YUTHUB is committed to ensuring digital accessibility for people
              with disabilities. We are continually improving the user
              experience for everyone and applying the relevant accessibility
              standards.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-high-contrast mb-4'>
              Conformance Status
            </h2>
            <p>
              The Web Content Accessibility Guidelines (WCAG) defines
              requirements for designers and developers to improve accessibility
              for people with disabilities. It defines three levels of
              conformance: Level A, Level AA, and Level AAA.
            </p>
            <p className='mt-4'>
              YUTHUB is partially conformant with WCAG 2.1 level AA. Partially
              conformant means that some parts of the content do not fully
              conform to the accessibility standard.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-high-contrast mb-4'>
              Accessibility Features
            </h2>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Keyboard navigation support</li>
              <li>Screen reader compatibility</li>
              <li>High contrast color schemes</li>
              <li>Resizable text up to 200%</li>
              <li>Alternative text for images</li>
              <li>Descriptive link text</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-high-contrast mb-4'>
              Contact Information
            </h2>
            <p>
              If you encounter accessibility barriers while using our platform,
              please contact us:
            </p>
            <div className='mt-4 p-4 bg-neutral-50 rounded-lg'>
              <p>
                <strong>Email:</strong> accessibility@yuthub.com
              </p>
              <p>
                <strong>Phone:</strong> +44 20 7123 4567
              </p>
            </div>
          </section>
          </div>
        </div>
      </PublicPageLayout>
    </>
  );
}
