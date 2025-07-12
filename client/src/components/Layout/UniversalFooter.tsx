import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export default function UniversalFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Features', href: '/' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Support', href: '#' },
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
    resources: [
      { name: 'Documentation', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'Training', href: '#' },
      { name: 'Community', href: '#' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-400" aria-hidden="true" />
              <span className="text-2xl font-bold text-white">YUTHUB</span>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">
              Comprehensive housing support management platform for youth organizations. 
              Empowering young lives through better housing support.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-200">
                <Mail className="h-4 w-4 text-blue-400" aria-hidden="true" />
                <a href="mailto:support@yuthub.com" className="hover:text-white transition-colors interactive-element">
                  support@yuthub.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-200">
                <Phone className="h-4 w-4 text-blue-400" aria-hidden="true" />
                <a href="tel:+442071234567" className="hover:text-white transition-colors interactive-element">
                  +44 20 7123 4567
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-200">
                <MapPin className="h-4 w-4 text-blue-400" aria-hidden="true" />
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
                      className="text-gray-200 hover:text-white text-sm transition-colors interactive-element focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
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
                      className="text-gray-200 hover:text-white text-sm transition-colors interactive-element focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
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
                      className="text-gray-200 hover:text-white text-sm transition-colors interactive-element focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
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
        <div className="border-t border-gray-600 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-200 text-sm">
              © {currentYear} YUTHUB. All rights reserved.
            </p>
            <nav role="navigation" aria-label="Legal links" className="flex space-x-6 mt-4 md:mt-0">
              <a 
                href="#" 
                className="text-gray-200 hover:text-white text-sm transition-colors interactive-element focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-gray-200 hover:text-white text-sm transition-colors interactive-element focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className="text-gray-200 hover:text-white text-sm transition-colors interactive-element focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
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