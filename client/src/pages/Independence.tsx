import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import PageLoader from '@/components/common/PageLoader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import {
  TrendingUp,
  Target,
  Calendar,
  CheckCircle,
  Plus,
  User,
  Award,
  Clock,
} from 'lucide-react';
import type { ProgressTracking, Resident, SupportPlan } from '@shared/schema';

export default function Independence() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: progressTracking = [], isLoading: progressLoading } = useQuery<
    ProgressTracking[]
  >({
    queryKey: ['/api/progress-tracking'],
  });

  const { data: residents = [], isLoading: residentsLoading } = useQuery<
    Resident[]
  >({
    queryKey: ['/api/residents'],
  });

  const { data: supportPlans = [], isLoading: plansLoading } = useQuery<
    SupportPlan[]
  >({
    queryKey: ['/api/support-plans'],
  });

  const isLoading = progressLoading || residentsLoading || plansLoading;

  if (isLoading) {
    return (
      <div className='flex h-screen bg-background'>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className='flex-1 lg:ml-64 flex flex-col'>
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className='flex-1 overflow-y-auto p-4 sm:p-6'>
            <PageLoader
              title='Independence Pathway'
              description='Loading resident progress and goals...'
              showTabs={true}
              tabCount={3}
              cardCount={8}
              showMetrics={true}
            />
          </main>
        </div>
      </div>
    );
  }

  // Filter residents based on search term
  const filteredResidents = residents.filter(resident =>
    `${resident.firstName} ${resident.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getResidentName = (residentId: number) => {
    const resident = residents.find(r => r.id === residentId);
    return resident ? `${resident.firstName} ${resident.lastName}` : 'Unknown';
  };

  const getIndependenceLevel = (residentId: number) => {
    const resident = residents.find(r => r.id === residentId);
    return resident ? resident.independenceLevel : 1;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800';
      case 'behind':
        return 'bg-yellow-100 text-yellow-800';
      case 'at_risk':
        return 'bg-red-100 text-red-800';
      case 'achieved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const skillAreas = [
    {
      name: 'Life Skills',
      icon: Target,
      description: 'Cooking, cleaning, budgeting, time management',
    },
    {
      name: 'Employment',
      icon: Award,
      description: 'Job searching, CV writing, interview skills',
    },
    {
      name: 'Education',
      icon: TrendingUp,
      description: 'Academic support, training courses, certifications',
    },
    {
      name: 'Health & Wellbeing',
      icon: CheckCircle,
      description: 'Mental health, physical health, self-care',
    },
    {
      name: 'Social Skills',
      icon: User,
      description: 'Communication, relationships, community engagement',
    },
    {
      name: 'Housing',
      icon: Calendar,
      description: 'Tenancy skills, property maintenance, housing applications',
    },
  ];

  // Calculate average independence level
  const avgIndependenceLevel =
    residents.length > 0
      ? residents.reduce(
          (sum, resident) => sum + resident.independenceLevel,
          0
        ) / residents.length
      : 0;

  return (
    <div className='flex h-screen bg-background'>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className='flex-1 lg:ml-64 flex flex-col'>
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className='flex-1 overflow-y-auto p-4 sm:p-6'>
          <div className='mb-6 sm:mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              Independence Pathway
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Track resident progress, manage goals, and support skill
              development
            </p>
          </div>

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 sm:mb-8'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Average Independence
                </CardTitle>
                <TrendingUp className='h-4 w-4 text-primary' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {avgIndependenceLevel.toFixed(1)}/5
                </div>
                <p className='text-xs text-muted-foreground'>
                  Overall independence level
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Goals
                </CardTitle>
                <Target className='h-4 w-4 text-blue-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {progressTracking.filter(p => p.status === 'on_track').length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Currently being worked on
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Achieved Goals
                </CardTitle>
                <CheckCircle className='h-4 w-4 text-green-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {progressTracking.filter(p => p.status === 'achieved').length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Successfully completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>At Risk</CardTitle>
                <Clock className='h-4 w-4 text-red-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {progressTracking.filter(p => p.status === 'at_risk').length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Requiring attention
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue='residents' className='space-y-6'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='residents'>Resident Progress</TabsTrigger>
              <TabsTrigger value='goals'>Goals & Milestones</TabsTrigger>
              <TabsTrigger value='skills'>Skill Areas</TabsTrigger>
            </TabsList>

            <TabsContent value='residents' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div className='flex-1 max-w-md'>
                  <Input
                    type='search'
                    inputMode='search'
                    autoComplete='off'
                    placeholder='Search residents...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full touch-target'
                  />
                </div>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Add Goal
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredResidents.map(resident => {
                  const residentProgress = progressTracking.filter(
                    p => p.residentId === resident.id
                  );
                  const activeGoals = residentProgress.filter(
                    p => p.status === 'on_track'
                  );
                  const achievedGoals = residentProgress.filter(
                    p => p.status === 'achieved'
                  );

                  return (
                    <Card
                      key={resident.id}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-primary/10 rounded-lg'>
                              <User className='h-5 w-5 text-primary' />
                            </div>
                            <div>
                              <CardTitle className='text-lg'>
                                {resident.firstName} {resident.lastName}
                              </CardTitle>
                              <CardDescription>
                                Independence Level: {resident.independenceLevel}
                                /5
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          <div>
                            <div className='flex items-center justify-between mb-2'>
                              <span className='text-sm font-medium'>
                                Independence Progress
                              </span>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                {resident.independenceLevel * 20}%
                              </span>
                            </div>
                            <Progress
                              value={resident.independenceLevel * 20}
                              className='h-2'
                            />
                          </div>

                          <div className='grid grid-cols-2 gap-4'>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-blue-600'>
                                {activeGoals.length}
                              </div>
                              <div className='text-xs text-gray-600 dark:text-gray-400'>
                                Active Goals
                              </div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-green-600'>
                                {achievedGoals.length}
                              </div>
                              <div className='text-xs text-gray-600 dark:text-gray-400'>
                                Achieved
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value='goals' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Goals & Milestones
                </h2>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  New Goal
                </Button>
              </div>

              <div className='space-y-4'>
                {progressTracking.length === 0 ? (
                  <Card>
                    <CardContent className='flex items-center justify-center py-8'>
                      <div className='text-center'>
                        <Target className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-500'>No goals tracked yet</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  progressTracking.map(progress => (
                    <Card
                      key={progress.id}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-primary/10 rounded-lg'>
                              <Target className='h-5 w-5 text-primary' />
                            </div>
                            <div>
                              <CardTitle className='text-lg'>
                                {progress.goalTitle}
                              </CardTitle>
                              <CardDescription>
                                {getResidentName(progress.residentId)} •{' '}
                                {progress.skillArea}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusColor(progress.status)}>
                            {progress.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          <div>
                            <div className='flex items-center justify-between mb-2'>
                              <span className='text-sm font-medium'>
                                Progress
                              </span>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                {progress.progressPercentage}%
                              </span>
                            </div>
                            <Progress
                              value={progress.progressPercentage}
                              className='h-2'
                            />
                          </div>

                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Target Date
                              </span>
                              <div className='text-sm font-medium'>
                                {progress.targetDate
                                  ? new Date(
                                      progress.targetDate
                                    ).toLocaleDateString()
                                  : 'No target'}
                              </div>
                            </div>
                            <div>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Last Update
                              </span>
                              <div className='text-sm font-medium'>
                                {new Date(
                                  progress.updatedAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {progress.notes && (
                            <div>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Notes
                              </span>
                              <p className='text-sm mt-1'>{progress.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value='skills' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Skill Development Areas
                </h2>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Add Skill Area
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {skillAreas.map(skill => {
                  const Icon = skill.icon;
                  const skillProgress = progressTracking.filter(
                    p => p.skillArea === skill.name
                  );
                  const avgProgress =
                    skillProgress.length > 0
                      ? skillProgress.reduce(
                          (sum, p) => sum + p.progressPercentage,
                          0
                        ) / skillProgress.length
                      : 0;

                  return (
                    <Card
                      key={skill.name}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardHeader>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-primary/10 rounded-lg'>
                            <Icon className='h-5 w-5 text-primary' />
                          </div>
                          <div>
                            <CardTitle className='text-lg'>
                              {skill.name}
                            </CardTitle>
                            <CardDescription>
                              {skill.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          <div>
                            <div className='flex items-center justify-between mb-2'>
                              <span className='text-sm font-medium'>
                                Average Progress
                              </span>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                {avgProgress.toFixed(0)}%
                              </span>
                            </div>
                            <Progress value={avgProgress} className='h-2' />
                          </div>

                          <div className='grid grid-cols-2 gap-4'>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-blue-600'>
                                {skillProgress.length}
                              </div>
                              <div className='text-xs text-gray-600 dark:text-gray-400'>
                                Active Goals
                              </div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-green-600'>
                                {
                                  skillProgress.filter(
                                    p => p.status === 'achieved'
                                  ).length
                                }
                              </div>
                              <div className='text-xs text-gray-600 dark:text-gray-400'>
                                Achieved
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
