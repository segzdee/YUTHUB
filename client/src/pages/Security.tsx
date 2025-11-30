import React from 'react';
import { PublicPageLayout } from '../components/PageLayout';
import { Shield, Lock, Eye, Server, FileCheck, AlertTriangle, CheckCircle } from 'lucide-react';

const Security: React.FC = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'ISO 27001 Certified',
      description: 'Our information security management system meets international standards for protecting sensitive data.'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.'
    },
    {
      icon: Eye,
      title: 'GDPR Compliant',
      description: 'Full compliance with UK GDPR and Data Protection Act 2018, ensuring resident data protection.'
    },
    {
      icon: Server,
      title: 'UK Data Residency',
      description: 'All data is stored exclusively in UK data centers, never leaving British jurisdiction.'
    },
    {
      icon: FileCheck,
      title: 'Regular Security Audits',
      description: 'Quarterly penetration testing and annual third-party security assessments.'
    },
    {
      icon: AlertTriangle,
      title: 'Incident Response',
      description: '24/7 security monitoring with immediate incident response and notification protocols.'
    }
  ];

  const compliance = [
    'ISO 27001:2013',
    'Cyber Essentials Plus',
    'UK GDPR',
    'Data Protection Act 2018',
    'Ofsted Data Security',
    'NHS Data Security Standards'
  ];

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-800 text-black leading-tight">
              Security & Compliance
            </h1>
            <p className="text-xl sm:text-2xl font-400 text-gray-700 max-w-3xl mx-auto">
              Enterprise-grade security protecting the most sensitive data in youth housing
            </p>
          </div>
        </section>

        {/* Security Features */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-600 text-black mb-3">{feature.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Badges */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-700 text-black mb-4">Certifications & Compliance</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meeting and exceeding industry standards for data security
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {compliance.map((cert, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex items-center justify-center text-center">
                <div>
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-600 text-gray-900">{cert}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Practices */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-white p-12 rounded-2xl border border-blue-200">
            <h2 className="text-3xl font-700 text-black mb-8">Our Security Commitment</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-600 text-black mb-2">Regular Security Training</h3>
                  <p className="text-gray-600">All team members complete monthly security awareness training and annual certification.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-600 text-black mb-2">Vulnerability Management</h3>
                  <p className="text-gray-600">Continuous monitoring, automated scanning, and rapid patching of any identified vulnerabilities.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-600 text-black mb-2">Access Controls</h3>
                  <p className="text-gray-600">Multi-factor authentication, role-based access control, and principle of least privilege.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-600 text-black mb-2">Backup & Recovery</h3>
                  <p className="text-gray-600">Daily encrypted backups with 30-day retention and tested disaster recovery procedures.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Report Security Issue */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-700 text-black mb-4">Report a Security Issue</h2>
          <p className="text-lg text-gray-600 mb-8">
            If you discover a security vulnerability, please report it responsibly to our security team.
          </p>
          <a
            href="mailto:security@yuthub.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Shield className="w-5 h-5" />
            Contact Security Team
          </a>
        </section>
      </div>
    </PublicPageLayout>
  );
};

export default Security;
