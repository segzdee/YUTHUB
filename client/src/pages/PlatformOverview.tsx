import React from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MODULE_DESCRIPTIONS } from '../config/pricing';

type ModuleKey = keyof typeof MODULE_DESCRIPTIONS;

const modules: ModuleKey[] = ['housing', 'support', 'safeguarding', 'finance', 'independence', 'crisis'];

const PlatformOverview: React.FC = () => {
  const moduleIcons: Record<ModuleKey, string> = {
    housing: '🏠',
    support: '👥',
    safeguarding: '🛡️',
    finance: '💰',
    independence: '🚀',
    crisis: '🚨',
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <Badge variant="secondary" size="md" className="mx-auto">
              Platform Capabilities
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-700 text-black leading-tight">
              Six integrated modules,
              <br />
              infinite possibilities.
            </h1>
            <p className="text-xl sm:text-2xl font-400 text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Every tool you need to manage youth housing is built into one unified platform.
            </p>
          </div>
        </section>

        {/* Modules */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-7xl mx-auto">
          <div className="space-y-20">
            {modules.map((moduleKey, idx) => {
              const module = MODULE_DESCRIPTIONS[moduleKey];
              const isEven = idx % 2 === 0;
              const icon = moduleIcons[moduleKey];

              return (
                <div key={moduleKey} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className={`space-y-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div>
                      <span className="text-5xl mb-4 block">{icon}</span>
                      <h2 className="text-4xl font-600 text-black mb-2">{module.title}</h2>
                      <p className="text-lg font-400 text-gray-600">{module.description}</p>
                    </div>

                    <div className="space-y-3">
                      {module.features.map((feature, fidx) => (
                        <div key={fidx} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-base font-400 text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Button variant="tertiary" size="md">
                        Learn more
                      </Button>
                    </div>
                  </div>

                  <div className={`${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl border border-gray-200 aspect-square flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="text-6xl">{icon}</div>
                        <p className="text-gray-500 font-400">Interface Preview</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Demo Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-gradient-to-br from-black to-gray-800 rounded-2xl border border-gray-700 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    <p className="text-white text-sm font-500">Watch 3-minute demo</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-600 text-black mb-4">
                    See it in action
                  </h2>
                  <p className="text-xl font-400 text-gray-600 leading-relaxed">
                    Get a guided walkthrough of YUTHUB's core features. Watch how our customers streamline their daily operations and improve outcomes for young people.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { num: '1', title: 'Dashboard Overview', desc: 'See all critical information at a glance' },
                    { num: '2', title: 'Resident Management', desc: 'Create and manage comprehensive resident profiles' },
                    { num: '3', title: 'Reporting & Analytics', desc: 'Generate insights and track organizational impact' },
                  ].map((item) => (
                    <div key={item.num} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-accent-600 font-600">{item.num}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-600 text-black mb-1">{item.title}</h3>
                        <p className="text-base font-400 text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="primary" size="lg">
                  Start 30-day trial
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl sm:text-5xl font-600 text-black">
              Ready to transform your operations?
            </h2>
            <p className="text-xl font-400 text-gray-600">
              All modules are included in every plan. No hidden features or paid add-ons.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg">
                Get started
              </Button>
              <Button variant="secondary" size="lg">
                Schedule demo
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default PlatformOverview;
