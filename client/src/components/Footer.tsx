import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 inline-block hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-md bg-white text-black font-semibold flex items-center justify-center text-sm">
                Y
              </div>
              <span className="text-base font-600 tracking-tight">YUTHUB</span>
            </Link>
            <p className="text-sm font-400 text-gray-500 leading-relaxed">
              Comprehensive platform for youth housing organizations.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-700 uppercase tracking-wider text-white mb-6">Product</h3>
            <div className="space-y-3.5">
              <Link to="/platform" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                Features
              </Link>
              <Link to="/pricing" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                Pricing
              </Link>
              <a href="#" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                Security
              </a>
              <a href="#" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                Status
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xs font-700 uppercase tracking-wider text-white mb-6">Company</h3>
            <div className="space-y-3.5">
              <a href="#" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                About
              </a>
              <a href="#" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                Blog
              </a>
              <a href="#" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                Careers
              </a>
              <a href="#" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs font-700 uppercase tracking-wider text-white mb-6">Legal</h3>
            <div className="space-y-3.5">
              <a href="#" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                Cookie Policy
              </a>
              <a href="#" className="text-sm font-400 text-gray-400 hover:text-white transition-colors duration-200">
                GDPR
              </a>
            </div>
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
              href="#"
              className="text-gray-500 hover:text-white transition-colors duration-200"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.29 20v-7.21H5.73V9.25h2.56V7.69c0-2.54 1.55-3.93 3.83-3.93 1.09 0 2.02.08 2.29.12v2.65h-1.57c-1.23 0-1.47.58-1.47 1.43v1.87h2.93l-.38 3.54h-2.55V20" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-white transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18.5 2h-17C.7 2 0 2.7 0 3.5v13C0 17.3.7 18 1.5 18h17c.8 0 1.5-.7 1.5-1.5v-13c0-.8-.7-1.5-1.5-1.5zM6 15H3V7h3v8zm-1.5-9c-1 0-1.8-.8-1.8-1.8 0-1 .8-1.8 1.8-1.8 1 0 1.8.8 1.8 1.8 0 1-.8 1.8-1.8 1.8zm12 9h-3v-4c0-1-.3-2-1.2-2-.7 0-1.1.5-1.3 1-.1.1-.1.3-.1.5v4.5h-3V7h3v1.1c.3-.5 1-1.2 2.5-1.2 1.8 0 3.2 1.2 3.2 3.8v5.3z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-white transition-colors duration-200"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0C4.5 0 0 4.5 0 10c0 4.4 2.9 8.2 6.8 9.5.5 0 .7-.2.7-.5v-1.7c-2.7.6-3.3-1.3-3.3-1.3-.5-1.2-1.2-1.5-1.2-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.5 1.1 3.1.9 0-.6.3-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1 .8-.2 1.6-.3 2.5-.3s1.7.1 2.5.3c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5 3.9-1.3 6.8-5.1 6.8-9.5C20 4.5 15.5 0 10 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
