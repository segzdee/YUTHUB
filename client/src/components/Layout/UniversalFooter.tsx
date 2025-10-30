import {
  Mail,
  Phone,
  MapPin,
  Shield,
  Clock,
  AlertTriangle,
  ExternalLink,
  FileText,
  Users,
  Book,
  Twitter,
  Linkedin,
  Github,
} from 'lucide-react';
import BrandLogo from '@/components/design-system/BrandLogo';

export default function UniversalFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Features', href: '/#features' },
      { name: 'Support', href: '/support' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
    ],
    legalSecondary: [{ name: 'Cookies', href: '/cookies' }],
  };

  return (
    <footer className='bg-neutral-800 text-white' role='contentinfo'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='grid grid-cols-1 min-[320px]:grid-cols-2 sm:grid-cols-4 gap-4'>
          {/* Company Info */}
          <div className='space-y-2 col-span-1 min-[320px]:col-span-2 sm:col-span-1'>
            <BrandLogo
              size='sm'
              variant='light'
              className='mb-1'
              aria-label='YUTHUB - Youth Housing Management System'
            />
            <div className='flex items-center space-x-1 text-xs text-neutral-300'>
              <Mail className='h-3 w-3 text-primary' aria-hidden='true' />
              <a
                href='mailto:support@yuthub.com'
                className='hover:text-white transition-colors'
              >
                support@yuthub.com
              </a>
            </div>

            {/* Compliance Badges */}
            <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
              <div
                className='flex items-center space-x-1'
                title='ISO 27001 Certified'
              >
                <Shield className='h-3 w-3 text-success' aria-hidden='true' />
                <span className='text-xs text-success'>ISO</span>
              </div>
              <div
                className='flex items-center space-x-1'
                title='GDPR Compliant'
              >
                <Shield className='h-3 w-3 text-success' aria-hidden='true' />
                <span className='text-xs text-success'>GDPR</span>
              </div>
              <div
                className='flex items-center space-x-1'
                title='Cyber Essentials Plus'
              >
                <Shield className='h-3 w-3 text-success' aria-hidden='true' />
                <span className='text-xs text-success'>Cyber+</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className='font-medium mb-1 text-white text-xs'>Platform</h4>
            <nav role='navigation' aria-label='Platform links'>
              <ul className='space-y-1'>
                {footerLinks.platform.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className='text-neutral-300 hover:text-white text-xs transition-colors'
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
            <h4 className='font-medium mb-1 text-white text-xs'>Company</h4>
            <nav role='navigation' aria-label='Company links'>
              <ul className='space-y-1'>
                {footerLinks.company.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className='text-neutral-300 hover:text-white text-xs transition-colors'
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Legal & Connect */}
          <div className='col-span-1 min-[320px]:col-span-2 sm:col-span-1'>
            <h4 className='font-medium mb-1 text-white text-xs'>Legal</h4>
            <nav role='navigation' aria-label='Legal links'>
              <ul className='space-y-1'>
                {footerLinks.legal.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className='text-neutral-300 hover:text-white text-xs transition-colors'
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
              <ul className='flex space-x-2 mt-1'>
                {footerLinks.legalSecondary.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className='text-neutral-300 hover:text-white text-xs transition-colors'
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className='flex flex-wrap gap-2 mt-2'>
              <a
                href='https://twitter.com/yuthub'
                className='text-neutral-400 hover:text-white transition-colors touch-target min-w-[32px] min-h-[32px] flex items-center justify-center'
                aria-label='Twitter'
              >
                <Twitter className='h-3 w-3' />
              </a>
              <a
                href='https://linkedin.com/company/yuthub'
                className='text-neutral-400 hover:text-white transition-colors touch-target min-w-[32px] min-h-[32px] flex items-center justify-center'
                aria-label='LinkedIn'
              >
                <Linkedin className='h-3 w-3' />
              </a>
              <a
                href='https://github.com/yuthub'
                className='text-neutral-400 hover:text-white transition-colors touch-target min-w-[32px] min-h-[32px] flex items-center justify-center'
                aria-label='GitHub'
              >
                <Github className='h-3 w-3' />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-neutral-600 mt-2 pt-2'>
          <div className='flex flex-col min-[320px]:flex-row justify-between items-start min-[320px]:items-center space-y-1 min-[320px]:space-y-0'>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400'>
              <span>© {currentYear} YUTHUB</span>
              <span className='hidden min-[375px]:inline'>
                VAT: GB123456789
              </span>
              <span className='hidden min-[375px]:inline'>Co: 12345678</span>
            </div>

            <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400'>
              <a
                href='/system-status'
                className='hover:text-neutral-300 transition-colors flex items-center space-x-1'
              >
                <span className='w-2 h-2 bg-success rounded-full'></span>
                <span>System OK</span>
              </a>
              <a
                href='/accessibility'
                className='hidden min-[375px]:inline hover:text-neutral-300 transition-colors'
                aria-label='Accessibility Statement'
              >
                Accessibility
              </a>
              <a
                href='mailto:dpo@yuthub.com'
                className='hover:text-neutral-300 transition-colors'
              >
                DPO
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
