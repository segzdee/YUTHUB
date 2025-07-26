import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, HelpCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUserJourney } from './UserJourneyProvider';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  learnMoreUrl?: string;
  triggerSelector: string;
  conditions?: {
    userRole?: string[];
    firstTimeOnly?: boolean;
    maxShowCount?: number;
  };
}

interface ContextualHelpProps {
  tips: HelpTip[];
}

export default function ContextualHelp({ tips }: ContextualHelpProps) {
  const { state, actions } = useUserJourney();
  const [activeTip, setActiveTip] = useState<HelpTip | null>(null);
  const [tipPosition, setTipPosition] = useState({ top: 0, left: 0 });
  const [shownTips, setShownTips] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!state.contextualHelp) return;

    const handleMouseEnter = (tip: HelpTip) => (event: Event) => {
      const target = event.target as HTMLElement;
      if (shouldShowTip(tip)) {
        const rect = target.getBoundingClientRect();
        setTipPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX
        });
        setActiveTip(tip);
        markTipAsShown(tip.id);
      }
    };

    const handleMouseLeave = () => {
      setTimeout(() => setActiveTip(null), 300);
    };

    // Attach event listeners
    const listeners: Array<{ element: Element; tip: HelpTip; enterHandler: any; leaveHandler: any }> = [];
    
    tips.forEach(tip => {
      const elements = document.querySelectorAll(tip.triggerSelector);
      elements.forEach(element => {
        const enterHandler = handleMouseEnter(tip);
        element.addEventListener('mouseenter', enterHandler);
        element.addEventListener('mouseleave', handleMouseLeave);
        
        listeners.push({ element, tip, enterHandler, leaveHandler: handleMouseLeave });
      });
    });

    return () => {
      listeners.forEach(({ element, enterHandler, leaveHandler }) => {
        element.removeEventListener('mouseenter', enterHandler);
        element.removeEventListener('mouseleave', leaveHandler);
      });
    };
  }, [tips, state.contextualHelp, shownTips]);

  const shouldShowTip = (tip: HelpTip): boolean => {
    if (!tip.conditions) return true;

    // Check user role
    if (tip.conditions.userRole && state.userPersona) {
      if (!tip.conditions.userRole.includes(state.userPersona.type)) {
        return false;
      }
    }

    // Check first time only
    if (tip.conditions.firstTimeOnly && shownTips.has(tip.id)) {
      return false;
    }

    // Check max show count
    if (tip.conditions.maxShowCount) {
      const showCount = Array.from(shownTips).filter(id => id === tip.id).length;
      if (showCount >= tip.conditions.maxShowCount) {
        return false;
      }
    }

    return true;
  };

  const markTipAsShown = (tipId: string) => {
    setShownTips(prev => new Set([...prev, tipId]));
    actions.trackFeatureUsage(`contextual_help_${tipId}`);
  };

  const handleLearnMore = () => {
    if (activeTip?.learnMoreUrl) {
      window.open(activeTip.learnMoreUrl, '_blank');
      actions.trackFeatureUsage(`help_learn_more_${activeTip.id}`);
    }
  };

  const handleRequestHelp = () => {
    if (activeTip) {
      actions.requestHelp(activeTip.id);
    }
  };

  if (!activeTip) return null;

  return (
    <div 
      className="fixed z-[1000] max-w-sm"
      style={{ top: tipPosition.top, left: tipPosition.left }}
    >
      <Card className="shadow-lg border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-500" />
              <h4 className="font-medium text-blue-900">{activeTip.title}</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveTip(null)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <p className="text-sm text-blue-800 mb-3">{activeTip.content}</p>
          
          <div className="flex gap-2">
            {activeTip.learnMoreUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLearnMore}
                className="text-xs"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Learn More
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRequestHelp}
              className="text-xs"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Get Help
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Default help tips for common UI elements
export const defaultHelpTips: HelpTip[] = [
  {
    id: 'dashboard_metrics',
    title: 'Dashboard Metrics',
    content: 'These cards show your key performance indicators. Click any card for detailed analytics.',
    triggerSelector: '[data-help="dashboard-metrics"]',
    conditions: { firstTimeOnly: true }
  },
  {
    id: 'quick_actions',
    title: 'Quick Actions',
    content: 'Access frequently used features quickly from this panel.',
    triggerSelector: '[data-help="quick-actions"]',
    conditions: { firstTimeOnly: true }
  },
  {
    id: 'add_resident',
    title: 'Add Resident',
    content: 'Click here to register a new resident. You\'ll be guided through the intake process.',
    triggerSelector: '[data-help="add-resident"]',
    learnMoreUrl: '/help/residents/adding',
    conditions: { 
      userRole: ['housing_officer', 'support_coordinator', 'admin'],
      maxShowCount: 3 
    }
  },
  {
    id: 'property_status',
    title: 'Property Status',
    content: 'The status indicator shows the current operational state of this property.',
    triggerSelector: '[data-help="property-status"]',
    conditions: { userRole: ['housing_officer', 'admin'] }
  },
  {
    id: 'incident_reporting',
    title: 'Report Incident',
    content: 'Use this to report safety incidents or concerns that require attention.',
    triggerSelector: '[data-help="incident-report"]',
    learnMoreUrl: '/help/safeguarding/incidents',
    conditions: { userRole: ['support_coordinator', 'admin'] }
  }
];
