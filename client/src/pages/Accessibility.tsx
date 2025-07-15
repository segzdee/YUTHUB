import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import SEOHead from '@/components/SEO/SEOHead';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';

export default function Accessibility() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Accessibility Statement",
    "description": "YUTHUB Accessibility Statement - Our commitment to digital accessibility and WCAG 2.1 compliance",
    "url": "https://yuthub.com/accessibility",
    "isPartOf": {
      "@type": "WebSite",
      "name": "YUTHUB",
      "url": "https://yuthub.com"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Accessibility Statement - YUTHUB | WCAG 2.1 AA Compliance"
        description="Learn about YUTHUB's commitment to digital accessibility. Our youth housing management platform meets WCAG 2.1 Level AA standards for all users."
        keywords="YUTHUB accessibility, WCAG compliance, digital accessibility, youth housing platform accessibility, screen reader compatible"
        canonicalUrl="https://yuthub.com/accessibility"
        structuredData={structuredData}
      />
      <UniversalHeader />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Accessibility' }]} />
        <h1 className="text-3xl font-bold text-high-contrast mb-8">Accessibility Statement</h1>
        
        <div className="space-y-8 text-medium-contrast">
          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Our Commitment</h2>
            <p>
              YUTHUB is committed to ensuring digital accessibility for all users, including those with disabilities. 
              We continually improve the user experience for everyone and apply relevant accessibility standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Compliance Status</h2>
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <p className="font-medium text-success">WCAG 2.1 Level AA Compliant</p>
              <p className="text-sm mt-2">
                Our platform meets the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Accessibility Features</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keyboard navigation support throughout the platform</li>
              <li>Screen reader compatibility with proper ARIA labels</li>
              <li>High contrast mode for better visibility</li>
              <li>Adjustable font sizes and text scaling</li>
              <li>Alternative text for images and visual content</li>
              <li>Consistent navigation and layout structure</li>
              <li>Form validation with clear error messages</li>
              <li>Focus indicators for interactive elements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Browser Compatibility</h2>
            <p>Our platform is compatible with the following assistive technologies:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>NVDA (Windows)</li>
              <li>JAWS (Windows)</li>
              <li>VoiceOver (macOS/iOS)</li>
              <li>TalkBack (Android)</li>
              <li>Dragon NaturallySpeaking (Windows)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Known Limitations</h2>
            <p>
              While we strive for full accessibility, we acknowledge that some areas may still present challenges:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Some third-party embedded content may not be fully accessible</li>
              <li>Complex data visualizations may require alternative descriptions</li>
              <li>Legacy uploaded documents may not meet current accessibility standards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Feedback and Support</h2>
            <p>
              We welcome feedback on the accessibility of our platform. If you encounter any barriers or have 
              suggestions for improvement, please contact us:
            </p>
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p><strong>Email:</strong> accessibility@yuthub.com</p>
              <p><strong>Phone:</strong> +44 20 7123 4567</p>
              <p><strong>Response Time:</strong> Within 2 business days</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Assessment and Testing</h2>
            <p>
              This accessibility statement was last updated on {new Date().toLocaleDateString('en-GB')}. 
              We regularly review and test our platform using:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Automated accessibility testing tools</li>
              <li>Manual testing with assistive technologies</li>
              <li>User testing with individuals with disabilities</li>
              <li>Regular accessibility audits by third-party experts</li>
            </ul>
          </section>
        </div>
      </div>
      <UniversalFooter />
    </div>
  );
}