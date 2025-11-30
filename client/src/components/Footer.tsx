import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './design-system/BrandLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <BrandLogo
                size="sm"
                variant="dark"
                showText={true}
                showSlogan={false}
              />
            </Link>
            <p className="text-sm font-400 text-gray-400 leading-relaxed max-w-xs">
              Comprehensive platform for youth housing organizations to manage properties, residents, and support services.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-700 uppercase tracking-wider text-white mb-6">Product</h3>
            <ul className="space-y-3.5">
              <li>
                <Link to="/platform" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/status" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xs font-700 uppercase tracking-wider text-white mb-6">Company</h3>
            <ul className="space-y-3.5">
              <li>
                <Link to="/about" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs font-700 uppercase tracking-wider text-white mb-6">Legal</h3>
            <ul className="space-y-3.5">
              <li>
                <Link to="/privacy" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/gdpr" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200 block">
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 py-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
          <p className="text-xs font-400 text-gray-500">
            © {currentYear} YUTHUB. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-5">
            <a
              href="https://twitter.com/yuthub"
              className="text-gray-500 hover:text-white transition-colors duration-200"
              aria-label="Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.29 20v-7.21H5.73V9.25h2.56V7.69c0-2.54 1.55-3.93 3.83-3.93 1.09 0 2.02.08 2.29.12v2.65h-1.57c-1.23 0-1.47.58-1.47 1.43v1.87h2.93l-.38 3.54h-2.55V20" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/yuthub"
              className="text-gray-500 hover:text-white transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18.5 2h-17C.7 2 0 2.7 0 3.5v13C0 17.3.7 18 1.5 18h17c.8 0 1.5-.7 1.5-1.5v-13c0-.8-.7-1.5-1.5-1.5zM6 15H3V7h3v8zm-1.5-9c-1 0-1.8-.8-1.8-1.8 0-1 .8-1.8 1.8-1.8 1 0 1.8.8 1.8 1.8 0 1-.8 1.8-1.8 1.8zm12 9h-3v-4c0-1-.3-2-1.2-2-.7 0-1.1.5-1.3 1-.1.1-.1.3-.1.5v4.5h-3V7h3v1.1c.3-.5 1-1.2 2.5-1.2 1.8 0 3.2 1.2 3.2 3.8v5.3z" />
              </svg>
            </a>
            <a
              href="https://github.com/yuthub"
              className="text-gray-500 hover:text-white transition-colors duration-200"
              aria-label="GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0C4.5 0 0 4.5 0 10c0 4.4 2.9 8.2 6.8 9.5.5 0 .7-.2.7-.5v-1.7c-2.7.6-3.3-1.3-3.3-1.3-.5-1.2-1.2-1.5-1.2-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.5 1.1 3.1.9 0-.6.3-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1 .8-.2 1.6-.3 2.5-.3s1.7.1 2.5.3c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5 3.9-1.3 6.8-5.1 6.8-9.5C20 4.5 15.5 0 10 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
