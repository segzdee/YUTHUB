import { Mail, Phone, MapPin, Shield, Clock, AlertTriangle, ExternalLink, FileText, Users, Book, Twitter, Linkedin, Github } from 'lucide-react';
import BrandLogo from '@/components/design-system/BrandLogo';

export default function UniversalFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Support', href: '/support' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Help Center', href: '/help' },
      { name: 'Training', href: '/training' },
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' },
    ],
  };

  return (
    <footer className="bg-neutral-800 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Emergency Contacts Banner */}
        <div className="bg-error/10 border border-error/20 rounded p-2 mb-6">
          <div className="flex items-center justify-center space-x-6 flex-wrap text-sm">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4 text-error" aria-hidden="true" />
              <span className="text-xs font-medium text-error">Crisis:</span>
              <a 
                href="tel:08001234567" 
                className="text-white font-semibold hover:text-error transition-colors"
                aria-label="24/7 Crisis helpline"
              >
                0800 123 4567
              </a>
            </div>
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4 text-warning" aria-hidden="true" />
              <span className="text-xs font-medium text-warning">Support:</span>
              <a 
                href="tel:+441611234568" 
                className="text-white font-semibold hover:text-warning transition-colors"
                aria-label="Technical support line"
              >
                +44 161 123 4568
              </a>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-info" aria-hidden="true" />
              <span className="text-xs text-info">24/7</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="space-y-3">
            <BrandLogo 
              size="md" 
              variant="light" 
              className="mb-2"
              aria-label="YUTHUB - Youth Housing Management System"
            />
            <p className="text-neutral-300 text-xs leading-relaxed">
              Youth housing management platform empowering organizations.
            </p>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-neutral-300">
                <Mail className="h-3 w-3 text-primary" aria-hidden="true" />
                <a href="mailto:support@yuthub.com" className="hover:text-white transition-colors">
                  support@yuthub.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-xs text-neutral-300">
                <Phone className="h-3 w-3 text-primary" aria-hidden="true" />
                <a href="tel:+442071234567" className="hover:text-white transition-colors">
                  +44 20 7123 4567
                </a>
              </div>
              <div className="flex items-center space-x-2 text-xs text-neutral-300">
                <MapPin className="h-3 w-3 text-primary" aria-hidden="true" />
                <span>London, UK</span>
              </div>
            </div>
            
            {/* Compliance Badges */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex items-center space-x-1" title="ISO 27001 Certified">
                <Shield className="h-4 w-4 text-success" aria-hidden="true" />
                <span className="text-xs text-success">ISO 27001</span>
              </div>
              <div className="flex items-center space-x-1" title="GDPR Compliant">
                <Shield className="h-4 w-4 text-success" aria-hidden="true" />
                <span className="text-xs text-success">GDPR</span>
              </div>
              <div className="flex items-center space-x-1" title="Cyber Essentials Plus">
                <Shield className="h-4 w-4 text-success" aria-hidden="true" />
                <span className="text-xs text-success">Cyber+</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-medium mb-2 text-white text-sm">Platform</h4>
            <nav role="navigation" aria-label="Platform links">
              <ul className="space-y-1">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-neutral-300 hover:text-white text-xs transition-colors"
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
            <h4 className="font-medium mb-2 text-white text-sm">Company</h4>
            <nav role="navigation" aria-label="Company links">
              <ul className="space-y-1">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-neutral-300 hover:text-white text-xs transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-medium mb-2 text-white text-sm">Legal</h4>
            <nav role="navigation" aria-label="Legal links">
              <ul className="space-y-1">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-neutral-300 hover:text-white text-xs transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          {/* Contact & Social */}
          <div>
            <h4 className="font-medium mb-2 text-white text-sm">Connect</h4>
            <div className="space-y-2">
              <div className="text-xs text-neutral-300">
                <div>Mon-Fri: 9AM-6PM GMT</div>
                <div>Emergency: 24/7</div>
              </div>
              <div className="flex space-x-2">
                <a href="https://twitter.com/yuthub" className="text-neutral-400 hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://linkedin.com/company/yuthub" className="text-neutral-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="https://github.com/yuthub" className="text-neutral-400 hover:text-white transition-colors" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
              </div>
              <div className="text-xs text-neutral-400">
                <a href="mailto:dpo@yuthub.com" className="hover:text-neutral-300 transition-colors">
                  DPO: dpo@yuthub.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-600 mt-4 pt-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
            <div className="flex flex-col space-y-1">
              <p className="text-neutral-300 text-xs">
                © {currentYear} YUTHUB. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center space-x-3 text-xs text-neutral-400">
                <span>England & Wales</span>
                <span>VAT: GB123456789</span>
                <span>Co: 12345678</span>
                <span>ICO: ZA123456</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-neutral-400">
              <a href="/system-status" className="hover:text-neutral-300 transition-colors flex items-center space-x-1">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <span>System OK</span>
              </a>
              <span>WCAG 2.1 AA</span>
              <a href="/accessibility-support" className="text-primary hover:text-primary-300 transition-colors">
                Accessibility Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}