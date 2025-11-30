import React from 'react';
import { PublicPageLayout } from '../components/PageLayout';
import { Mail, Phone, MapPin, MessageSquare, Clock, HelpCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'General inquiries and support',
      contact: 'hello@yuthub.com',
      link: 'mailto:hello@yuthub.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Mon-Fri, 9am-5pm GMT',
      contact: '+44 (0) 20 1234 5678',
      link: 'tel:+442012345678'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Quick questions and instant help',
      contact: 'Available 9am-5pm',
      link: '#'
    }
  ];

  const departments = [
    {
      name: 'Sales',
      email: 'sales@yuthub.com',
      description: 'Product demos and pricing information'
    },
    {
      name: 'Support',
      email: 'support@yuthub.com',
      description: 'Technical help and account assistance'
    },
    {
      name: 'Partnerships',
      email: 'partners@yuthub.com',
      description: 'Integration and collaboration opportunities'
    },
    {
      name: 'Careers',
      email: 'careers@yuthub.com',
      description: 'Job applications and hiring inquiries'
    },
    {
      name: 'Security',
      email: 'security@yuthub.com',
      description: 'Report security vulnerabilities'
    },
    {
      name: 'Data Protection',
      email: 'dpo@yuthub.com',
      description: 'Privacy and GDPR inquiries'
    }
  ];

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-800 text-black leading-tight">
              Get in Touch
            </h1>
            <p className="text-xl sm:text-2xl font-400 text-gray-700 max-w-3xl mx-auto">
              We're here to help. Choose the best way to reach us.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {contactMethods.map((method, idx) => (
              <a
                key={idx}
                href={method.link}
                className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-blue-600 group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-600 transition-colors">
                  <method.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-600 text-black mb-2">{method.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                <p className="text-base font-600 text-blue-600 group-hover:text-blue-700">
                  {method.contact}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 lg:p-12">
            <h2 className="text-3xl font-700 text-black mb-4 text-center">Send Us a Message</h2>
            <p className="text-gray-600 text-center mb-8">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-600 text-black mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-600 text-black mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Smith"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-600 text-black mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="john.smith@example.com"
                />
              </div>
              <div>
                <label htmlFor="organization" className="block text-sm font-600 text-black mb-2">
                  Organization (Optional)
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Youth Housing Charity"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-600 text-black mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option>General Inquiry</option>
                  <option>Sales & Pricing</option>
                  <option>Technical Support</option>
                  <option>Partnership Opportunity</option>
                  <option>Media & Press</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-600 text-black mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* Department Contacts */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">
          <h2 className="text-3xl font-700 text-black mb-12 text-center">Direct Department Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-600 text-black mb-2">{dept.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{dept.description}</p>
                <a
                  href={`mailto:${dept.email}`}
                  className="text-blue-600 font-500 hover:underline break-all"
                >
                  {dept.email}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Office Location */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-700 text-black mb-6">Our Offices</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-600 text-black mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      London Office
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      123 Tech Street<br />
                      Shoreditch<br />
                      London EC2A 4NE<br />
                      United Kingdom
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-600 text-black mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Manchester Office
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      45 Innovation Hub<br />
                      Northern Quarter<br />
                      Manchester M1 1AD<br />
                      United Kingdom
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-600 text-black mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Office Hours
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Monday - Friday: 9:00am - 5:00pm GMT<br />
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
                <p className="text-gray-500">Map placeholder</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Link */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto text-center">
          <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-700 text-black mb-4">Looking for Answers?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Check our help center for quick answers to common questions.
          </p>
          <a
            href="/help"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Visit Help Center
          </a>
        </section>
      </div>
    </PublicPageLayout>
  );
};

export default Contact;
