import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Settings, BarChart3, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: 'Quick Setup',
      description:
        'Sign up and configure your organization settings in minutes. Import existing resident data or start fresh with our guided setup wizard.',
      color: 'bg-primary-100 text-primary-600',
    },
    {
      number: 2,
      icon: Settings,
      title: 'Customize & Configure',
      description:
        "Tailor the platform to your organization's specific needs. Set up workflows, configure alerts, and integrate with existing systems.",
      color: 'bg-success/20 text-success',
    },
    {
      number: 3,
      icon: BarChart3,
      title: 'Track & Monitor',
      description:
        'Monitor resident progress, track outcomes, and manage support services. Use real-time dashboards to stay informed about your properties.',
      color: 'bg-accent-100 text-accent-600',
    },
    {
      number: 4,
      icon: TrendingUp,
      title: 'Analyze & Improve',
      description:
        'Generate comprehensive reports, analyze trends, and make data-driven decisions to improve your support services and outcomes.',
      color: 'bg-warning/20 text-warning',
    },
  ];

  return (
    <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gray-50'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <Badge variant='outline' className='mb-4 px-4 py-2'>
            Simple Process
          </Badge>
          <h2 className='text-3xl md:text-4xl font-bold text-high-contrast mb-4'>
            How YUTHUB Works
          </h2>
          <p className='text-xl text-medium-contrast max-w-3xl mx-auto'>
            Get started with YUTHUB in four simple steps and transform your
            youth housing support services.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className='interactive-element hover:shadow-lg transition-all duration-300 relative'
              >
                <CardContent className='p-6 text-center'>
                  <div className='flex justify-center mb-4'>
                    <div className={`p-4 rounded-full ${step.color}`}>
                      <Icon className='h-8 w-8' aria-hidden='true' />
                    </div>
                  </div>
                  <div className='absolute -top-3 -right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm'>
                    {step.number}
                  </div>
                  <h3 className='text-xl font-semibold text-high-contrast mb-3'>
                    {step.title}
                  </h3>
                  <p className='text-medium-contrast leading-relaxed'>
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className='mt-12 sm:mt-16 text-center'>
          <div className='inline-flex flex-col sm:flex-row items-center gap-2 px-4 sm:px-6 py-3 bg-blue-50 rounded-full mx-4 sm:mx-0'>
            <span className='text-primary font-semibold text-sm sm:text-base'>
              Ready to get started?
            </span>
            <span className='text-medium-contrast text-sm sm:text-base'>
              Setup takes less than 10 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
