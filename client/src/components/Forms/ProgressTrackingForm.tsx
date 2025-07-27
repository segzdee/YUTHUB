import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  User,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const progressUpdateSchema = z.object({
  residentId: z.coerce.number().min(1, 'Please select a resident'),
  supportPlanId: z.coerce.number().min(1, 'Please select a support plan'),
  goalType: z.enum([
    'independence',
    'education',
    'employment',
    'health',
    'social',
    'life_skills',
  ]),
  goal: z.string().min(5, 'Goal description is required'),
  currentProgress: z.coerce.number().min(0).max(100),
  progressNotes: z.string().min(10, 'Progress notes are required'),
  milestonesCompleted: z.array(z.string()).optional(),
  challenges: z.string().optional(),
  nextSteps: z.string().optional(),
  targetDate: z.string().optional(),
});

export default function ProgressTrackingForm() {
  const { toast } = useToast();
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [milestonesCompleted, setMilestonesCompleted] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(progressUpdateSchema),
    defaultValues: {
      residentId: 0,
      supportPlanId: 0,
      goalType: 'independence',
      goal: '',
      currentProgress: 0,
      targetDate: '',
      milestonesCompleted: [],
      progressNotes: '',
      challengesFaced: '',
      nextSteps: '',
    },
  });

  const residents = [
    { id: 1, name: 'John Smith', currentGoals: 3, completedGoals: 1 },
    { id: 2, name: 'Emma Johnson', currentGoals: 2, completedGoals: 2 },
    { id: 3, name: 'Michael Brown', currentGoals: 4, completedGoals: 0 },
  ];

  const mockGoals = [
    {
      id: 1,
      residentId: 1,
      goalType: 'independence',
      goal: 'Develop daily living skills and manage personal finances',
      currentProgress: 65,
      targetDate: '2024-12-31',
      milestones: [
        'Complete budgeting course',
        'Open bank account',
        'Pay bills independently for 3 months',
        'Develop meal planning skills',
      ],
    },
    {
      id: 2,
      residentId: 1,
      goalType: 'employment',
      goal: 'Secure part-time employment in retail sector',
      currentProgress: 40,
      targetDate: '2024-10-31',
      milestones: [
        'Update CV and cover letter',
        'Complete job search skills workshop',
        'Apply for 10 positions',
        'Attend interview skills session',
      ],
    },
  ];

  const handleResidentChange = (residentId: string) => {
    const resident = residents.find(r => r.id === parseInt(residentId));
    setSelectedResident(resident);
    setSelectedGoal(null);
    form.setValue('residentId', parseInt(residentId));
  };

  const handleGoalChange = (goalId: string) => {
    const goal = mockGoals.find(g => g.id === parseInt(goalId));
    setSelectedGoal(goal);
    if (goal) {
      form.setValue('supportPlanId', 1); // Would be dynamic
      form.setValue('goalType', goal.goalType as any);
      form.setValue('goal', goal.goal);
      form.setValue('currentProgress', goal.currentProgress);
      form.setValue('targetDate', goal.targetDate);
    }
  };

  const toggleMilestone = (milestone: string) => {
    const updated = milestonesCompleted.includes(milestone)
      ? milestonesCompleted.filter(m => m !== milestone)
      : [...milestonesCompleted, milestone];
    setMilestonesCompleted(updated);
    form.setValue('milestonesCompleted', updated);
  };

  const handleSubmit = async (data: any) => {
    try {
      const progressData = {
        ...data,
        milestones: JSON.stringify(selectedGoal?.milestones || []),
        notes: data.progressNotes,
        updatedBy: 1, // Current staff member
      };

      const response = await apiRequest(
        'POST',
        '/api/progress-tracking',
        progressData
      );

      if (response.ok) {
        toast({
          title: 'Progress Updated',
          description: 'Progress tracking has been successfully updated.',
        });

        // Reset form or redirect
        form.reset();
        setSelectedResident(null);
        setSelectedGoal(null);
        setMilestonesCompleted([]);
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'There was an error updating the progress.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Progress Tracking
          </h1>
          <p className='text-gray-600'>
            Update and monitor resident progress towards their support plan
            goals
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-6'
          >
            {/* Resident Selection */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <User className='w-5 h-5 mr-2' />
                  Select Resident
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='residentId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resident</FormLabel>
                      <Select onValueChange={handleResidentChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a resident' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {residents.map(resident => (
                            <SelectItem
                              key={resident.id}
                              value={resident.id.toString()}
                            >
                              <div className='flex items-center justify-between w-full'>
                                <span>{resident.name}</span>
                                <div className='flex space-x-2 ml-4'>
                                  <Badge variant='secondary'>
                                    {resident.currentGoals} active
                                  </Badge>
                                  <Badge variant='outline'>
                                    {resident.completedGoals} completed
                                  </Badge>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Goal Selection */}
            {selectedResident && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Target className='w-5 h-5 mr-2' />
                    Select Goal to Update
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {mockGoals
                      .filter(goal => goal.residentId === selectedResident.id)
                      .map(goal => (
                        <div
                          key={goal.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedGoal?.id === goal.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleGoalChange(goal.id.toString())}
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <h3 className='font-medium'>{goal.goal}</h3>
                            <Badge variant='secondary'>{goal.goalType}</Badge>
                          </div>
                          <div className='space-y-2'>
                            <div className='flex items-center justify-between text-sm text-gray-600'>
                              <span>Progress</span>
                              <span>{goal.currentProgress}%</span>
                            </div>
                            <Progress
                              value={goal.currentProgress}
                              className='h-2'
                            />
                            <div className='flex items-center text-sm text-gray-500'>
                              <Calendar className='w-4 h-4 mr-1' />
                              Target:{' '}
                              {new Date(goal.targetDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Update */}
            {selectedGoal && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <TrendingUp className='w-5 h-5 mr-2' />
                    Update Progress
                  </CardTitle>
                  <CardDescription>
                    Current goal: {selectedGoal.goal}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='currentProgress'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Progress (%)</FormLabel>
                        <FormControl>
                          <div className='space-y-2'>
                            <Input
                              type='number'
                              min='0'
                              max='100'
                              {...field}
                              onChange={e =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                            <Progress value={field.value} className='h-2' />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Set the current progress percentage (0-100)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label className='text-base font-medium mb-4 block'>
                      Milestones
                    </Label>
                    <div className='space-y-2'>
                      {selectedGoal.milestones.map(
                        (milestone: string, index: number) => (
                          <div
                            key={index}
                            className='flex items-center space-x-2'
                          >
                            <input
                              type='checkbox'
                              id={`milestone-${index}`}
                              checked={milestonesCompleted.includes(milestone)}
                              onChange={() => toggleMilestone(milestone)}
                              className='h-4 w-4 rounded border-gray-300'
                            />
                            <Label
                              htmlFor={`milestone-${index}`}
                              className={`flex-1 ${
                                milestonesCompleted.includes(milestone)
                                  ? 'line-through text-gray-500'
                                  : ''
                              }`}
                            >
                              {milestone}
                            </Label>
                            {milestonesCompleted.includes(milestone) && (
                              <CheckCircle2 className='w-4 h-4 text-green-500' />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name='progressNotes'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Progress Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Describe the progress made, activities completed, and any observations'
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='challenges'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Challenges Faced</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Any challenges or obstacles encountered'
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='nextSteps'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Steps</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Planned actions and next steps'
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='flex justify-end space-x-4'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setSelectedResident(null);
                        setSelectedGoal(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type='submit'>
                      <Clock className='w-4 h-4 mr-2' />
                      Update Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
