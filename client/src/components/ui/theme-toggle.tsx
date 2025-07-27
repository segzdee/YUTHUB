import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAccessibility } from '@/components/providers/AccessibilityProvider';

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();
  const { t } = useLanguage();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentTheme = themeOptions.find(option => option.value === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 px-0'
          aria-label={`Current theme: ${currentTheme?.label}. Click to change theme.`}
        >
          <CurrentIcon className='h-4 w-4' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {themeOptions.map(option => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() =>
                setTheme(option.value as 'light' | 'dark' | 'system')
              }
              className='cursor-pointer'
            >
              <Icon className='h-4 w-4 mr-2' />
              {option.label}
              {theme === option.value && (
                <span className='ml-auto text-xs text-muted-foreground'>
                  {option.value === 'system' ? `(${actualTheme})` : ''}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AccessibilityToggle() {
  const { preferences, updatePreference } = useAccessibility();
  const { t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 px-0'
          aria-label='Accessibility options'
        >
          <Monitor className='h-4 w-4' />
          <span className='sr-only'>Accessibility settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuItem
          onClick={() =>
            updatePreference('reducedMotion', !preferences.reducedMotion)
          }
          className='cursor-pointer'
        >
          <input
            type='checkbox'
            checked={preferences.reducedMotion}
            onChange={() => {}}
            className='mr-2'
            aria-hidden='true'
          />
          Reduce Motion
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            updatePreference('highContrast', !preferences.highContrast)
          }
          className='cursor-pointer'
        >
          <input
            type='checkbox'
            checked={preferences.highContrast}
            onChange={() => {}}
            className='mr-2'
            aria-hidden='true'
          />
          High Contrast
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => updatePreference('largeText', !preferences.largeText)}
          className='cursor-pointer'
        >
          <input
            type='checkbox'
            checked={preferences.largeText}
            onChange={() => {}}
            className='mr-2'
            aria-hidden='true'
          />
          Large Text
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            updatePreference('focusVisible', !preferences.focusVisible)
          }
          className='cursor-pointer'
        >
          <input
            type='checkbox'
            checked={preferences.focusVisible}
            onChange={() => {}}
            className='mr-2'
            aria-hidden='true'
          />
          Enhanced Focus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 px-2'
          aria-label={`Current language: ${currentLanguage?.name}. Click to change language.`}
        >
          <span className='mr-1'>{currentLanguage?.flag}</span>
          <span className='hidden sm:inline'>{currentLanguage?.name}</span>
          <span className='sr-only'>Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className='cursor-pointer'
          >
            <span className='mr-2'>{lang.flag}</span>
            {lang.name}
            {language === lang.code && (
              <span className='ml-auto text-xs text-muted-foreground'>✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
