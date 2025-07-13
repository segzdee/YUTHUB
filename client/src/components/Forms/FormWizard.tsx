import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface FormStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validation?: (data: any) => boolean;
}

interface FormWizardProps {
  formType: string;
  title: string;
  description: string;
  steps: FormStep[];
  onComplete: (data: any) => void;
  initialData?: any;
  allowSaveAndContinue?: boolean;
}

export default function FormWizard({
  formType,
  title,
  description,
  steps,
  onComplete,
  initialData = {},
  allowSaveAndContinue = true
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [savedDraftId, setSavedDraftId] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load saved draft on mount
  useEffect(() => {
    if (allowSaveAndContinue && user?.id) {
      loadSavedDraft();
    }
  }, [formType, user?.id]);

  const loadSavedDraft = async () => {
    try {
      const response = await apiRequest("GET", `/api/forms/draft/${formType}`);
      if (response.ok) {
        const draft = await response.json();
        if (draft) {
          setFormData(draft.formData);
          setCurrentStep(draft.step - 1);
          setSavedDraftId(draft.id);
        }
      }
    } catch (error) {
      console.error("Failed to load saved draft:", error);
    }
  };

  const saveDraft = async () => {
    if (!allowSaveAndContinue || !user?.id) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/forms/draft", {
        formType,
        formData,
        step: currentStep + 1,
        completed: false
      });

      if (response.ok) {
        const draft = await response.json();
        setSavedDraftId(draft.id);
        toast({
          title: "Progress Saved",
          description: "Your form progress has been saved automatically.",
        });
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (allowSaveAndContinue) {
        saveDraft();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onComplete(formData);
      
      // Mark draft as completed if it exists
      if (savedDraftId && allowSaveAndContinue) {
        await apiRequest("PATCH", `/api/forms/draft/${savedDraftId}`, {
          completed: true
        });
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (stepData: any) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const canProceed = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData.validation) {
      return currentStepData.validation(formData);
    }
    return true;
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 mb-4">{description}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{steps[currentStep]?.title}</span>
              {allowSaveAndContinue && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveDraft}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              {steps[currentStep]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {CurrentStepComponent && (
              <CurrentStepComponent
                data={formData}
                onDataChange={updateFormData}
                errors={{}}
              />
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-4">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete Form
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}