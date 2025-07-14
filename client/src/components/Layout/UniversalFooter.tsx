import { Mail, Phone, MapPin, Shield, Clock, AlertTriangle, ExternalLink, FileText, Users, Book } from 'lucide-react';
import BrandLogo from '@/components/design-system/BrandLogo';

export default function UniversalFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Features', href: '/#features', icon: FileText },
      { name: 'Pricing', href: '/pricing', icon: null },
      { name: 'Dashboard', href: '/dashboard', icon: null },
      { name: 'Support', href: '/support', icon: null },
    ],
    company: [
      { name: 'About Us', href: '/about', icon: Users },
      { name: 'Contact', href: '/contact', icon: Phone },
      { name: 'Privacy Policy', href: '/privacy', icon: Shield },
      { name: 'Terms of Service', href: '/terms', icon: FileText },
    ],
    resources: [
      { name: 'Documentation', href: '/docs', icon: Book },
      { name: 'Help Center', href: '/help', icon: null },
      { name: 'Training', href: '/training', icon: null },
      { name: 'Community', href: '/community', icon: Users },
    ],
    legal: [
      { name: 'Cookie Policy', href: '/cookies', icon: Shield },
      { name: 'Accessibility', href: '/accessibility', icon: null },
      { name: 'Data Protection', href: '/data-protection', icon: Shield },
      { name: 'Security', href: '/security', icon: Shield },
    ],
  };

  return (
    <footer className="bg-neutral-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Emergency Contacts Banner */}
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center space-x-8 flex-wrap">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-error" aria-hidden="true" />
              <span className="text-sm font-medium text-error">Crisis Line:</span>
              <a 
                href="tel:08001234567" 
                className="text-white font-bold hover:text-error transition-colors"
                aria-label="24/7 Crisis helpline"
              >
                0800 123 4567
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-warning" aria-hidden="true" />
              <span className="text-sm font-medium text-warning">Technical Support:</span>
              <a 
                href="tel:+441611234568" 
                className="text-white font-bold hover:text-warning transition-colors"
                aria-label="Technical support line"
              >
                +44 161 123 4568
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-info" aria-hidden="true" />
              <span className="text-sm text-info">24/7 Available</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
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
            
            {/* Office Hours */}
            <div className="pt-2 border-t border-neutral-700">
              <div className="text-sm text-neutral-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="font-medium">Office Hours:</span>
                </div>
                <div className="ml-6 space-y-1">
                  <div>Mon-Fri: 9:00 AM - 6:00 PM GMT</div>
                  <div>Emergency: 24/7 Available</div>
                </div>
              </div>
            </div>
            
            {/* DPO Contact */}
            <div className="pt-2 border-t border-neutral-700">
              <div className="text-sm text-neutral-200">
                <div className="font-medium mb-1">Data Protection Officer:</div>
                <a href="mailto:dpo@yuthub.com" className="hover:text-white transition-colors">
                  dpo@yuthub.com
                </a>
                <div className="text-xs text-neutral-400 mt-1">
                  ICO Registration: ZA123456
                </div>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Platform</h4>
            <nav role="navigation" aria-label="Platform links">
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <li key={link.name}>
                      <a 
                        href={link.href}
                        className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded flex items-center space-x-2"
                      >
                        {IconComponent && <IconComponent className="h-4 w-4" aria-hidden="true" />}
                        <span>{link.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-neutral-700">
              <h5 className="font-medium mb-2 text-white text-sm">Quick Actions</h5>
              <ul className="space-y-2">
                <li>
                  <a href="/dashboard" className="text-neutral-200 hover:text-white text-sm transition-colors flex items-center space-x-2">
                    <span>View Dashboard</span>
                  </a>
                </li>
                <li>
                  <a href="/crisis" className="text-neutral-200 hover:text-white text-sm transition-colors flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-error" aria-hidden="true" />
                    <span>Crisis Response</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <nav role="navigation" aria-label="Company links">
              <ul className="space-y-2">
                {footerLinks.company.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <li key={link.name}>
                      <a 
                        href={link.href}
                        className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded flex items-center space-x-2"
                      >
                        {IconComponent && <IconComponent className="h-4 w-4" aria-hidden="true" />}
                        <span>{link.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            {/* Awards & Partnerships */}
            <div className="mt-6 pt-4 border-t border-neutral-700">
              <h5 className="font-medium mb-2 text-white text-sm">Recognition</h5>
              <ul className="space-y-1 text-xs text-neutral-400">
                <li>Housing Innovation Award 2024</li>
                <li>Best Youth Services Platform</li>
                <li>Partner: Local Government Association</li>
              </ul>
            </div>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <nav role="navigation" aria-label="Resources links">
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <li key={link.name}>
                      <a 
                        href={link.href}
                        className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded flex items-center space-x-2"
                      >
                        {IconComponent && <IconComponent className="h-4 w-4" aria-hidden="true" />}
                        <span>{link.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            {/* Support Information */}
            <div className="mt-6 pt-4 border-t border-neutral-700">
              <h5 className="font-medium mb-2 text-white text-sm">Support</h5>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="text-neutral-200 hover:text-white text-sm transition-colors flex items-center space-x-2">
                    <span>Live Chat Available</span>
                  </a>
                </li>
                <li>
                  <div className="text-xs text-neutral-400">
                    Support Hours: Mon-Fri 9AM-6PM GMT
                  </div>
                </li>
                <li>
                  <a href="/training" className="text-neutral-200 hover:text-white text-sm transition-colors flex items-center space-x-2">
                    <span>Certification Programs</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Legal & Compliance */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal & Compliance</h4>
            <nav role="navigation" aria-label="Legal links">
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <li key={link.name}>
                      <a 
                        href={link.href}
                        className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded flex items-center space-x-2"
                      >
                        {IconComponent && <IconComponent className="h-4 w-4" aria-hidden="true" />}
                        <span>{link.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            {/* Compliance Badges */}
            <div className="mt-6 pt-4 border-t border-neutral-700">
              <h5 className="font-medium mb-3 text-white text-sm">Compliance</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-neutral-200">
                  <Shield className="h-4 w-4 text-success" aria-hidden="true" />
                  <span>ISO 27001 Certified</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-neutral-200">
                  <Shield className="h-4 w-4 text-success" aria-hidden="true" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-neutral-200">
                  <Shield className="h-4 w-4 text-success" aria-hidden="true" />
                  <span>Cyber Essentials Plus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-600 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Copyright and Legal */}
            <div className="flex flex-col space-y-2">
              <p className="text-neutral-200 text-sm">
                © {currentYear} YUTHUB. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center space-x-4 text-xs text-neutral-400">
                <span>Legal Jurisdiction: England & Wales</span>
                <span>VAT Registration: GB123456789</span>
                <span>Company No: 12345678</span>
              </div>
            </div>
            
            {/* Quick Legal Links */}
            <div className="flex flex-col space-y-2">
              <nav role="navigation" aria-label="Legal links" className="flex flex-wrap space-x-4 lg:space-x-6">
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
                <a 
                  href="/accessibility" 
                  className="text-neutral-200 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded"
                >
                  Accessibility
                </a>
              </nav>
              
              {/* Pricing & System Status */}
              <div className="flex flex-wrap items-center space-x-4 text-xs text-neutral-400">
                <a href="/pricing" className="hover:text-neutral-200 transition-colors">
                  Transparent Pricing
                </a>
                <a href="/system-status" className="hover:text-neutral-200 transition-colors flex items-center space-x-1">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  <span>System Status</span>
                </a>
                <span>Update notifications via email</span>
              </div>
            </div>
          </div>
          
          {/* Accessibility Statement */}
          <div className="mt-6 pt-4 border-t border-neutral-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
              <p className="text-xs text-neutral-400">
                Accessibility: WCAG 2.1 AA compliant. 
                <a href="/accessibility-support" className="text-primary hover:text-primary-300 transition-colors ml-1">
                  Need help? Contact accessibility@yuthub.com
                </a>
              </p>
              <div className="flex items-center space-x-4 text-xs text-neutral-400">
                <a href="https://twitter.com/yuthub" className="hover:text-neutral-200 transition-colors" aria-label="Follow us on Twitter">
                  Twitter
                </a>
                <a href="https://linkedin.com/company/yuthub" className="hover:text-neutral-200 transition-colors" aria-label="Connect on LinkedIn">
                  LinkedIn
                </a>
                <a href="https://github.com/yuthub" className="hover:text-neutral-200 transition-colors" aria-label="View our GitHub">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}