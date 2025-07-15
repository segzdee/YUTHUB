import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import SEOHead from '@/components/SEO/SEOHead';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';

export default function Terms() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service",
    "description": "YUTHUB Terms of Service - Legal terms and conditions for using our youth housing management platform",
    "url": "https://www.yuthub.com/terms",
    "isPartOf": {
      "@type": "WebSite",
      "name": "YUTHUB",
      "url": "https://www.yuthub.com"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Terms of Service - YUTHUB | Legal Terms & Conditions"
        description="Read YUTHUB's Terms of Service for our youth housing management platform. Legal terms, conditions, and user responsibilities for UK housing organizations."
        keywords="YUTHUB terms of service, legal terms, youth housing platform conditions, software terms, UK housing management legal"
        canonicalUrl="https://www.yuthub.com/terms"
        structuredData={structuredData}
      />
      <UniversalHeader />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
        <h1 className="text-3xl font-bold text-high-contrast mb-8">Terms of Service</h1>
        
        <div className="space-y-8 text-medium-contrast">
          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Legal Jurisdiction</h2>
            <p>
              These Terms of Service are governed by the laws of England and Wales. Any disputes arising from 
              the use of our services will be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p><strong>Governing Law:</strong> England and Wales</p>
              <p><strong>Dispute Resolution:</strong> UK Courts</p>
              <p><strong>Company Registration:</strong> 12345678</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Service Description</h2>
            <p>
              YUTHUB provides a comprehensive youth housing management platform designed to support organizations 
              in managing housing services, resident support, and compliance tracking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain accurate and up-to-date account information</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Protect login credentials and maintain system security</li>
              <li>Report any security incidents or data breaches immediately</li>
              <li>Use the platform only for its intended purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Service Availability</h2>
            <p>
              We strive to provide 99.9% uptime for our services. Planned maintenance will be communicated 
              in advance through our system status page and email notifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Updates and Modifications</h2>
            <p>
              We may update these Terms of Service from time to time. Users will be notified of significant 
              changes via email and through the platform. Continued use of the service after changes constitutes 
              acceptance of the new terms.
            </p>
            <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-lg">
              <p><strong>Notification Method:</strong> Email and in-app notifications</p>
              <p><strong>Notice Period:</strong> 30 days for material changes</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Contact Information</h2>
            <p>
              For questions regarding these Terms of Service, please contact:
            </p>
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p><strong>Email:</strong> legal@yuthub.com</p>
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