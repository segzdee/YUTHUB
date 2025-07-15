import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import SEOHead from '@/components/SEO/SEOHead';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';

export default function Privacy() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy",
    "description": "YUTHUB Privacy Policy - How we protect and handle your personal data",
    "url": "https://yuthub.com/privacy",
    "isPartOf": {
      "@type": "WebSite",
      "name": "YUTHUB",
      "url": "https://yuthub.com"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy - YUTHUB | Data Protection & GDPR Compliance"
        description="Learn how YUTHUB protects your personal data and complies with GDPR regulations. Our comprehensive privacy policy for youth housing management platform users."
        keywords="YUTHUB privacy policy, data protection, GDPR compliance, youth housing data security, personal data handling"
        canonicalUrl="https://yuthub.com/privacy"
        structuredData={structuredData}
      />
      <UniversalHeader />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
        <h1 className="text-3xl font-bold text-high-contrast mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-medium-contrast">
          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Data Protection Officer</h2>
            <p>
              Our Data Protection Officer (DPO) is responsible for overseeing our data protection strategy and ensuring compliance with GDPR requirements.
            </p>
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p><strong>Contact:</strong> dpo@yuthub.com</p>
              <p><strong>ICO Registration:</strong> ZA123456</p>
              <p><strong>Response Time:</strong> Within 30 days</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Data Collection and Processing</h2>
            <p>
              We collect and process personal data in accordance with GDPR and UK data protection laws. This includes:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>User account information and authentication data</li>
              <li>Housing management and resident support data</li>
              <li>Communication and support interaction records</li>
              <li>System usage and performance analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Your Rights</h2>
            <p>Under GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request data deletion</li>
              <li>Object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, 
              or as required by law. Housing records are retained according to local government guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Contact Information</h2>
            <p>
              For any privacy-related questions or to exercise your rights, please contact:
            </p>
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p><strong>Email:</strong> privacy@yuthub.com</p>
              <p><strong>Phone:</strong> +44 20 7123 4567</p>
              <p><strong>Address:</strong> YUTHUB Ltd, London, United Kingdom</p>
            </div>
          </section>
        </div>
      </div>
      <UniversalFooter />
    </div>
  );
}