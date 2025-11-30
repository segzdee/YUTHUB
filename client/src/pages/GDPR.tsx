import React from 'react';
import { PublicPageLayout } from '../components/PageLayout';
import { Shield, FileText, UserCheck, Lock, Eye, Download, Trash2, AlertCircle } from 'lucide-react';

const GDPR: React.FC = () => {
  const rights = [
    {
      icon: Eye,
      title: 'Right to Access',
      description: 'Request a copy of all personal data we hold about you.',
      action: 'Submit an access request to dpo@yuthub.com'
    },
    {
      icon: FileText,
      title: 'Right to Rectification',
      description: 'Request corrections to inaccurate or incomplete data.',
      action: 'Contact us to update your information'
    },
    {
      icon: Trash2,
      title: 'Right to Erasure',
      description: 'Request deletion of your personal data (subject to legal obligations).',
      action: 'Submit a deletion request to dpo@yuthub.com'
    },
    {
      icon: Lock,
      title: 'Right to Restriction',
      description: 'Request limitation on how we process your data.',
      action: 'Contact us to restrict processing'
    },
    {
      icon: Download,
      title: 'Right to Data Portability',
      description: 'Receive your data in a machine-readable format.',
      action: 'Request a data export'
    },
    {
      icon: AlertCircle,
      title: 'Right to Object',
      description: 'Object to processing based on legitimate interests.',
      action: 'Submit an objection to dpo@yuthub.com'
    }
  ];

  const dataTypes = [
    {
      category: 'Identity Data',
      examples: 'Name, username, title, date of birth',
      purpose: 'User identification and account management',
      retention: 'Duration of account + 6 years'
    },
    {
      category: 'Contact Data',
      examples: 'Email, phone number, postal address',
      purpose: 'Communication and service delivery',
      retention: 'Duration of account + 1 year'
    },
    {
      category: 'Technical Data',
      examples: 'IP address, browser type, device info',
      purpose: 'Security, fraud prevention, analytics',
      retention: '90 days'
    },
    {
      category: 'Usage Data',
      examples: 'Pages visited, features used, time spent',
      purpose: 'Service improvement and analytics',
      retention: '2 years'
    },
    {
      category: 'Young Person Data',
      examples: 'Support plans, assessments, case notes',
      purpose: 'Care provision and statutory compliance',
      retention: 'As per regulatory requirements (typically 25 years)'
    }
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
              GDPR Compliance
            </h1>
            <p className="text-xl sm:text-2xl font-400 text-gray-700 max-w-3xl mx-auto">
              Your data rights under the UK General Data Protection Regulation
            </p>
          </div>
        </section>

        {/* Overview */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-700 text-black mb-4">Our Commitment to Data Protection</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              YUTHUB is fully compliant with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. We are committed to protecting the privacy and security of personal data for all our users, including young people in care, support workers, and organizational administrators.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This page explains your data protection rights and how we fulfill our obligations under UK data protection law.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">
          <h2 className="text-4xl font-700 text-black mb-4 text-center">Your Data Protection Rights</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Under UK GDPR, you have the following rights regarding your personal data
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rights.map((right, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <right.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-600 text-black mb-3">{right.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{right.description}</p>
                <p className="text-sm text-blue-600 font-500">{right.action}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data We Collect */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-700 text-black mb-12 text-center">What Data We Collect & Why</h2>
            <div className="space-y-6">
              {dataTypes.map((data, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <h3 className="text-lg font-600 text-black mb-2">{data.category}</h3>
                      <p className="text-sm text-gray-600">{data.examples}</p>
                    </div>
                    <div className="lg:col-span-2">
                      <h4 className="text-sm font-600 text-gray-700 mb-1">Purpose</h4>
                      <p className="text-sm text-gray-600">{data.purpose}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-600 text-gray-700 mb-1">Retention Period</h4>
                      <p className="text-sm text-gray-600">{data.retention}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Legal Basis */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-700 text-black mb-8 text-center">Legal Basis for Processing</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-600 text-black mb-3">Contractual Necessity</h3>
              <p className="text-gray-600">
                We process data to provide the YUTHUB service as per our contract with your organization.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-600 text-black mb-3">Legal Obligation</h3>
              <p className="text-gray-600">
                We process data to comply with Ofsted requirements, safeguarding laws, and other regulatory obligations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-600 text-black mb-3">Legitimate Interests</h3>
              <p className="text-gray-600">
                We process data to improve our services, prevent fraud, and ensure platform security.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-600 text-black mb-3">Consent</h3>
              <p className="text-gray-600">
                Where required, we obtain explicit consent before processing sensitive data, which you can withdraw at any time.
              </p>
            </div>
          </div>
        </section>

        {/* Data Protection Officer */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <UserCheck className="w-12 h-12 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-700 text-black mb-6">Contact Our Data Protection Officer</h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              If you have questions about how we handle your data or wish to exercise any of your rights, please contact our Data Protection Officer:
            </p>
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm inline-block">
              <p className="text-lg font-600 text-black mb-2">Data Protection Officer</p>
              <p className="text-gray-600 mb-1">YUTHUB Limited</p>
              <p className="text-gray-600 mb-1">123 Tech Street, London EC2A 4NE</p>
              <a href="mailto:dpo@yuthub.com" className="text-blue-600 font-600 hover:underline">
                dpo@yuthub.com
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-8">
              We aim to respond to all data protection requests within 30 days.
            </p>
          </div>
        </section>

        {/* Complaints */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-700 text-black mb-6 text-center">Right to Complain</h2>
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-700 leading-relaxed mb-6">
              If you're not satisfied with how we've handled your data or your data protection request, you have the right to lodge a complaint with the UK's supervisory authority:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="font-600 text-black mb-2">Information Commissioner's Office (ICO)</p>
              <p className="text-gray-600 mb-1">Wycliffe House, Water Lane</p>
              <p className="text-gray-600 mb-1">Wilmslow, Cheshire SK9 5AF</p>
              <p className="text-gray-600 mb-1">Tel: 0303 123 1113</p>
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                www.ico.org.uk
              </a>
            </div>
          </div>
        </section>

        {/* Documentation */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-700 text-black mb-6">Related Documentation</h2>
          <p className="text-lg text-gray-600 mb-8">
            For more detailed information about how we handle your data:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/privacy"
              className="px-6 py-3 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/cookies"
              className="px-6 py-3 bg-white text-blue-600 font-600 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Cookie Policy
            </a>
            <a
              href="/terms"
              className="px-6 py-3 bg-white text-blue-600 font-600 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </section>
      </div>
    </PublicPageLayout>
  );
};

export default GDPR;
