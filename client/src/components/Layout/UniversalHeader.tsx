import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function UniversalHeader() {
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleSignUp = () => {
    window.location.href = '/signup';
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '/pricing' },
    ...(isAuthenticated ? [
      { name: 'Dashboard', href: '/dashboard' },
    ] : []),
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="https://www.yuthub.com" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-slate">YUTHUB</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-medium-contrast hover:text-primary px-3 py-2 text-sm font-medium transition-colors interactive-element focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-current={window.location.pathname === item.href ? 'page' : undefined}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Welcome, {user?.email}
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleSignUp}
                  size="sm"
                  className="bg-primary hover:bg-blue-700"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="interactive-element"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4" id="mobile-menu">
            <nav className="flex flex-col space-y-2" role="navigation" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-medium-contrast hover:text-primary px-3 py-2 text-sm font-medium transition-colors interactive-element focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={window.location.pathname === item.href ? 'page' : undefined}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="text-sm text-medium-contrast px-3" role="status" aria-live="polite">
                      Welcome, {user?.email}
                    </div>
                    <Button 
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full interactive-element"
                      aria-label="Sign out of your account"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      onClick={handleLogin}
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-white interactive-element"
                      aria-label="Sign in to your account"
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={handleSignUp}
                      size="sm"
                      className="w-full bg-primary hover:bg-blue-700 interactive-element"
                      aria-label="Sign up for account"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}