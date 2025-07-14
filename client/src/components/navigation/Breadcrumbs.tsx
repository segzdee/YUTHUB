import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

export function Breadcrumbs({
  items,
  className,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4" />,
}: BreadcrumbsProps) {
  const [location] = useLocation();
  const { t, direction } = useLanguage();
  
  // Auto-generate breadcrumbs from current location if not provided
  const breadcrumbItems = items || generateBreadcrumbs(location, t);
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('flex items-center space-x-2', className)}
      dir={direction}
    >
      <ol className="flex items-center space-x-2">
        {showHome && (
          <li>
            <a
              href="/"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t('home')}
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">{t('home')}</span>
            </a>
          </li>
        )}
        
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {(index > 0 || showHome) && (
              <span className="mx-2 text-muted-foreground" aria-hidden="true">
                {separator}
              </span>
            )}
            
            {item.current ? (
              <span 
                className="flex items-center text-sm font-medium text-foreground"
                aria-current="page"
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            ) : (
              <a
                href={item.href || '#'}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(location: string, t: (key: string) => string): BreadcrumbItem[] {
  const segments = location.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];
  
  // Route mapping for better labels
  const routeLabels: Record<string, string> = {
    dashboard: t('dashboard'),
    properties: t('properties'),
    residents: t('residents'),
    support: t('support'),
    incidents: t('incidents'),
    reports: t('reports'),
    settings: t('settings'),
    housing: 'Housing',
    safeguarding: 'Safeguarding',
    independence: 'Independence',
    analytics: 'Analytics',
    billing: 'Billing',
    financials: 'Financials',
    forms: 'Forms',
    crisis: 'Crisis Connect',
    help: 'Help & Support',
  };
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    items.push({
      label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : currentPath,
      current: isLast,
    });
  });
  
  return items;
}

// Breadcrumb item component for custom usage
interface BreadcrumbItemProps {
  children: React.ReactNode;
  href?: string;
  current?: boolean;
  className?: string;
}

export function BreadcrumbItem({ 
  children, 
  href, 
  current, 
  className 
}: BreadcrumbItemProps) {
  if (current) {
    return (
      <span 
        className={cn(
          'text-sm font-medium text-foreground',
          className
        )}
        aria-current="page"
      >
        {children}
      </span>
    );
  }
  
  return (
    <a
      href={href || '#'}
      className={cn(
        'text-sm text-muted-foreground hover:text-foreground transition-colors',
        className
      )}
    >
      {children}
    </a>
  );
}

// Breadcrumb separator component
export function BreadcrumbSeparator({ 
  children = <ChevronRight className="h-4 w-4" />,
  className 
}: { 
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('text-muted-foreground', className)} aria-hidden="true">
      {children}
    </span>
  );
}