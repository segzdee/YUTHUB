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
  FirstActionStep
};

export default function OnboardingFlow() {
  const { state, actions, getNextStep, getCurrentStepProgress } = useUserJourney();
  const [isVisible, setIsVisible] = useState(true);
  
  const currentStep = getNextStep();
  
  if (!isVisible || !currentStep || state.onboardingProgress >= 100) {
    return null;
  }

  const StepComponent = stepComponents[currentStep.component as keyof typeof stepComponents];
  
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Getting Started
                <Badge variant="outline">
                  Step {state.completedSteps.length + 1} of 6
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {currentStep.estimatedTime} minutes remaining
                </span>
              </div>
            </div>
            <Button variant="ghost" onClick={handleDismiss}>
              ×
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(getCurrentStepProgress())}%</span>
            </div>
            <Progress value={getCurrentStepProgress()} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{currentStep.title}</h2>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>

          {StepComponent && (
            <StepComponent 
              onComplete={handleComplete}
              onSkip={currentStep.isSkippable ? handleSkip : undefined}
            />
          )}

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">
                {state.completedSteps.length} steps completed
              </span>
            </div>
            
            <div className="flex gap-2">
              {currentStep.isSkippable && (
                <Button variant="outline" onClick={handleSkip}>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                </Button>
              )}
              <Button onClick={handleComplete}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
