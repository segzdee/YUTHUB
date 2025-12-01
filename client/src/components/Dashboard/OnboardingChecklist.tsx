import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, Building2, Users, Settings, UserPlus, X, Sparkles } from 'lucide-react';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  action: () => void;
}

export function OnboardingChecklist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { data: onboardingStatus, isLoading } = useQuery({
    queryKey: ['onboarding-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userOrg) {
        return {
          hasProperties: false,
          hasResidents: false,
          hasConfiguredOrg: false,
          hasInvitedMembers: false,
          isNewUser: true,
        };
      }

      const [
        { count: propertyCount },
        { count: residentCount },
        { data: org },
        { count: memberCount },
      ] = await Promise.all([
        supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', userOrg.organization_id),
        supabase
          .from('residents')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', userOrg.organization_id),
        supabase
          .from('organizations')
          .select('name, contact_email, phone, address')
          .eq('id', userOrg.organization_id)
          .single(),
        supabase
          .from('user_organizations')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', userOrg.organization_id),
      ]);

      const hasConfiguredOrg = org && org.name && org.contact_email && org.phone;

      return {
        hasProperties: (propertyCount || 0) > 0,
        hasResidents: (residentCount || 0) > 0,
        hasConfiguredOrg: !!hasConfiguredOrg,
        hasInvitedMembers: (memberCount || 0) > 1,
        isNewUser: !propertyCount && !residentCount,
      };
    },
    enabled: !!user?.id,
  });

  const markCompletedMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user');

      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      setShowModal(false);
    },
  });

  useEffect(() => {
    if (onboardingStatus && onboardingStatus.isNewUser && !dismissed) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [onboardingStatus, dismissed]);

  if (isLoading || !onboardingStatus) return null;

  const tasks: OnboardingTask[] = [
    {
      id: 'property',
      title: 'Add your first property',
      description: 'Register a property to start managing your housing units',
      completed: onboardingStatus.hasProperties,
      icon: <Building2 className="h-5 w-5" />,
      action: () => {
        setShowModal(false);
        navigate('/app/dashboard/properties/register');
      },
    },
    {
      id: 'resident',
      title: 'Register a resident',
      description: 'Add your first resident to begin tracking their journey',
      completed: onboardingStatus.hasResidents,
      icon: <Users className="h-5 w-5" />,
      action: () => {
        setShowModal(false);
        navigate('/app/dashboard/residents/intake');
      },
    },
    {
      id: 'settings',
      title: 'Configure organization settings',
      description: 'Complete your organization profile and contact information',
      completed: onboardingStatus.hasConfiguredOrg,
      icon: <Settings className="h-5 w-5" />,
      action: () => {
        setShowModal(false);
        navigate('/app/dashboard/settings/account');
      },
    },
    {
      id: 'team',
      title: 'Invite team members',
      description: 'Collaborate by inviting staff to join your organization',
      completed: onboardingStatus.hasInvitedMembers,
      icon: <UserPlus className="h-5 w-5" />,
      action: () => {
        setShowModal(false);
        navigate('/app/dashboard/settings/account?tab=team');
      },
    },
  ];

  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = (completedTasks / tasks.length) * 100;
  const isComplete = completedTasks === tasks.length;

  if (isComplete && !showModal) return null;

  return (
    <>
      {/* Banner for incomplete onboarding */}
      {!isComplete && !showModal && onboardingStatus.isNewUser && (
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">
            Welcome to YUTHUB!
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between mt-2">
              <span>
                Get started by completing {tasks.length - completedTasks} setup task
                {tasks.length - completedTasks !== 1 ? 's' : ''}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowModal(true)}
                className="ml-4"
              >
                View Checklist
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Onboarding Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <DialogTitle className="text-2xl">Welcome to YUTHUB!</DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowModal(false);
                  setDismissed(true);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Let's get you set up. Complete these steps to unlock the full potential of your
              housing management platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Setup Progress</span>
                <span className="text-muted-foreground">
                  {completedTasks} of {tasks.length} completed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    task.completed
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="mt-0.5">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {task.icon}
                      <h3 className="font-medium">{task.title}</h3>
                      {task.completed && (
                        <Badge variant="secondary" className="ml-auto">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>

                  {!task.completed && (
                    <Button size="sm" variant="outline" onClick={task.action}>
                      Start
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Completion Message */}
            {isComplete && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900 dark:text-green-100">
                  All set! You're ready to go.
                </AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  You've completed all the setup tasks. You can now take full advantage of YUTHUB's
                  features.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowModal(false);
                  setDismissed(true);
                }}
              >
                I'll do this later
              </Button>

              {isComplete && (
                <Button
                  onClick={() => markCompletedMutation.mutate()}
                  disabled={markCompletedMutation.isPending}
                >
                  {markCompletedMutation.isPending ? 'Saving...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
