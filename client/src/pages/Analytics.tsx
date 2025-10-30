import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppPageLayout } from '@/components/PageLayout';
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
import {
  BarChart3,
  TrendingUp,
  Users,
  Building,
  Target,
  Award,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import type {
  Property,
  Resident,
  SupportPlan,
  ProgressTracking,
  Incident,
} from '@shared/schema';

export default function Analytics() {
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<
    Property[]
  >({
    queryKey: ['/api/properties'],
  });

  const { data: residents = [], isLoading: residentsLoading } = useQuery<
    Resident[]
  >({
    queryKey: ['/api/residents'],
  });

  const { data: supportPlans = [], isLoading: supportPlansLoading } = useQuery<
    SupportPlan[]
  >({
    queryKey: ['/api/support-plans'],
  });

  const { data: progressTracking = [], isLoading: progressLoading } = useQuery<
    ProgressTracking[]
  >({
    queryKey: ['/api/progress-tracking'],
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<
    Incident[]
  >({
    queryKey: ['/api/incidents'],
  });

  const isLoading =
    propertiesLoading ||
    residentsLoading ||
    supportPlansLoading ||
    progressLoading ||
    incidentsLoading;

  if (isLoading) {
    return (
    <AppPageLayout>
      <main className='space-y-6'>
        <PageLoader
          title='[PAGE] Dashboard'
          description='Loading data...'
          showTabs={true}
          tabCount={4}
          cardCount={6}
          showMetrics={true}
        />
      </main>
    </AppPageLayout>
  );
  }

  // Calculate metrics
  const totalProperties = properties.length;
  const totalResidents = residents.length;
  const totalOccupiedUnits = properties.reduce(
    (sum, p) => sum + p.occupiedUnits,
    0
  );
  const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
  const occupancyRate =
    totalUnits > 0 ? (totalOccupiedUnits / totalUnits) * 100 : 0;

  const activeSupportPlans = supportPlans.filter(
    p => p.status === 'active'
  ).length;
  const completedSupportPlans = supportPlans.filter(
    p => p.status === 'completed'
  ).length;
  const successRate =
    supportPlans.length > 0
      ? (completedSupportPlans / supportPlans.length) * 100
      : 0;

  const averageIndependenceLevel =
    residents.length > 0
      ? residents.reduce((sum, r) => sum + r.independenceLevel, 0) /
        residents.length
      : 0;

  const highRiskResidents = residents.filter(
    r => r.riskLevel === 'high'
  ).length;
  const mediumRiskResidents = residents.filter(
    r => r.riskLevel === 'medium'
  ).length;
  const lowRiskResidents = residents.filter(r => r.riskLevel === 'low').length;

  const activeIncidents = incidents.filter(
    i => i.status === 'open' || i.status === 'investigating'
  ).length;
  const resolvedIncidents = incidents.filter(
    i => i.status === 'resolved'
  ).length;

  const achievedGoals = progressTracking.filter(
    p => p.status === 'achieved'
  ).length;
  const activeGoals = progressTracking.filter(
    p => p.status === 'on_track'
  ).length;
  const atRiskGoals = progressTracking.filter(
    p => p.status === 'at_risk'
  ).length;

  return (
    <AppPageLayout>
      <main className='space-y-6'>
          <div className='mb-6 sm:mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              Analytics & Outcomes
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Track performance metrics, analyze trends, and measure success
              outcomes
            </p>
          </div>

          <Tabs defaultValue='overview' className='space-y-6'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='housing'>Housing</TabsTrigger>
              <TabsTrigger value='residents'>Residents</TabsTrigger>
              <TabsTrigger value='outcomes'>Outcomes</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='space-y-6'>
              {/* Key Performance Indicators */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Properties
                    </CardTitle>
                    <Building className='h-4 w-4 text-primary' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{totalProperties}</div>
                    <p className='text-xs text-muted-foreground'>
                      Active housing units
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Occupancy Rate
                    </CardTitle>
                    <BarChart3 className='h-4 w-4 text-blue-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {occupancyRate.toFixed(1)}%
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {totalOccupiedUnits} of {totalUnits} units occupied
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Success Rate
                    </CardTitle>
                    <Award className='h-4 w-4 text-green-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {successRate.toFixed(1)}%
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Completed support plans
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Avg Independence
                    </CardTitle>
                    <TrendingUp className='h-4 w-4 text-purple-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {averageIndependenceLevel.toFixed(1)}/5
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Resident independence level
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Overview */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment Overview</CardTitle>
                    <CardDescription>
                      Current risk distribution across residents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>High Risk</span>
                        <Badge className='bg-red-100 text-red-800'>
                          {highRiskResidents}
                        </Badge>
                      </div>
                      <Progress
                        value={(highRiskResidents / totalResidents) * 100}
                        className='h-2'
                      />
                    </div>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Medium Risk</span>
                        <Badge className='bg-yellow-100 text-yellow-800'>
                          {mediumRiskResidents}
                        </Badge>
                      </div>
                      <Progress
                        value={(mediumRiskResidents / totalResidents) * 100}
                        className='h-2'
                      />
                    </div>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Low Risk</span>
                        <Badge className='bg-green-100 text-green-800'>
                          {lowRiskResidents}
                        </Badge>
                      </div>
                      <Progress
                        value={(lowRiskResidents / totalResidents) * 100}
                        className='h-2'
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Support Plan Performance</CardTitle>
                    <CardDescription>
                      Current status of all support plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Active Plans</span>
                      <div className='flex items-center gap-2'>
                        <CheckCircle className='h-4 w-4 text-green-600' />
                        <span className='text-sm font-bold'>
                          {activeSupportPlans}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Completed Plans
                      </span>
                      <div className='flex items-center gap-2'>
                        <Award className='h-4 w-4 text-blue-600' />
                        <span className='text-sm font-bold'>
                          {completedSupportPlans}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Success Rate</span>
                      <div className='flex items-center gap-2'>
                        <TrendingUp className='h-4 w-4 text-purple-600' />
                        <span className='text-sm font-bold'>
                          {successRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='housing' className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Units
                    </CardTitle>
                    <Building className='h-4 w-4 text-primary' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{totalUnits}</div>
                    <p className='text-xs text-muted-foreground'>
                      Across all properties
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Occupied Units
                    </CardTitle>
                    <Users className='h-4 w-4 text-blue-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {totalOccupiedUnits}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Currently occupied
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Vacancy Rate
                    </CardTitle>
                    <BarChart3 className='h-4 w-4 text-yellow-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {(100 - occupancyRate).toFixed(1)}%
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {totalUnits - totalOccupiedUnits} vacant units
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Property Performance</CardTitle>
                  <CardDescription>Occupancy rates by property</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {properties.map(property => {
                      const occupancyRate =
                        property.totalUnits > 0
                          ? (property.occupiedUnits / property.totalUnits) * 100
                          : 0;
                      return (
                        <div key={property.id} className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium'>
                              {property.name}
                            </span>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              {property.occupiedUnits}/{property.totalUnits} (
                              {occupancyRate.toFixed(0)}%)
                            </span>
                          </div>
                          <Progress value={occupancyRate} className='h-2' />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='residents' className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Residents
                    </CardTitle>
                    <Users className='h-4 w-4 text-primary' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{totalResidents}</div>
                    <p className='text-xs text-muted-foreground'>
                      Currently active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      High Risk
                    </CardTitle>
                    <AlertTriangle className='h-4 w-4 text-red-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {highRiskResidents}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Requiring intervention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Medium Risk
                    </CardTitle>
                    <Target className='h-4 w-4 text-yellow-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {mediumRiskResidents}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Monitoring required
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Low Risk
                    </CardTitle>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{lowRiskResidents}</div>
                    <p className='text-xs text-muted-foreground'>
                      Stable residents
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Independence Level Distribution</CardTitle>
                  <CardDescription>
                    Resident independence levels across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {[1, 2, 3, 4, 5].map(level => {
                      const count = residents.filter(
                        r => r.independenceLevel === level
                      ).length;
                      const percentage =
                        totalResidents > 0 ? (count / totalResidents) * 100 : 0;
                      return (
                        <div key={level} className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium'>
                              Level {level}
                            </span>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              {count} residents ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className='h-2' />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='outcomes' className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Achieved Goals
                    </CardTitle>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{achievedGoals}</div>
                    <p className='text-xs text-muted-foreground'>
                      Successfully completed
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
                    <div className='text-2xl font-bold'>{activeGoals}</div>
                    <p className='text-xs text-muted-foreground'>
                      Currently in progress
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      At Risk Goals
                    </CardTitle>
                    <AlertTriangle className='h-4 w-4 text-red-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{atRiskGoals}</div>
                    <p className='text-xs text-muted-foreground'>
                      Requiring attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Incidents
                    </CardTitle>
                    <AlertTriangle className='h-4 w-4 text-yellow-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{activeIncidents}</div>
                    <p className='text-xs text-muted-foreground'>
                      {resolvedIncidents} resolved
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Goal Achievement Trends</CardTitle>
                    <CardDescription>
                      Progress tracking across all residents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          Success Rate
                        </span>
                        <span className='text-sm text-green-600 font-bold'>
                          {progressTracking.length > 0
                            ? (
                                (achievedGoals / progressTracking.length) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          Completion Rate
                        </span>
                        <span className='text-sm text-blue-600 font-bold'>
                          {progressTracking.length > 0
                            ? (
                                ((achievedGoals + activeGoals) /
                                  progressTracking.length) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Risk Rate</span>
                        <span className='text-sm text-red-600 font-bold'>
                          {progressTracking.length > 0
                            ? (
                                (atRiskGoals / progressTracking.length) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Incident Resolution</CardTitle>
                    <CardDescription>
                      Safety and behavioral incident tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          Total Incidents
                        </span>
                        <span className='text-sm font-bold'>
                          {incidents.length}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Active</span>
                        <Badge className='bg-red-100 text-red-800'>
                          {activeIncidents}
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Resolved</span>
                        <Badge className='bg-green-100 text-green-800'>
                          {resolvedIncidents}
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>
                          Resolution Rate
                        </span>
                        <span className='text-sm text-green-600 font-bold'>
                          {incidents.length > 0
                            ? (
                                (resolvedIncidents / incidents.length) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
      </main>
    </AppPageLayout>
  );
}
