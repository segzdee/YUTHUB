import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle, Clock, SkipForward } from 'lucide-react';
import { useState } from 'react';
import FeatureIntroStep from './OnboardingSteps/FeatureIntroStep';
import FirstActionStep from './OnboardingSteps/FirstActionStep';
import OrganizationConfigStep from './OnboardingSteps/OrganizationConfigStep';
import ProfileSetupStep from './OnboardingSteps/ProfileSetupStep';
import RoleAssignmentStep from './OnboardingSteps/RoleAssignmentStep';
import WelcomeStep from './OnboardingSteps/WelcomeStep';
import { useUserJourney } from './UserJourneyProvider';

const stepComponents = {
  WelcomeStep,
  ProfileSetupStep,
  OrganizationConfigStep,
  RoleAssignmentStep,
  FeatureIntroStep,
  FirstActionStep,
};

export default function OnboardingFlow() {
  const { state, actions, getNextStep, getCurrentStepProgress } =
    useUserJourney();
  const [isVisible, setIsVisible] = useState(true);

  const currentStep = getNextStep();

  if (!isVisible || !currentStep || state.onboardingProgress >= 100) {
    return null;
  }

  const StepComponent =
    stepComponents[currentStep.component as keyof typeof stepComponents];

  const handleComplete = () => {
    actions.completeStep(currentStep.id);
  };

  const handleSkip = () => {
    actions.skipStep(currentStep.id);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <Card className='w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <CardHeader className='border-b'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                Getting Started
                <Badge variant='outline'>
                  Step {state.completedSteps.length + 1} of 6
                </Badge>
              </CardTitle>
              <div className='flex items-center gap-2 mt-2'>
                <Clock className='h-4 w-4 text-gray-500' />
                <span className='text-sm text-gray-600'>
                  {currentStep.estimatedTime} minutes remaining
                </span>
              </div>
            </div>
            <Button variant='ghost' onClick={handleDismiss}>
              ×
            </Button>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Progress</span>
              <span>{Math.round(getCurrentStepProgress())}%</span>
            </div>
            <Progress value={getCurrentStepProgress()} className='h-2' />
          </div>
        </CardHeader>

        <CardContent className='p-6'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold mb-2'>{currentStep.title}</h2>
            <p className='text-gray-600'>{currentStep.description}</p>
          </div>

          {StepComponent && (
            <StepComponent
              onComplete={handleComplete}
              onSkip={currentStep.isSkippable ? handleSkip : undefined}
            />
          )}

          <div className='flex justify-between items-center mt-8 pt-6 border-t'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-green-500' />
              <span className='text-sm text-gray-600'>
                {state.completedSteps.length} steps completed
              </span>
            </div>

            <div className='flex gap-2'>
              {currentStep.isSkippable && (
                <Button variant='outline' onClick={handleSkip}>
                  <SkipForward className='h-4 w-4 mr-2' />
                  Skip
                </Button>
              )}
              <Button onClick={handleComplete}>
                Continue
                <ArrowRight className='h-4 w-4 ml-2' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const OnboardingFlow: React.FC = () => {
  const { currentStep, completeStep, skipStep } = useUserJourney();
  const [isLoading, setIsLoading] = useState(false);

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to YUTHUB',
      description: "Let's get you started with your housing journey",
      component: WelcomeStep,
      skippable: false,
    },
    {
      id: 'email-verification',
      title: 'Verify Your Email',
      description: 'Check your email and click the verification link',
      component: EmailVerificationStep,
      skippable: false,
    },
    {
      id: 'profile-setup',
      title: 'Complete Your Profile',
      description: 'Add your personal information and preferences',
      component: ProfileSetupStep,
      skippable: true,
    },
    {
      id: 'organization-config',
      title: 'Organization Setup',
      description: 'Configure your organization settings',
      component: OrganizationConfigStep,
      skippable: true,
    },
    {
      id: 'feature-intro',
      title: 'Platform Features',
      description: 'Learn about key features and capabilities',
      component: FeatureIntroStep,
      skippable: true,
    },
    {
      id: 'first-action',
      title: 'Take Your First Action',
      description:
        'Start exploring housing options or create your first listing',
      component: FirstActionStep,
      skippable: false,
    },
  ];

  // ... existing code ...
};

// New Email Verification Step
const EmailVerificationStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onSkip,
}) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch('/api/auth/verification-status');
      const data = await response.json();
      if (data.verified) {
        setIsVerified(true);
        onNext();
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
    }
  };

  const resendVerificationEmail = async () => {
    setIsResending(true);
    try {
      await fetch('/api/auth/resend-verification', { method: 'POST' });
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkVerificationStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='text-center space-y-6'>
      <div className='w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center'>
        <Mail className='w-8 h-8 text-blue-600' />
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-2'>Check Your Email</h3>
        <p className='text-gray-600 mb-4'>
          We've sent a verification link to your email address. Click the link
          to verify your account.
        </p>

        {isVerified ? (
          <div className='flex items-center justify-center text-green-600'>
            <CheckCircle className='w-5 h-5 mr-2' />
            <span>Email verified successfully!</span>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center justify-center text-amber-600'>
              <Clock className='w-5 h-5 mr-2' />
              <span>Waiting for verification...</span>
            </div>

            <button
              onClick={resendVerificationEmail}
              disabled={isResending}
              className='text-blue-600 hover:text-blue-800 underline'
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Feature Introduction Step
const FeatureIntroStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onSkip,
}) => {
  const features = [
    {
      icon: Home,
      title: 'Housing Search',
      description: 'Find and filter housing options that match your criteria',
    },
    {
      icon: Users,
      title: 'Community Connect',
      description: 'Connect with other residents and build your community',
    },
    {
      icon: FileText,
      title: 'Application Management',
      description: 'Track your applications and manage documentation',
    },
    {
      icon: MessageSquare,
      title: 'Communication Hub',
      description: 'Stay in touch with landlords and property managers',
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h3 className='text-xl font-semibold mb-2'>Discover YUTHUB Features</h3>
        <p className='text-gray-600'>
          Here's what you can do with your new account
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {features.map((feature, index) => (
          <div
            key={index}
            className='p-4 border rounded-lg hover:shadow-md transition-shadow'
          >
            <div className='flex items-start space-x-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                <feature.icon className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <h4 className='font-medium mb-1'>{feature.title}</h4>
                <p className='text-sm text-gray-600'>{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-between'>
        <button
          onClick={onSkip}
          className='px-4 py-2 text-gray-600 hover:text-gray-800'
        >
          Skip for now
        </button>
        <button
          onClick={onNext}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        >
          Continue
        </button>
      </div>
    </div>
  );
};
