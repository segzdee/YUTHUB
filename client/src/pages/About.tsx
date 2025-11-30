import React from 'react';
import { PublicPageLayout } from '../components/PageLayout';
import { Heart, Users, Target, Award, TrendingUp, Globe } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      icon: Heart,
      title: 'Young People First',
      description: 'Every feature we build starts with the question: how does this help young people thrive?'
    },
    {
      icon: Users,
      title: 'Support Our Partners',
      description: 'We empower housing providers with tools that reduce admin burden and increase impact.'
    },
    {
      icon: Target,
      title: 'Outcomes Focused',
      description: 'Measuring what matters - independence, wellbeing, and successful transitions to adulthood.'
    },
    {
      icon: Award,
      title: 'Excellence in Everything',
      description: 'From security to support, we hold ourselves to the highest standards.'
    }
  ];

  const stats = [
    { number: '2019', label: 'Founded' },
    { number: '150+', label: 'Organizations' },
    { number: '2,500+', label: 'Young People Supported' },
    { number: '99.97%', label: 'Uptime' }
  ];

  const team = [
    {
      name: 'Sarah Mitchell',
      role: 'CEO & Co-Founder',
      background: '15 years in social housing sector'
    },
    {
      name: 'James Chen',
      role: 'CTO & Co-Founder',
      background: 'Former tech lead at gov.uk'
    },
    {
      name: 'Dr. Emily Roberts',
      role: 'Head of Impact',
      background: 'PhD in Youth Social Work'
    },
    {
      name: 'Michael Thompson',
      role: 'Head of Product',
      background: '10 years in SaaS product'
    }
  ];

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-800 text-black leading-tight">
              Building technology that changes lives
            </h1>
            <p className="text-xl sm:text-2xl font-400 text-gray-700 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to empower every young person in supported housing to build independent, fulfilling lives.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl sm:text-5xl font-800 text-black mb-2">{stat.number}</div>
                <div className="text-base font-500 text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Story */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto">
          <h2 className="text-4xl font-700 text-black mb-8 text-center">Our Story</h2>
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              YUTHUB was born from a simple observation: youth housing providers were spending more time on paperwork than with the young people they serve.
            </p>
            <p>
              Our founders, Sarah and James, met while volunteering at a supported housing charity in Manchester. Sarah, a former housing manager, was frustrated by outdated systems that created admin mountains. James, a software engineer, saw an opportunity to build something better.
            </p>
            <p>
              In 2019, they launched YUTHUB with a clear vision: create technology that gives time back to support workers and better outcomes for young people. Today, we support over 150 organizations across the UK, helping more than 2,500 young people build independent lives.
            </p>
            <p>
              We're still driven by that original mission: less paperwork, more caring.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-700 text-black mb-4 text-center">Our Values</h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              The principles that guide every decision we make
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <value.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-600 text-black mb-3">{value.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">
          <h2 className="text-4xl font-700 text-black mb-4 text-center">Leadership Team</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Experienced leaders combining social sector expertise with technology innovation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-600 text-black mb-1">{member.name}</h3>
                <p className="text-base text-blue-600 font-500 mb-2">{member.role}</p>
                <p className="text-sm text-gray-600">{member.background}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Impact */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <Globe className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-4xl font-700 text-black mb-6">Our Impact</h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Working with YUTHUB, our partner organizations report an average of <strong>10 hours saved per week</strong> on administration, allowing them to invest more time in direct support. Young people benefit from more consistent, personalized care that helps them achieve independence faster.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-700 text-black mb-2">23%</div>
                <div className="text-gray-600">Faster move-on to independence</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-700 text-black mb-2">98%</div>
                <div className="text-gray-600">Compliance rate maintained</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-700 text-black mb-2">89%</div>
                <div className="text-gray-600">Staff would recommend</div>
              </div>
            </div>
          </div>
        </section>

        {/* Join Us CTA */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-700 text-black mb-4">Join Our Mission</h2>
          <p className="text-lg text-gray-600 mb-8">
            We're always looking for talented people who share our passion for making a difference.
          </p>
          <a
            href="/careers"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Open Positions
          </a>
        </section>
      </div>
    </PublicPageLayout>
  );
};

export default About;
