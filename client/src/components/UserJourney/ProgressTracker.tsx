import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, Users } from 'lucide-react';
import { useUserJourney } from './UserJourneyProvider';

interface ProgressMetric {
  id: string;
  title: string;
  description: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export default function ProgressTracker() {
  const { state } = useUserJourney();

  const onboardingMetrics: ProgressMetric[] = [
    {
      id: 'onboarding_completion',
      title: 'Onboarding Progress',
      description: 'Steps completed in getting started flow',
      value: state.onboardingProgress,
      target: 100,
      unit: '%',
      trend: 'up',
    },
    {
      id: 'feature_adoption',
      title: 'Feature Adoption',
      description: "Core features you've tried",
      value: Object.keys(state.featureAdoption).length,
      target: 10,
      unit: 'features',
      trend: 'up',
    },
  ];

  const usageMetrics: ProgressMetric[] = [
    {
      id: 'daily_tasks',
      title: 'Daily Tasks',
      description: 'Tasks completed today',
      value: 8,
      target: 12,
      unit: 'tasks',
      trend: 'up',
    },
    {
      id: 'system_usage',
      title: 'System Usage',
      description: 'Time spent in platform today',
      value: 145,
      target: 180,
      unit: 'minutes',
      trend: 'stable',
    },
  ];

  const skillBuilding = [
    { skill: 'Property Management', level: 85, maxLevel: 100 },
    { skill: 'Resident Support', level: 72, maxLevel: 100 },
    { skill: 'Report Generation', level: 45, maxLevel: 100 },
    { skill: 'Data Analysis', level: 30, maxLevel: 100 },
  ];

  const getSkillColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-blue-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='h-4 w-4 text-green-500' />;
      case 'down':
        return <TrendingUp className='h-4 w-4 text-red-500 rotate-180' />;
      default:
        return <div className='h-4 w-4 bg-gray-400 rounded-full' />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Onboarding Progress */}
      {state.onboardingProgress < 100 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Target className='h-5 w-5' />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {onboardingMetrics.map(metric => (
              <div key={metric.id} className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <div>
                    <h4 className='font-medium'>{metric.title}</h4>
                    <p className='text-sm text-gray-600'>
                      {metric.description}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    {getTrendIcon(metric.trend)}
                    <span className='font-semibold'>
                      {metric.value}
                      {metric.unit}
                    </span>
                  </div>
                </div>
                <Progress
                  value={(metric.value / metric.target) * 100}
                  className='h-2'
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Daily Usage */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {usageMetrics.map(metric => (
            <div key={metric.id} className='space-y-2'>
              <div className='flex justify-between items-center'>
                <div>
                  <h4 className='font-medium'>{metric.title}</h4>
                  <p className='text-sm text-gray-600'>{metric.description}</p>
                </div>
                <div className='flex items-center gap-2'>
                  {getTrendIcon(metric.trend)}
                  <span className='font-semibold'>
                    {metric.value}/{metric.target} {metric.unit}
                  </span>
                </div>
              </div>
              <Progress
                value={(metric.value / metric.target) * 100}
                className='h-2'
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skill Building */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Skill Development
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {skillBuilding.map(skill => (
            <div key={skill.skill} className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='font-medium'>{skill.skill}</span>
                <Badge variant='outline'>
                  Level {Math.floor(skill.level / 20) + 1}
                </Badge>
              </div>
              <div className='flex items-center gap-2'>
                <Progress
                  value={skill.level}
                  className='flex-1 h-2'
                  indicatorClassName={getSkillColor(skill.level)}
                />
                <span className='text-sm text-gray-600'>{skill.level}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
