import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Building,
  Users,
  Shield,
  TrendingUp,
  MessageSquare,
  Phone,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Housing Management', href: '/housing', icon: Building },
  { name: 'Support Services', href: '/support', icon: Users },
  { name: 'Independence Pathway', href: '/independence', icon: TrendingUp },
  { name: 'Analytics & Outcomes', href: '/analytics', icon: BarChart3 },
  { name: 'Safeguarding', href: '/safeguarding', icon: Shield },
  { name: 'Crisis Connect', href: '/crisis', icon: Phone },
  { name: 'Financials', href: '/financials', icon: DollarSign },
  { name: 'Government Billing', href: '/billing', icon: FileText },
  { name: 'Forms', href: '/forms', icon: MessageSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <div className='hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col'>
      <div className='flex min-h-0 flex-1 flex-col bg-blue-800'>
        <div className='flex h-16 flex-shrink-0 items-center px-4'>
          <img className='h-8 w-auto' src='/logo.svg' alt='YUTHUB' />
          <span className='ml-2 text-white text-xl font-bold'>YUTHUB</span>
        </div>
        <div className='flex flex-1 flex-col overflow-y-auto'>
          <nav className='flex-1 space-y-1 px-2 py-4'>
            {navigation.map(item => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? 'bg-blue-900 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`
                }
              >
                <item.icon
                  className='mr-3 h-5 w-5 flex-shrink-0'
                  aria-hidden='true'
                />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Emergency Contact */}
          <div className='flex-shrink-0 bg-blue-900 p-4'>
            <div className='text-blue-100 text-xs'>
              <p className='font-medium'>24/7 Crisis Line</p>
              <p className='text-blue-200'>0800 123 4567</p>
              <p className='mt-2 font-medium'>Technical Support</p>
              <p className='text-blue-200'>+44 161 123 4568</p>
            </div>
          </div>

          {/* User info */}
          <div className='flex-shrink-0 bg-blue-700 p-4'>
            <div className='flex items-center'>
              <div className='h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center'>
                <span className='text-white text-sm font-medium'>
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-white'>{user?.name}</p>
                <p className='text-xs text-blue-200'>{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
