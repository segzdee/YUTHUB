import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        'YUTHUB has transformed how we support our young people. The Crisis Connect feature has been invaluable for emergency situations, and the analytics help us demonstrate our impact to funders.',
      author: 'Sarah Mitchell',
      role: 'Service Manager',
      organization: 'Manchester Youth Housing',
      initials: 'SM',
      color: 'bg-blue-500',
    },
    {
      quote:
        "The mobile app is fantastic for our support workers. They can access resident information, update care plans, and log incidents while on the go. It's made our team so much more efficient.",
      author: 'David Chen',
      role: 'Support Team Lead',
      organization: 'Birmingham Housing Trust',
      initials: 'DC',
      color: 'bg-green-500',
    },
    {
      quote:
        'As a housing manager, I love the comprehensive reporting features. Being able to track occupancy, outcomes, and compliance all in one place saves us hours each week.',
      author: 'Emma Thompson',
      role: 'Housing Manager',
      organization: 'Leeds Community Housing',
      initials: 'ET',
      color: 'bg-purple-500',
    },
    {
      quote:
        "The independence pathway tracking has revolutionized how we support our residents' development. The gamification elements really motivate our young people to engage with their goals.",
      author: 'Michael Roberts',
      role: 'Support Worker',
      organization: 'Bristol Youth Services',
      initials: 'MR',
      color: 'bg-orange-500',
    },
    {
      quote:
        'Implementation was seamless and the support team was exceptional. We had our entire organization up and running within a week, and the training resources are comprehensive.',
      author: 'Lisa Parker',
      role: 'Operations Director',
      organization: 'London Youth Housing Coalition',
      initials: 'LP',
      color: 'bg-teal-500',
    },
    {
      quote:
        'The safeguarding features give us complete confidence in our compliance. The automated reporting saves us significant time during inspections and audits.',
      author: 'James Wilson',
      role: 'Safeguarding Lead',
      organization: 'Cardiff Housing Association',
      initials: 'JW',
      color: 'bg-red-500',
    },
  ];

  return (
    <section className='py-20 px-4 sm:px-6 lg:px-8 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <a
            href='/case-studies'
            className='inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded'
            aria-label='View customer case studies'
          >
            <Badge variant='outline' className='mb-4 px-4 py-2 hover:bg-blue-50 transition-colors'>
              Customer Stories
            </Badge>
          </a>
          <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
            Trusted by Youth Housing Organizations
          </h2>
          <p className='text-xl text-slate-700 max-w-3xl mx-auto'>
            See how organizations across the UK are using YUTHUB to improve
            their support services and outcomes.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className='interactive-element hover:shadow-lg transition-all duration-300 relative'
            >
              <CardContent className='p-6'>
                <Quote
                  className='h-8 w-8 text-primary mb-4'
                  aria-hidden='true'
                />
                <blockquote className='text-slate-700 mb-6 leading-relaxed'>
                  "{testimonial.quote}"
                </blockquote>
                <div className='flex items-center gap-4'>
                  <Avatar className='h-12 w-12'>
                    <AvatarFallback
                      className={`${testimonial.color} text-white font-semibold`}
                    >
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='font-semibold text-slate-900'>
                      {testimonial.author}
                    </div>
                    <div className='text-sm text-slate-600'>
                      {testimonial.role}
                    </div>
                    <div className='text-sm text-primary font-medium'>
                      {testimonial.organization}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='mt-12 sm:mt-16 text-center'>
          <div className='inline-flex flex-col items-center gap-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-blue-50 rounded-xl mx-4 sm:mx-0'>
            <div className='flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left'>
              <span className='text-xl sm:text-2xl font-bold text-primary'>
                500+
              </span>
              <span className='text-slate-700 text-sm sm:text-base'>
                Organisations trust YUTHUB
              </span>
            </div>

            {/* Logo strip */}
            <div className='w-full max-w-4xl mt-4'>
              <p className='text-xs text-slate-600 mb-3'>Trusted by leading housing associations and local authorities</p>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-items-center'>
                <div className='h-12 px-4 flex items-center justify-center bg-white rounded border border-slate-200'>
                  <span className='text-slate-600 font-semibold text-sm'>Manchester YH</span>
                </div>
                <div className='h-12 px-4 flex items-center justify-center bg-white rounded border border-slate-200'>
                  <span className='text-slate-600 font-semibold text-sm'>Birmingham HT</span>
                </div>
                <div className='h-12 px-4 flex items-center justify-center bg-white rounded border border-slate-200'>
                  <span className='text-slate-600 font-semibold text-sm'>Leeds CH</span>
                </div>
                <div className='h-12 px-4 flex items-center justify-center bg-white rounded border border-slate-200'>
                  <span className='text-slate-600 font-semibold text-sm'>Bristol YS</span>
                </div>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-slate-700 text-center mt-4'>
              <span>📊 98% Customer Satisfaction*</span>
              <span>⚡ 45% Faster Case Management*</span>
              <span>🎯 35% Better Outcomes*</span>
            </div>
            <div className='text-xs text-slate-500 text-center'>
              *Based on 2024 customer survey (n=127 organisations).
              <a href='/case-studies' className='text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded'>View case studies</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
