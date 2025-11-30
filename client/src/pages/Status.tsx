import React from 'react';
import { PublicPageLayout } from '../components/PageLayout';
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

const Status: React.FC = () => {
  const services = [
    { name: 'Core Application', status: 'operational', uptime: '99.98%' },
    { name: 'API Services', status: 'operational', uptime: '99.99%' },
    { name: 'Database', status: 'operational', uptime: '99.97%' },
    { name: 'File Storage', status: 'operational', uptime: '99.95%' },
    { name: 'Mobile App', status: 'operational', uptime: '99.96%' },
    { name: 'Email Notifications', status: 'operational', uptime: '99.93%' }
  ];

  const incidents = [
    {
      date: '2025-01-15',
      title: 'Resolved - API Latency Issue',
      description: 'Temporary increase in API response times. Resolved by scaling infrastructure.',
      duration: '23 minutes',
      status: 'resolved'
    },
    {
      date: '2024-12-10',
      title: 'Resolved - Database Maintenance',
      description: 'Scheduled maintenance completed successfully with no data loss.',
      duration: '2 hours',
      status: 'resolved'
    }
  ];

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-600">All Systems Operational</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-800 text-black leading-tight">
              System Status
            </h1>
            <p className="text-xl sm:text-2xl font-400 text-gray-700 max-w-3xl mx-auto">
              Real-time status and uptime metrics for all YUTHUB services
            </p>
          </div>
        </section>

        {/* Current Status */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-700 text-black">Service Status</h2>
              <p className="text-gray-600 mt-2">Current operational status of all platform services</p>
            </div>
            <div className="divide-y divide-gray-200">
              {services.map((service, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="text-lg font-600 text-black">{service.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{service.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-green-600 font-600">
                      <TrendingUp className="w-4 h-4" />
                      {service.uptime}
                    </div>
                    <p className="text-sm text-gray-500">30-day uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Uptime Stats */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
              <div className="text-4xl font-800 text-black mb-2">99.97%</div>
              <div className="text-gray-600 font-500">Overall Uptime</div>
              <div className="text-sm text-gray-500 mt-1">Last 12 months</div>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
              <div className="text-4xl font-800 text-black mb-2">&lt;100ms</div>
              <div className="text-gray-600 font-500">Average Response</div>
              <div className="text-sm text-gray-500 mt-1">API latency</div>
            </div>
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
              <div className="text-4xl font-800 text-black mb-2">2</div>
              <div className="text-gray-600 font-500">Incidents</div>
              <div className="text-sm text-gray-500 mt-1">Last 90 days</div>
            </div>
          </div>
        </section>

        {/* Incident History */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-700 text-black">Incident History</h2>
              <p className="text-gray-600 mt-2">Recent incidents and their resolutions</p>
            </div>
            <div className="divide-y divide-gray-200">
              {incidents.map((incident, idx) => (
                <div key={idx} className="p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-600 text-black">{incident.title}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-600 rounded uppercase">
                          {incident.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{incident.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {incident.duration}
                        </span>
                        <span>{incident.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscribe to Updates */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-700 text-black mb-4">Stay Informed</h2>
          <p className="text-lg text-gray-600 mb-8">
            Subscribe to receive notifications about system status and planned maintenance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button className="px-6 py-3 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </section>
      </div>
    </PublicPageLayout>
  );
};

export default Status;
