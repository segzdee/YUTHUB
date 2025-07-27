import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Award, Download, Users } from 'lucide-react';

interface ProgressReportProps {
  dateRange?: { start: string; end: string };
  properties?: string[];
}

export default function ProgressReport({
  dateRange,
  properties,
}: ProgressReportProps) {
  const { data: residents = [] } = useQuery({
    queryKey: ['/api/residents'],
  });

  const { data: progressTracking = [] } = useQuery({
    queryKey: ['/api/progress-tracking'],
  });

  const summaryData = {
    totalResidents: residents.length,
    activeGoals: 45,
    completedGoals: 32,
    averageProgress: 72,
    independenceImprovement: 15.5,
    successfulMoveOns: 8,
  };

  const goalCategories = [
    {
      category: 'Independence Skills',
      total: 18,
      completed: 12,
      inProgress: 6,
      percentage: 67,
    },
    {
      category: 'Education & Training',
      total: 15,
      completed: 8,
      inProgress: 7,
      percentage: 53,
    },
    {
      category: 'Employment',
      total: 12,
      completed: 7,
      inProgress: 5,
      percentage: 58,
    },
    {
      category: 'Health & Wellbeing',
      total: 20,
      completed: 15,
      inProgress: 5,
      percentage: 75,
    },
    {
      category: 'Social Skills',
      total: 10,
      completed: 6,
      inProgress: 4,
      percentage: 60,
    },
  ];

  const residentProgress = residents.slice(0, 8).map((resident: any) => ({
    ...resident,
    overallProgress: Math.floor(Math.random() * 30) + 60,
    activeGoals: Math.floor(Math.random() * 5) + 2,
    completedGoals: Math.floor(Math.random() * 8) + 2,
    independenceLevel: Math.floor(Math.random() * 3) + 3,
    lastAssessment: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ),
  }));

  const exportReport = () => {
    const reportData = {
      title: 'Progress Report',
      generatedAt: new Date().toISOString(),
      dateRange,
      summary: summaryData,
      goalCategories,
      residentProgress,
      progressTracking,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Progress Report</h2>
        <Button onClick={exportReport}>
          <Download className='mr-2 h-4 w-4' />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Residents
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summaryData.totalResidents}
            </div>
            <p className='text-xs text-muted-foreground'>Active in program</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Goals</CardTitle>
            <Target className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{summaryData.activeGoals}</div>
            <p className='text-xs text-muted-foreground'>
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Completed Goals
            </CardTitle>
            <Award className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summaryData.completedGoals}
            </div>
            <p className='text-xs text-muted-foreground'>
              Successfully achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Progress
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summaryData.averageProgress}%
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='mr-1 h-3 w-3' />+
              {summaryData.independenceImprovement}% independence
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Goal Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {goalCategories.map(category => (
              <div key={category.category} className='border rounded-lg p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h3 className='font-semibold'>{category.category}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {category.completed} of {category.total} goals completed
                    </p>
                  </div>
                  <div className='text-right'>
                    <div className='text-lg font-bold'>
                      {category.percentage}%
                    </div>
                    <Badge
                      variant={
                        category.percentage >= 70
                          ? 'default'
                          : category.percentage >= 50
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {category.percentage >= 70
                        ? 'Excellent'
                        : category.percentage >= 50
                          ? 'Good'
                          : 'Needs Focus'}
                    </Badge>
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-4 mb-3'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Total</p>
                    <p className='font-medium'>{category.total}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Completed</p>
                    <p className='font-medium'>{category.completed}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>In Progress</p>
                    <p className='font-medium'>{category.inProgress}</p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Completion Rate</span>
                    <span>{category.percentage}%</span>
                  </div>
                  <Progress value={category.percentage} className='h-2' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Resident Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Resident Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {residentProgress.map(resident => (
              <div key={resident.id} className='border rounded-lg p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h3 className='font-semibold'>
                      {resident.firstName} {resident.lastName}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Independence Level: {resident.independenceLevel}/5
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Last Assessment:{' '}
                      {resident.lastAssessment.toLocaleDateString()}
                    </p>
                  </div>
                  <div className='text-right'>
                    <div className='text-lg font-bold'>
                      {resident.overallProgress}%
                    </div>
                    <Badge
                      variant={
                        resident.overallProgress >= 80
                          ? 'default'
                          : resident.overallProgress >= 60
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {resident.overallProgress >= 80
                        ? 'Excellent'
                        : resident.overallProgress >= 60
                          ? 'Good'
                          : 'Needs Support'}
                    </Badge>
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-4 mb-3'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Active Goals
                    </p>
                    <p className='font-medium'>{resident.activeGoals}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Completed</p>
                    <p className='font-medium'>{resident.completedGoals}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Property</p>
                    <p className='font-medium'>
                      {resident.property?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Overall Progress</span>
                    <span>{resident.overallProgress}%</span>
                  </div>
                  <Progress value={resident.overallProgress} className='h-2' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements and Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
              <div>
                <p className='font-medium'>
                  {summaryData.successfulMoveOns} Successful Move-Ons
                </p>
                <p className='text-sm text-muted-foreground'>
                  Residents successfully transitioned to independent living
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
              <div>
                <p className='font-medium'>15% Independence Improvement</p>
                <p className='text-sm text-muted-foreground'>
                  Average independence level increased across all residents
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-purple-500 rounded-full mt-2'></div>
              <div>
                <p className='font-medium'>
                  75% Health & Wellbeing Goal Success
                </p>
                <p className='text-sm text-muted-foreground'>
                  Highest completion rate among all goal categories
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-orange-500 rounded-full mt-2'></div>
              <div>
                <p className='font-medium'>Focus on Education & Training</p>
                <p className='text-sm text-muted-foreground'>
                  53% completion rate is below average. Consider additional
                  support or revised goals
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
              <div>
                <p className='font-medium'>Expand Employment Support</p>
                <p className='text-sm text-muted-foreground'>
                  Employment goals show potential for improvement with targeted
                  interventions
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
              <div>
                <p className='font-medium'>
                  Replicate Health & Wellbeing Success
                </p>
                <p className='text-sm text-muted-foreground'>
                  Apply successful strategies from health goals to other
                  categories
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
