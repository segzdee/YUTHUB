import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'wouter';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ label: 'Home', href: '/' }, ...items];

  return (
    <nav
      aria-label='Breadcrumb'
      className='flex items-center space-x-1 text-sm text-gray-600 mb-4'
    >
      {allItems.map((item, index) => (
        <div key={index} className='flex items-center'>
          {index > 0 && <ChevronRight className='h-4 w-4 mx-1' />}

          {index === 0 && <Home className='h-4 w-4 mr-1' />}

          {item.href && index < allItems.length - 1 ? (
            <Link
              href={item.href}
              className='hover:text-primary transition-colors'
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={
                index === allItems.length - 1 ? 'text-gray-900 font-medium' : ''
              }
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
