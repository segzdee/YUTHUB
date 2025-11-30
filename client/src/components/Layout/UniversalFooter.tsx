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
    <footer className='bg-gradient-to-br from-blue-50 via-slate-50 to-teal-50 text-slate-700 border-t border-slate-200' role='contentinfo'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='grid grid-cols-1 min-[320px]:grid-cols-2 sm:grid-cols-4 gap-4'>
          {/* Company Info */}
          <div className='space-y-2 col-span-1 min-[320px]:col-span-2 sm:col-span-1'>
            <BrandLogo
              size='sm'
              variant='default'
              showText={true}
              showSlogan={false}
              className='mb-1'
              aria-label='YUTHUB'
            />
            <div className='flex items-center space-x-1 text-xs text-slate-600'>
              <Mail className='h-3 w-3 text-blue-500' aria-hidden='true' />
              <a
                href='mailto:support@yuthub.com'
                className='hover:text-blue-600 transition-colors hover:underline'
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
                <Shield className='h-3 w-3 text-green-500' aria-hidden='true' />
                <span className='text-xs text-green-600 font-medium'>ISO</span>
              </div>
              <div
                className='flex items-center space-x-1'
                title='GDPR Compliant'
              >
                <Shield className='h-3 w-3 text-green-500' aria-hidden='true' />
                <span className='text-xs text-green-600 font-medium'>GDPR</span>
              </div>
              <div
                className='flex items-center space-x-1'
                title='Cyber Essentials Plus'
              >
                <Shield className='h-3 w-3 text-green-500' aria-hidden='true' />
                <span className='text-xs text-green-600 font-medium'>Cyber+</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className='font-medium mb-1 text-slate-900 text-xs'>Platform</h4>
            <nav role='navigation' aria-label='Platform links'>
              <ul className='space-y-1'>
                {footerLinks.platform.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className='text-slate-600 hover:text-blue-600 text-xs transition-colors hover:underline'
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
            <h4 className='font-medium mb-1 text-slate-900 text-xs'>Company</h4>
            <nav role='navigation' aria-label='Company links'>
              <ul className='space-y-1'>
                {footerLinks.company.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className='text-slate-600 hover:text-blue-600 text-xs transition-colors hover:underline'
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
            <h4 className='font-medium mb-1 text-slate-900 text-xs'>Legal</h4>
            <nav role='navigation' aria-label='Legal links'>
              <ul className='space-y-1'>
                {footerLinks.legal.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className='text-slate-600 hover:text-blue-600 text-xs transition-colors hover:underline'
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
                      className='text-slate-600 hover:text-blue-600 text-xs transition-colors hover:underline'
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
                className='text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-slate-200 hover:border-blue-300'
                aria-label='Follow us on Twitter'
              >
                <Twitter className='h-5 w-5' />
              </a>
              <a
                href='https://linkedin.com/company/yuthub'
                className='text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-slate-200 hover:border-blue-300'
                aria-label='Follow us on LinkedIn'
              >
                <Linkedin className='h-5 w-5' />
              </a>
              <a
                href='https://github.com/yuthub'
                className='text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 touch-target min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-slate-200 hover:border-blue-300'
                aria-label='View our GitHub'
              >
                <Github className='h-5 w-5' />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-slate-200 mt-2 pt-2'>
          <div className='flex flex-col min-[320px]:flex-row justify-between items-start min-[320px]:items-center space-y-1 min-[320px]:space-y-0'>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600'>
              <span>© {currentYear} YUTHUB</span>
              <span className='hidden min-[375px]:inline'>
                VAT: GB123456789
              </span>
              <span className='hidden min-[375px]:inline'>Co: 12345678</span>
            </div>

            <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600'>
              <a
                href='/system-status'
                className='hover:text-blue-600 transition-colors flex items-center space-x-1 hover:underline'
              >
                <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                <span>System OK</span>
              </a>
              <a
                href='/accessibility'
                className='hidden min-[375px]:inline hover:text-blue-600 transition-colors hover:underline'
                aria-label='Accessibility Statement'
              >
                Accessibility
              </a>
              <a
                href='mailto:dpo@yuthub.com'
                className='hover:text-blue-600 transition-colors hover:underline'
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
