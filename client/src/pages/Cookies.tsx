import { useState } from 'react';
import UniversalHeader from '@/components/Layout/UniversalHeader';
import UniversalFooter from '@/components/Layout/UniversalFooter';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEO/SEOHead';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';

export default function Cookies() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    personalization: true,
  });

  const handleSavePreferences = () => {
    // Save cookie preferences to localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    alert('Cookie preferences saved successfully!');
  };

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    });
  };

  const handleRejectOptional = () => {
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Cookie Policy",
    "description": "YUTHUB Cookie Policy - Manage your cookie preferences for our youth housing management platform",
    "url": "https://www.yuthub.com/cookies",
    "isPartOf": {
      "@type": "WebSite",
      "name": "YUTHUB",
      "url": "https://www.yuthub.com"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Cookie Policy - YUTHUB | Manage Cookie Preferences"
        description="Manage your cookie preferences for YUTHUB youth housing management platform. Control analytics, marketing, and personalization cookies."
        keywords="YUTHUB cookie policy, cookie preferences, privacy controls, youth housing platform cookies"
        canonicalUrl="https://www.yuthub.com/cookies"
        structuredData={structuredData}
      />
      <UniversalHeader />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Cookie Policy' }]} />
        <h1 className="text-3xl font-bold text-high-contrast mb-8">Cookie Policy</h1>
        
        <div className="space-y-8">
          <section className="text-medium-contrast">
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Cookie Management</h2>
            <p>
              We use cookies to enhance your experience on our platform. You can manage your cookie preferences 
              below and opt-out of non-essential cookies at any time.
            </p>
          </section>

          <section className="bg-neutral-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-high-contrast mb-4">Cookie Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-high-contrast">Necessary Cookies</h4>
                  <p className="text-sm text-medium-contrast">Required for basic site functionality</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="w-5 h-5 text-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-high-contrast">Analytics Cookies</h4>
                  <p className="text-sm text-medium-contrast">Help us understand how you use our platform</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="w-5 h-5 text-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-high-contrast">Marketing Cookies</h4>
                  <p className="text-sm text-medium-contrast">Used to deliver relevant advertisements</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="w-5 h-5 text-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-high-contrast">Personalization Cookies</h4>
                  <p className="text-sm text-medium-contrast">Remember your preferences and settings</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.personalization}
                  onChange={(e) => setPreferences(prev => ({ ...prev, personalization: e.target.checked }))}
                  className="w-5 h-5 text-primary"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button onClick={handleSavePreferences} className="bg-primary hover:bg-primary-600">
                Save Preferences
              </Button>
              <Button onClick={handleAcceptAll} variant="outline">
                Accept All
              </Button>
              <Button onClick={handleRejectOptional} variant="outline">
                Reject Optional
              </Button>
            </div>
          </section>

          <section className="text-medium-contrast">
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Cookie Types</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-high-contrast mb-2">Session Cookies</h3>
                <p>Temporary cookies that expire when you close your browser. Used for authentication and navigation.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-high-contrast mb-2">Persistent Cookies</h3>
                <p>Remain on your device for a specified period. Used to remember your preferences and settings.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-high-contrast mb-2">Third-Party Cookies</h3>
                <p>Set by external services we use for analytics and functionality. You can opt-out of these cookies.</p>
              </div>
            </div>
          </section>

          <section className="text-medium-contrast">
            <h2 className="text-2xl font-semibold text-high-contrast mb-4">Opt-Out Options</h2>
            <p>
              You can control cookies through your browser settings or by using the preferences above. 
              Note that disabling certain cookies may affect the functionality of our platform.
            </p>
            <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</p>
              <p><strong>Third-Party Opt-Out:</strong> Visit <a href="https://optout.aboutads.info/" className="text-primary hover:underline">aboutads.info</a> for advertising cookies</p>
            </div>
          </section>
        </div>
      </div>
      <UniversalFooter />
    </div>
  );
}