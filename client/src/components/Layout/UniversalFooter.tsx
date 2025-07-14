import { Mail, Phone, MapPin } from 'lucide-react';
import BrandLogo from '@/components/design-system/BrandLogo';

export default function UniversalFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Features', href: '/' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Support', href: '/support' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Help Center', href: '/help' },
      { name: 'Training', href: '/training' },
      { name: 'Community', href: '/community' },
    ],
  };

  return (
    <footer className="bg-neutral-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <BrandLogo 
              size="lg" 
              variant="light" 
              className="mb-4"
              aria-label="YUTHUB - Youth Housing Management System"
            />
            <p className="text-neutral-200 text-sm leading-relaxed">
              Comprehensive housing support management platform for youth organizations. 
              Empowering young lives through better housing support.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-neutral-200">
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                <a href="mailto:support@yuthub.com" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded">
                  support@yuthub.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-neutral-200">
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                <a href="tel:+442071234567" className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded">
                  +44 20 7123 4567
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-neutral-200">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>London, United Kingdom</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Platform</h4>
            <nav role="navigation" aria-label="Platform links">
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <nav role="navigation" aria-label="Company links">
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <nav role="navigation" aria-label="Resources links">
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-600 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-200 text-sm">
              © {currentYear} YUTHUB. All rights reserved.
            </p>
            <nav role="navigation" aria-label="Legal links" className="flex space-x-6 mt-4 md:mt-0">
              <a 
                href="/privacy" 
                className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded"
              >
                Terms of Service
              </a>
              <a 
                href="/cookies" 
                className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded"
              >
                Cookie Policy
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}