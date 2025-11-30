import React from 'react';
import { PublicPageLayout } from '../components/PageLayout';
import { Briefcase, MapPin, Clock, Heart, Users, TrendingUp, Coffee, Laptop } from 'lucide-react';

const Careers: React.FC = () => {
  const openings = [
    {
      title: 'Senior Full Stack Engineer',
      location: 'Remote (UK)',
      type: 'Full-time',
      department: 'Engineering',
      description: 'Build features that directly impact young people\'s lives. Work with React, Node.js, and PostgreSQL.'
    },
    {
      title: 'Product Manager',
      location: 'London / Remote',
      type: 'Full-time',
      department: 'Product',
      description: 'Shape the roadmap for a platform used by hundreds of organizations across the UK.'
    },
    {
      title: 'Customer Success Manager',
      location: 'Manchester / Remote',
      type: 'Full-time',
      department: 'Customer Success',
      description: 'Help housing providers get the most value from YUTHUB. Social sector experience essential.'
    },
    {
      title: 'UX/UI Designer',
      location: 'Remote (UK)',
      type: 'Full-time',
      department: 'Design',
      description: 'Design intuitive, accessible interfaces for support workers and young people.'
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: 'Meaningful Work',
      description: 'Every line of code, every design, every customer interaction helps young people build better futures.'
    },
    {
      icon: Laptop,
      title: 'Remote First',
      description: 'Work from anywhere in the UK with flexible hours. Office space in London and Manchester if you need it.'
    },
    {
      icon: TrendingUp,
      title: 'Professional Growth',
      description: '£2,000 annual learning budget, conference attendance, and mentorship opportunities.'
    },
    {
      icon: Coffee,
      title: 'Work-Life Balance',
      description: '25 days holiday plus bank holidays, flexible working, and no expectation of out-of-hours work.'
    },
    {
      icon: Users,
      title: 'Inclusive Culture',
      description: 'Diverse team with strong values around inclusion, psychological safety, and belonging.'
    },
    {
      icon: Heart,
      title: 'Competitive Package',
      description: 'Market-rate salaries, pension contributions, private healthcare, and equity options.'
    }
  ];

  const values = [
    'Put young people first in every decision',
    'Build with empathy and understanding',
    'Ship quality over quantity',
    'Default to transparency',
    'Support each other\'s growth',
    'Celebrate wins, learn from failures'
  ];

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-800 text-black leading-tight">
              Join Our Mission
            </h1>
            <p className="text-xl sm:text-2xl font-400 text-gray-700 max-w-3xl mx-auto leading-relaxed">
              We're building technology that helps young people build independent, fulfilling lives. Come help us make a difference.
            </p>
          </div>
        </section>

        {/* Why YUTHUB */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-700 text-black mb-4 text-center">Why Work at YUTHUB?</h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              Do the best work of your career while making a real social impact
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-600 text-black mb-3">{benefit.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto">
          <h2 className="text-4xl font-700 text-black mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((value, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-700">
                  ✓
                </div>
                <p className="text-lg text-gray-700">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">
          <h2 className="text-4xl font-700 text-black mb-12 text-center">Open Positions</h2>
          <div className="space-y-6">
            {openings.map((job, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-600 text-black">{job.title}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-600 rounded-full">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Don't See a Fit */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-white p-12 rounded-2xl border border-blue-200 text-center">
            <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-700 text-black mb-4">Don't See the Perfect Role?</h2>
            <p className="text-lg text-gray-600 mb-8">
              We're always interested in hearing from talented people who share our mission. Send us your CV and tell us what you'd love to work on.
            </p>
            <a
              href="mailto:careers@yuthub.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </section>

        {/* Hiring Process */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-700 text-black mb-12 text-center">Our Hiring Process</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-700 text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-600 text-black mb-2">Application Review</h3>
                  <p className="text-gray-600">We review every application carefully. You'll hear back within 5 working days.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-700 text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-600 text-black mb-2">Initial Call</h3>
                  <p className="text-gray-600">30-minute video chat to discuss your experience and answer your questions.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-700 text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-600 text-black mb-2">Skills Assessment</h3>
                  <p className="text-gray-600">A practical task relevant to the role. We respect your time - max 2-3 hours.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-700 text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-600 text-black mb-2">Team Interviews</h3>
                  <p className="text-gray-600">Meet the team you'd be working with. Usually 2-3 conversations.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-700 text-xl">
                  5
                </div>
                <div>
                  <h3 className="text-xl font-600 text-black mb-2">Offer & Onboarding</h3>
                  <p className="text-gray-600">If it's a match, we'll make an offer and help you get started smoothly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicPageLayout>
  );
};

export default Careers;
