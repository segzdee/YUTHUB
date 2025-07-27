import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, HelpCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUserJourney } from './UserJourneyProvider';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface GuidedTourProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function GuidedTour({
  tourId,
  steps,
  onComplete,
  onSkip,
}: GuidedTourProps) {
  const { state, actions } = useUserJourney();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(state.showTour);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0 });

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (isVisible && currentStep) {
      updateTooltipPosition();
    }
  }, [currentStepIndex, isVisible]);

  const updateTooltipPosition = () => {
    const targetElement = document.querySelector(
      `[data-tour-target="${currentStep.target}"]`
    );
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });

      // Highlight the target element
      targetElement.classList.add('tour-highlight');

      // Scroll to element if needed
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (currentStep.action) {
      currentStep.action();
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    actions.trackFeatureUsage(`tour_completed_${tourId}`);
    onComplete?.();

    // Remove highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
  };

  const handleSkip = () => {
    setIsVisible(false);
    actions.trackFeatureUsage(`tour_skipped_${tourId}`);
    onSkip?.();

    // Remove highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
  };

  if (!isVisible || !currentStep) return null;

  const getTooltipStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 1000,
      maxWidth: '300px',
    };

    switch (currentStep.position) {
      case 'top':
        return {
          ...baseStyle,
          top: targetPosition.top - 10,
          left: targetPosition.left,
          transform: 'translateY(-100%)',
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: targetPosition.top + 40,
          left: targetPosition.left,
        };
      case 'left':
        return {
          ...baseStyle,
          top: targetPosition.top,
          left: targetPosition.left - 10,
          transform: 'translateX(-100%)',
        };
      case 'right':
        return {
          ...baseStyle,
          top: targetPosition.top,
          left: targetPosition.left + 200,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 bg-black bg-opacity-30 z-[999]' />

      {/* Tooltip */}
      <div style={getTooltipStyle()}>
        <Card className='shadow-xl border-2 border-blue-200'>
          <CardContent className='p-4'>
            <div className='flex items-start justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <HelpCircle className='h-4 w-4 text-blue-500' />
                <span className='text-sm font-medium text-blue-600'>
                  {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
              <Button variant='ghost' size='sm' onClick={handleSkip}>
                <X className='h-4 w-4' />
              </Button>
            </div>

            <h3 className='font-semibold mb-2'>{currentStep.title}</h3>
            <p className='text-sm text-gray-600 mb-4'>{currentStep.content}</p>

            <div className='flex justify-between items-center'>
              <div className='flex gap-1'>
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className='flex gap-2'>
                {currentStepIndex > 0 && (
                  <Button variant='outline' size='sm' onClick={handlePrevious}>
                    Previous
                  </Button>
                )}
                <Button size='sm' onClick={handleNext}>
                  {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className='h-3 w-3 ml-1' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// CSS for tour highlighting
const tourStyles = `
  .tour-highlight {
    position: relative;
    z-index: 1001;
    box-shadow: 0 0 0 2px #3B82F6, 0 0 0 4px rgba(59, 130, 246, 0.3);
    border-radius: 4px;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = tourStyles;
  document.head.appendChild(styleElement);
}
