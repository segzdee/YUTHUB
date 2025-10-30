import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  navbar?: {
    variant?: 'light' | 'dark';
    transparent?: boolean;
  };
  footer?: boolean;
  className?: string;
}

/**
 * PageLayout - Reusable layout wrapper enforcing consistent navbar/footer across all pages
 * Adheres to Steve Jobs design principles: minimal, balanced, intentional
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  navbar = { variant: 'light', transparent: false },
  footer = true,
  className = '',
}) => {
  return (
    <div className={`min-h-screen bg-white flex flex-col ${className}`}>
      {/* Navigation Bar */}
      <Navbar
        variant={navbar.variant || 'light'}
        transparent={navbar.transparent || false}
      />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {footer && <Footer />}
    </div>
  );
};

/**
 * PublicPageLayout - For public-facing pages (Landing, Pricing, etc)
 * Shows transparent navbar and footer
 */
export const PublicPageLayout: React.FC<Omit<PageLayoutProps, 'navbar'>> = ({
  children,
  footer = true,
  className = '',
}) => {
  return (
    <PageLayout
      navbar={{ variant: 'light', transparent: true }}
      footer={footer}
      className={className}
    >
      {children}
    </PageLayout>
  );
};

/**
 * AppPageLayout - For authenticated app pages (Dashboard, Housing, etc)
 * Shows solid navbar and footer
 */
export const AppPageLayout: React.FC<Omit<PageLayoutProps, 'navbar'>> = ({
  children,
  footer = true,
  className = '',
}) => {
  return (
    <PageLayout
      navbar={{ variant: 'light', transparent: false }}
      footer={footer}
      className={className}
    >
      {children}
    </PageLayout>
  );
};

/**
 * AuthPageLayout - For login/signup pages
 * Minimal navbar, optional footer
 */
export const AuthPageLayout: React.FC<Omit<PageLayoutProps, 'navbar'>> = ({
  children,
  footer = false,
  className = '',
}) => {
  return (
    <PageLayout
      navbar={{ variant: 'light', transparent: true }}
      footer={footer}
      className={className}
    >
      {children}
    </PageLayout>
  );
};
