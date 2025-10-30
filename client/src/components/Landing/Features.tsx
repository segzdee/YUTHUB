import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Shield,
  BarChart3,
  Heart,
  AlertTriangle,
  Smartphone,
  FileText,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Users,
      title: 'Resident Management',
      description:
        'Complete resident profiles with support needs, progress tracking, and personalized care plans.',
      color: 'text-primary-600',
    },
    {
      icon: Shield,
      title: 'Safeguarding & Compliance',
      description:
        'Built-in safeguarding protocols, incident reporting, and compliance tracking for regulatory requirements.',
      color: 'text-success',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description:
        'Comprehensive reporting on outcomes, occupancy rates, and service effectiveness with AI-powered insights.',
      color: 'text-accent-600',
    },
    {
      icon: Heart,
      title: 'Support Services',
      description:
        'Coordinate support worker schedules, track interventions, and manage multi-disciplinary team communication.',
      color: 'text-error',
    },
    {
      icon: AlertTriangle,
      title: 'Crisis Connect',
      description:
        'Emergency response system with instant escalation to emergency services and on-call support workers.',
      color: 'text-warning',
    },
    {
      icon: TrendingUp,
      title: 'Independence Pathways',
      description:
        'Track life skills development, educational progress, and employment outcomes with gamification.',
      color: 'text-info',
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      description:
        'Native mobile app for residents and support workers with offline capability and push notifications.',
      color: 'text-accent',
    },
    {
      icon: FileText,
      title: 'Documentation',
      description:
        'Automated report generation, case note management, and integration with local authority systems.',
      color: 'text-neutral-600',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description:
        'Round-the-clock system monitoring, dedicated support team, and comprehensive training resources.',
      color: 'text-primary',
    },
  ];

  return (
    <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-blue-50 to-slate-50' id='features'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
            Everything You Need to Support Young People
          </h2>
          <p className='text-lg md:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed'>
            From intake to independence, YUTHUB provides comprehensive tools for
            every aspect of youth housing support.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className='interactive-element hover:shadow-lg transition-all duration-300'
              >
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <Icon
                        className={`h-6 w-6 ${feature.color}`}
                        aria-hidden='true'
                      />
                    </div>
                    <CardTitle className='text-lg text-slate-900'>
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-slate-600 leading-relaxed'>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
