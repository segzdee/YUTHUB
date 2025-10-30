import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Building,
  Users,
  TrendingUp,
  BarChart3,
  Shield,
  AlertTriangle,
  DollarSign,
  Settings,
  HelpCircle,
  Receipt,
  FileText,
  ClipboardList,
  MapPin,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Housing Management', href: '/housing', icon: Building },
  { name: 'Support Services', href: '/support', icon: Users },
  { name: 'Independence Pathway', href: '/independence', icon: TrendingUp },
  { name: 'Analytics & Outcomes', href: '/analytics', icon: BarChart3 },
  { name: 'Safeguarding', href: '/safeguarding', icon: Shield },
  { name: 'Crisis Connect', href: '/crisis', icon: AlertTriangle },
  { name: 'Financials', href: '/financials', icon: DollarSign },
  { name: 'Government Billing', href: '/billing', icon: Receipt },
  { name: 'UK Councils', href: '/uk-councils', icon: MapPin },
  { name: 'Forms', href: '/forms', icon: ClipboardList },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden'
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-transform duration-300 ease-in-out',
          'w-64 lg:w-64 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile-friendly header with larger touch target */}
        <div className='flex items-center justify-center touch-target-lg border-b border-gray-200'>
          <h1 className='text-lg md:text-xl font-bold text-primary'>YUTHUB</h1>
        </div>

        {/* Navigation with mobile-first responsive design */}
        <nav className='mt-4 md:mt-6 pb-4 overflow-y-auto h-[calc(100vh-4rem)]'>
          <div className='px-3 md:px-4 space-y-1'>
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors touch-target',
                    'min-h-[44px] w-full',
                    isActive
                      ? 'bg-primary-50 text-primary border-r-2 border-primary'
                      : 'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100'
                  )}
                  onClick={onClose}
                >
                  <Icon className='mr-3 h-5 w-5 flex-shrink-0' />
                  <span className='truncate text-sm md:text-base'>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Secondary navigation with mobile-first spacing */}
          <div className='mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200'>
            <div className='px-3 md:px-4 space-y-1'>
              {secondaryNavigation.map(item => {
                const Icon = item.icon;
                const isActive = location === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors touch-target',
                      'min-h-[44px] w-full',
                      isActive
                        ? 'bg-primary-50 text-primary border-r-2 border-primary'
                        : 'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100'
                    )}
                    onClick={onClose}
                  >
                    <Icon className='mr-3 h-5 w-5 flex-shrink-0' />
                    <span className='truncate text-sm md:text-base'>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
