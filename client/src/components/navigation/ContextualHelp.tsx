import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  Info,
  Lightbulb,
  BookOpen,
  Video,
  ExternalLink,
  X,
} from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'info' | 'warning' | 'tutorial';
  content: React.ReactNode;
  videoUrl?: string;
  articleUrl?: string;
  keywords?: string[];
}

interface ContextualHelpProps {
  context: string;
  items?: HelpItem[];
  className?: string;
  trigger?: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

// Help content database
const helpContent: Record<string, HelpItem[]> = {
  dashboard: [
    {
      id: 'dashboard-overview',
      title: 'Dashboard Overview',
      description: 'Understanding your dashboard metrics and widgets',
      type: 'info',
      content: (
        <div className='space-y-3'>
          <p>Your dashboard provides a real-time overview of key metrics:</p>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            <li>
              <strong>Total Properties:</strong> All properties in your system
            </li>
            <li>
              <strong>Current Residents:</strong> Active residents across all
              properties
            </li>
            <li>
              <strong>Occupancy Rate:</strong> Percentage of occupied rooms
            </li>
            <li>
              <strong>Active Incidents:</strong> Unresolved incidents requiring
              attention
            </li>
          </ul>
        </div>
      ),
      keywords: ['dashboard', 'metrics', 'overview'],
    },
    {
      id: 'dashboard-widgets',
      title: 'Customizing Widgets',
      description: 'How to personalize your dashboard view',
      type: 'tip',
      content: (
        <div className='space-y-3'>
          <p>You can customize your dashboard by:</p>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            <li>Rearranging widgets by dragging and dropping</li>
            <li>Hiding/showing widgets based on your role</li>
            <li>Setting refresh intervals for real-time data</li>
            <li>Filtering data by date ranges or properties</li>
          </ul>
        </div>
      ),
      keywords: ['widgets', 'customize', 'dashboard'],
    },
  ],
  properties: [
    {
      id: 'add-property',
      title: 'Adding a New Property',
      description: 'Step-by-step guide to add properties to your system',
      type: 'tutorial',
      content: (
        <div className='space-y-3'>
          <p>To add a new property:</p>
          <ol className='list-decimal list-inside space-y-1 text-sm'>
            <li>Click the "Add Property" button</li>
            <li>Fill in the property details (name, address, capacity)</li>
            <li>Set the property type and accessibility features</li>
            <li>Add room configurations if applicable</li>
            <li>Review and save the property</li>
          </ol>
        </div>
      ),
      videoUrl: '/help/videos/add-property.mp4',
      keywords: ['property', 'add', 'new'],
    },
    {
      id: 'property-capacity',
      title: 'Managing Property Capacity',
      description: 'Understanding capacity limits and occupancy tracking',
      type: 'info',
      content: (
        <div className='space-y-3'>
          <p>Property capacity is automatically tracked:</p>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            <li>Maximum capacity is set when creating the property</li>
            <li>Current occupancy updates when residents move in/out</li>
            <li>Availability is calculated automatically</li>
            <li>Overbooking alerts are shown when capacity is exceeded</li>
          </ul>
        </div>
      ),
      keywords: ['capacity', 'occupancy', 'availability'],
    },
  ],
  residents: [
    {
      id: 'resident-onboarding',
      title: 'Resident Onboarding Process',
      description: 'Complete guide to onboarding new residents',
      type: 'tutorial',
      content: (
        <div className='space-y-3'>
          <p>The onboarding process includes:</p>
          <ol className='list-decimal list-inside space-y-1 text-sm'>
            <li>Initial assessment and needs evaluation</li>
            <li>Property assignment based on availability</li>
            <li>Support plan creation</li>
            <li>Documentation and legal requirements</li>
            <li>Welcome and orientation</li>
          </ol>
        </div>
      ),
      videoUrl: '/help/videos/resident-onboarding.mp4',
      keywords: ['onboarding', 'new resident', 'assessment'],
    },
    {
      id: 'support-plans',
      title: 'Creating Support Plans',
      description: 'How to develop effective support plans for residents',
      type: 'info',
      content: (
        <div className='space-y-3'>
          <p>Support plans should include:</p>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            <li>Clear, measurable goals</li>
            <li>Specific support interventions</li>
            <li>Timeline and milestones</li>
            <li>Review dates and progress tracking</li>
            <li>Emergency contacts and procedures</li>
          </ul>
        </div>
      ),
      keywords: ['support plan', 'goals', 'interventions'],
    },
  ],
  incidents: [
    {
      id: 'incident-reporting',
      title: 'Reporting Incidents',
      description: 'How to properly document and report incidents',
      type: 'warning',
      content: (
        <div className='space-y-3'>
          <p className='text-amber-600'>
            Important: Report all incidents immediately
          </p>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            <li>Use the incident form within 24 hours</li>
            <li>Include all relevant details and witnesses</li>
            <li>Categorize the incident type correctly</li>
            <li>Follow up with required notifications</li>
            <li>Document any immediate actions taken</li>
          </ul>
        </div>
      ),
      keywords: ['incident', 'report', 'emergency'],
    },
  ],
  forms: [
    {
      id: 'form-validation',
      title: 'Form Validation and Errors',
      description: 'Understanding form validation and fixing errors',
      type: 'tip',
      content: (
        <div className='space-y-3'>
          <p>When forms show errors:</p>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            <li>Red borders indicate required fields</li>
            <li>Error messages appear below problematic fields</li>
            <li>Forms can be saved as drafts for later completion</li>
            <li>Some fields auto-validate as you type</li>
          </ul>
        </div>
      ),
      keywords: ['form', 'validation', 'errors', 'required'],
    },
  ],
};

export function ContextualHelp({
  context,
  items,
  className,
  trigger,
  side = 'bottom',
}: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const helpItems = items || helpContent[context] || [];

  if (helpItems.length === 0) return null;

  const defaultTrigger = (
    <Button
      variant='ghost'
      size='sm'
      className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
      aria-label='Help'
    >
      <HelpCircle className='h-4 w-4' />
    </Button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{trigger || defaultTrigger}</PopoverTrigger>
      <PopoverContent
        side={side}
        className={cn('w-96 p-0', className)}
        sideOffset={5}
      >
        <Card className='border-0 shadow-none'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base flex items-center'>
                <BookOpen className='h-4 w-4 mr-2' />
                Help & Tips
              </CardTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsOpen(false)}
                className='h-6 w-6 p-0'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='space-y-4 max-h-96 overflow-y-auto'>
              {helpItems.map(item => (
                <HelpItemCard key={item.id} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

function HelpItemCard({ item }: { item: HelpItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeIcons = {
    tip: <Lightbulb className='h-4 w-4' />,
    info: <Info className='h-4 w-4' />,
    warning: <HelpCircle className='h-4 w-4' />,
    tutorial: <Video className='h-4 w-4' />,
  };

  const typeColors = {
    tip: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    info: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    warning:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    tutorial:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  };

  return (
    <div className='border rounded-lg p-3 space-y-2'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center space-x-2 mb-1'>
            <Badge variant='outline' className={typeColors[item.type]}>
              {typeIcons[item.type]}
              <span className='ml-1 capitalize'>{item.type}</span>
            </Badge>
          </div>
          <h4 className='font-medium text-sm'>{item.title}</h4>
          <p className='text-xs text-muted-foreground'>{item.description}</p>
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setIsExpanded(!isExpanded)}
          className='h-6 w-6 p-0 ml-2'
        >
          {isExpanded ? (
            <X className='h-3 w-3' />
          ) : (
            <Info className='h-3 w-3' />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className='pt-2 border-t'>
          <div className='text-sm'>{item.content}</div>

          {(item.videoUrl || item.articleUrl) && (
            <div className='flex space-x-2 mt-3'>
              {item.videoUrl && (
                <Button size='sm' variant='outline' className='text-xs'>
                  <Video className='h-3 w-3 mr-1' />
                  Watch Video
                </Button>
              )}
              {item.articleUrl && (
                <Button size='sm' variant='outline' className='text-xs'>
                  <ExternalLink className='h-3 w-3 mr-1' />
                  Read More
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Tooltip component for quick help
interface HelpTooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTooltip({
  content,
  children,
  side = 'top',
}: HelpTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side={side} className='w-64 p-3 text-sm'>
        {content}
      </PopoverContent>
    </Popover>
  );
}

// Help search component
interface HelpSearchProps {
  context?: string;
  onSelect?: (item: HelpItem) => void;
}

export function HelpSearch({ context, onSelect }: HelpSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HelpItem[]>([]);

  const allItems = context
    ? helpContent[context] || []
    : Object.values(helpContent).flat();

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = allItems.filter(
      item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords?.some(keyword =>
          keyword.toLowerCase().includes(query.toLowerCase())
        )
    );

    setResults(filtered);
  }, [query, allItems]);

  return (
    <div className='space-y-2'>
      <input
        type='text'
        placeholder='Search help topics...'
        value={query}
        onChange={e => setQuery(e.target.value)}
        className='w-full px-3 py-2 border rounded-md text-sm'
      />

      {results.length > 0 && (
        <div className='max-h-64 overflow-y-auto space-y-2'>
          {results.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect?.(item)}
              className='w-full p-2 text-left border rounded-md hover:bg-muted transition-colors'
            >
              <div className='font-medium text-sm'>{item.title}</div>
              <div className='text-xs text-muted-foreground'>
                {item.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
