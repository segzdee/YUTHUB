import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserJourneyStep {
  id: string;
  title: string;
  description: string;
  component: string;
  requiredRole?: string[];
  prerequisites?: string[];
  isCompleted: boolean;
  isSkippable: boolean;
  estimatedTime: number; // in minutes
}

interface UserPersona {
  type:
    | 'housing_officer'
    | 'support_coordinator'
    | 'admin'
    | 'finance_officer'
    | 'manager';
  primaryTasks: string[];
  preferredNavigation: string[];
  keyMetrics: string[];
}

interface UserJourneyState {
  currentStep: string | null;
  completedSteps: string[];
  onboardingProgress: number;
  userPersona: UserPersona | null;
  isFirstVisit: boolean;
  showTour: boolean;
  contextualHelp: boolean;
  featureAdoption: Record<string, number>;
  userSatisfaction: number | null;
}

interface UserJourneyContextType {
  state: UserJourneyState;
  actions: {
    startOnboarding: () => void;
    completeStep: (stepId: string) => void;
    skipStep: (stepId: string) => void;
    setPersona: (persona: UserPersona) => void;
    showGuidedTour: (feature: string) => void;
    trackFeatureUsage: (feature: string) => void;
    submitFeedback: (feedback: any) => void;
    requestHelp: (context: string) => void;
    startOffboarding: () => void;
  };
  getNextStep: () => UserJourneyStep | null;
  getCurrentStepProgress: () => number;
  getPersonalizedContent: () => any;
}

const UserJourneyContext = createContext<UserJourneyContextType | null>(null);

const defaultOnboardingSteps: UserJourneyStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to YUTHUB',
    description: "Let's get you started with the platform",
    component: 'WelcomeStep',
    isCompleted: false,
    isSkippable: false,
    estimatedTime: 2,
  },
  {
    id: 'profile-setup',
    title: 'Complete Your Profile',
    description: 'Add your personal information and preferences',
    component: 'ProfileSetupStep',
    isCompleted: false,
    isSkippable: false,
    estimatedTime: 5,
  },
  {
    id: 'organization-config',
    title: 'Configure Organization',
    description: 'Set up your organization settings and preferences',
    component: 'OrganizationConfigStep',
    requiredRole: ['admin', 'manager'],
    isCompleted: false,
    isSkippable: true,
    estimatedTime: 10,
  },
  {
    id: 'role-assignment',
    title: 'Understand Your Role',
    description: 'Learn about your permissions and responsibilities',
    component: 'RoleAssignmentStep',
    isCompleted: false,
    isSkippable: false,
    estimatedTime: 3,
  },
  {
    id: 'feature-introduction',
    title: 'Key Features Overview',
    description: 'Discover the main features relevant to your role',
    component: 'FeatureIntroStep',
    isCompleted: false,
    isSkippable: true,
    estimatedTime: 8,
  },
  {
    id: 'first-action',
    title: 'Complete Your First Task',
    description: 'Perform a simple task to get familiar with the system',
    component: 'FirstActionStep',
    isCompleted: false,
    isSkippable: false,
    estimatedTime: 5,
  },
];

export function UserJourneyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [state, setState] = useState<UserJourneyState>({
    currentStep: null,
    completedSteps: [],
    onboardingProgress: 0,
    userPersona: null,
    isFirstVisit: true,
    showTour: false,
    contextualHelp: true,
    featureAdoption: {},
    userSatisfaction: null,
  });

  const [onboardingSteps] = useState<UserJourneyStep[]>(defaultOnboardingSteps);

  useEffect(() => {
    if (user) {
      loadUserJourneyState();
      detectUserPersona();
    }
  }, [user]);

  const loadUserJourneyState = async () => {
    try {
      const journeyData = await apiRequest('/api/user-journey');
      setState(prev => ({
        ...prev,
        ...journeyData,
        isFirstVisit: !journeyData.completedSteps?.length,
      }));
    } catch (error) {
      console.log('No existing journey data, starting fresh');
    }
  };

  const detectUserPersona = () => {
    if (!user) return;

    const personas: Record<string, UserPersona> = {
      housing_officer: {
        type: 'housing_officer',
        primaryTasks: [
          'property_management',
          'maintenance_requests',
          'occupancy_tracking',
        ],
        preferredNavigation: ['housing', 'properties', 'maintenance'],
        keyMetrics: [
          'occupancy_rate',
          'maintenance_response_time',
          'property_utilization',
        ],
      },
      support_coordinator: {
        type: 'support_coordinator',
        primaryTasks: [
          'resident_management',
          'support_plans',
          'incident_reporting',
        ],
        preferredNavigation: ['residents', 'support', 'safeguarding'],
        keyMetrics: [
          'support_plan_completion',
          'incident_resolution',
          'resident_satisfaction',
        ],
      },
      admin: {
        type: 'admin',
        primaryTasks: ['user_management', 'system_configuration', 'analytics'],
        preferredNavigation: ['dashboard', 'admin', 'reports'],
        keyMetrics: ['system_usage', 'user_adoption', 'performance_metrics'],
      },
      finance_officer: {
        type: 'finance_officer',
        primaryTasks: [
          'billing_management',
          'financial_reporting',
          'invoice_processing',
        ],
        preferredNavigation: ['billing', 'financials', 'reports'],
        keyMetrics: ['revenue_tracking', 'payment_efficiency', 'cost_analysis'],
      },
      manager: {
        type: 'manager',
        primaryTasks: [
          'team_oversight',
          'strategic_planning',
          'performance_monitoring',
        ],
        preferredNavigation: ['dashboard', 'reports', 'analytics'],
        keyMetrics: [
          'team_performance',
          'operational_efficiency',
          'strategic_goals',
        ],
      },
    };

    const userRole = user.role as keyof typeof personas;
    if (personas[userRole]) {
      setState(prev => ({ ...prev, userPersona: personas[userRole] }));
    }
  };

  const saveUserJourneyState = async (newState: Partial<UserJourneyState>) => {
    try {
      await apiRequest('/api/user-journey', {
        method: 'PUT',
        body: JSON.stringify(newState),
      });
    } catch (error) {
      console.error('Failed to save user journey state:', error);
    }
  };

  const startOnboarding = () => {
    const firstStep = onboardingSteps[0];
    const newState = {
      currentStep: firstStep.id,
      isFirstVisit: false,
      showTour: true,
    };
    setState(prev => ({ ...prev, ...newState }));
    saveUserJourneyState(newState);
  };

  const completeStep = (stepId: string) => {
    const newCompletedSteps = [...state.completedSteps, stepId];
    const progress = (newCompletedSteps.length / onboardingSteps.length) * 100;
    const nextStep = getNextStepAfter(stepId);

    const newState = {
      completedSteps: newCompletedSteps,
      onboardingProgress: progress,
      currentStep: nextStep?.id || null,
    };

    setState(prev => ({ ...prev, ...newState }));
    saveUserJourneyState(newState);

    // Track completion event
    trackFeatureUsage(`onboarding_step_${stepId}`);
  };

  const skipStep = (stepId: string) => {
    const nextStep = getNextStepAfter(stepId);
    const newState = {
      currentStep: nextStep?.id || null,
    };

    setState(prev => ({ ...prev, ...newState }));
    saveUserJourneyState(newState);

    // Track skip event
    trackFeatureUsage(`onboarding_skip_${stepId}`);
  };

  const setPersona = (persona: UserPersona) => {
    setState(prev => ({ ...prev, userPersona: persona }));
    saveUserJourneyState({ userPersona: persona });
  };

  const showGuidedTour = (feature: string) => {
    setState(prev => ({ ...prev, showTour: true }));
    trackFeatureUsage(`tour_${feature}`);
  };

  const trackFeatureUsage = (feature: string) => {
    setState(prev => ({
      ...prev,
      featureAdoption: {
        ...prev.featureAdoption,
        [feature]: (prev.featureAdoption[feature] || 0) + 1,
      },
    }));
  };

  const submitFeedback = async (feedback: any) => {
    try {
      await apiRequest('/api/user-feedback', {
        method: 'POST',
        body: JSON.stringify(feedback),
      });

      if (feedback.type === 'satisfaction') {
        setState(prev => ({ ...prev, userSatisfaction: feedback.rating }));
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const requestHelp = async (context: string) => {
    trackFeatureUsage(`help_request_${context}`);
    // Trigger contextual help system
  };

  const startOffboarding = async () => {
    // Show exit interview
    trackFeatureUsage('offboarding_started');
  };

  const getNextStep = (): UserJourneyStep | null => {
    if (!state.currentStep) return onboardingSteps[0];
    return getNextStepAfter(state.currentStep);
  };

  const getNextStepAfter = (stepId: string): UserJourneyStep | null => {
    const currentIndex = onboardingSteps.findIndex(step => step.id === stepId);
    if (currentIndex === -1 || currentIndex === onboardingSteps.length - 1)
      return null;

    // Filter steps based on user role
    const availableSteps = onboardingSteps
      .slice(currentIndex + 1)
      .filter(step => {
        if (!step.requiredRole) return true;
        return step.requiredRole.includes(user?.role || '');
      });

    return availableSteps[0] || null;
  };

  const getCurrentStepProgress = (): number => {
    if (!state.currentStep) return 0;
    const currentIndex = onboardingSteps.findIndex(
      step => step.id === state.currentStep
    );
    return ((currentIndex + 1) / onboardingSteps.length) * 100;
  };

  const getPersonalizedContent = () => {
    if (!state.userPersona) return null;

    return {
      dashboardWidgets: state.userPersona.keyMetrics,
      quickActions: state.userPersona.primaryTasks,
      navigation: state.userPersona.preferredNavigation,
    };
  };

  const contextValue: UserJourneyContextType = {
    state,
    actions: {
      startOnboarding,
      completeStep,
      skipStep,
      setPersona,
      showGuidedTour,
      trackFeatureUsage,
      submitFeedback,
      requestHelp,
      startOffboarding,
    },
    getNextStep,
    getCurrentStepProgress,
    getPersonalizedContent,
  };

  return (
    <UserJourneyContext.Provider value={contextValue}>
      {children}
    </UserJourneyContext.Provider>
  );
}

export const useUserJourney = () => {
  const context = useContext(UserJourneyContext);
  if (!context) {
    throw new Error('useUserJourney must be used within UserJourneyProvider');
  }
  return context;
};
