import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';

interface NavbarProps {
  variant?: 'light' | 'dark';
  transparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ variant = 'light', transparent = false }) => {
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${transparent ? 'bg-transparent' : variant === 'dark' ? 'bg-black' : 'bg-white'}
        border-b ${transparent ? 'border-transparent' : 'border-gray-200'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div
              className={`
                w-7 h-7 rounded-md font-semibold flex items-center justify-center text-sm
                ${variant === 'dark' || transparent ? 'bg-white text-black' : 'bg-black text-white'}
              `}
            >
              Y
            </div>
            <span
              className={`
                text-lg font-600 hidden sm:inline tracking-tight
                ${variant === 'dark' || transparent ? 'text-white' : 'text-black'}
              `}
            >
              YUTHUB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`
                text-sm font-500 transition-colors pb-1 border-b-2 border-transparent hover:border-gray-300
                ${isActive('/') 
                  ? (variant === 'dark' || transparent ? 'text-white border-white' : 'text-black border-black')
                  : (variant === 'dark' || transparent ? 'text-gray-200' : 'text-gray-700')
                }
              `}
            >
              Home
            </Link>
            <Link
              to="/platform"
              className={`
                text-sm font-500 transition-colors pb-1 border-b-2 border-transparent hover:border-gray-300
                ${isActive('/platform')
                  ? (variant === 'dark' || transparent ? 'text-white border-white' : 'text-black border-black')
                  : (variant === 'dark' || transparent ? 'text-gray-200' : 'text-gray-700')
                }
              `}
            >
              Platform
            </Link>
            <Link
              to="/pricing"
              className={`
                text-sm font-500 transition-colors pb-1 border-b-2 border-transparent hover:border-gray-300
                ${isActive('/pricing')
                  ? (variant === 'dark' || transparent ? 'text-white border-white' : 'text-black border-black')
                  : (variant === 'dark' || transparent ? 'text-gray-200' : 'text-gray-700')
                }
              `}
            >
              Pricing
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button
                    variant={variant === 'dark' || transparent ? 'secondary' : 'tertiary'}
                    size="sm"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant={variant === 'dark' || transparent ? 'primary' : 'primary'}
                    size="sm"
                  >
                    Sign up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <span
                  className={`
                    text-sm font-500
                    ${variant === 'dark' || transparent ? 'text-gray-300' : 'text-gray-600'}
                  `}
                >
                  {user?.email}
                </span>
                <Link to="/app/dashboard">
                  <Button variant="primary" size="sm">
                    Dashboard
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <svg
              className={`w-6 h-6 ${variant === 'dark' || transparent ? 'text-white' : 'text-black'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className={`
              md:hidden py-4 border-t
              ${variant === 'dark' || transparent ? 'border-gray-700' : 'border-gray-200'}
            `}
          >
            <div className="flex flex-col gap-4">
              <Link to="/" className={`text-sm font-500 ${variant === 'dark' || transparent ? 'text-gray-300' : 'text-gray-600'}`}>
                Home
              </Link>
              <Link to="/platform" className={`text-sm font-500 ${variant === 'dark' || transparent ? 'text-gray-300' : 'text-gray-600'}`}>
                Platform
              </Link>
              <Link to="/pricing" className={`text-sm font-500 ${variant === 'dark' || transparent ? 'text-gray-300' : 'text-gray-600'}`}>
                Pricing
              </Link>
              {!isAuthenticated ? (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Link to="/login" className="flex-1">
                    <Button variant="tertiary" size="sm" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/signup" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      Sign up
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/app/dashboard" className="pt-4 border-t border-gray-200">
                  <Button variant="primary" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
