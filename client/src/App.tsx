import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import PageLoader from './components/common/PageLoader';
import { DashboardShell } from './components/dashboard-shell';
import { AccessibilityProvider } from './components/providers/AccessibilityProvider';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './components/providers/LanguageProvider';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Help = lazy(() => import('./pages/Help'));
const PlatformAdmin = lazy(() => import('./pages/PlatformAdmin'));
const Reports = lazy(() => import('./pages/Reports'));
const Financials = lazy(() => import('./pages/Financials'));

// New dashboard subpages
const Residents = lazy(() => import('./pages/dashboard/Residents'));
const ResidentIntake = lazy(() => import('./pages/dashboard/ResidentIntake'));
const SupportPlans = lazy(() => import('./pages/dashboard/SupportPlans'));
const Properties = lazy(() => import('./pages/dashboard/Properties'));
const PropertyRegistration = lazy(() => import('./pages/dashboard/PropertyRegistration'));
const ComplianceSafeguarding = lazy(() => import('./pages/dashboard/ComplianceSafeguarding'));
const IncidentReport = lazy(() => import('./pages/dashboard/IncidentReport'));
const ProgressTracking = lazy(() => import('./pages/dashboard/ProgressTracking'));
const ReportsAnalytics = lazy(() => import('./pages/dashboard/ReportsAnalytics'));
const SettingsAccount = lazy(() => import('./pages/dashboard/SettingsAccount'));
const SettingsBilling = lazy(() => import('./pages/dashboard/SettingsBilling'));
const TeamManagement = lazy(() => import('./pages/Settings/TeamManagement'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const Landing = lazy(() => import('./pages/Landing'));
const Features = lazy(() => import('./pages/Features'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const TestimonialsPage = lazy(() => import('./pages/Testimonials'));
const PlatformOverview = lazy(() => import('./pages/PlatformOverview'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Accessibility = lazy(() => import('./pages/Accessibility'));
const Cookies = lazy(() => import('./pages/Cookies'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const Security = lazy(() => import('./pages/Security'));
const Status = lazy(() => import('./pages/Status'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Careers = lazy(() => import('./pages/Careers'));
const Contact = lazy(() => import('./pages/Contact'));
const GDPR = lazy(() => import('./pages/GDPR'));
const AuthLogin = lazy(() => import('./pages/AuthLogin'));
const NotFound = lazy(() => import('./pages/not-found'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      // suspense: false, // removed as not valid option
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <TooltipProvider>
                  <Router future={{ v7_relativeSplatPath: true }}>
                    {/* Skip link for accessibility */}
                    <a
                      href='#main-content'
                      className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-primary-foreground'
                    >
                      Skip to main content
                    </a>

                    <div id='main-content' tabIndex={-1}>
                      <Suspense
                        fallback={
                          <PageLoader message='Loading application...' />
                        }
                      >
                        <Routes>
                          {/* Public routes */}
                          <Route
                            path='/'
                            element={
                              <PublicRoute>
                                <Landing />
                              </PublicRoute>
                            }
                          />
                          <Route
                            path='/login'
                            element={
                              <PublicRoute>
                                <AuthLogin mode='signin' />
                              </PublicRoute>
                            }
                          />
                          <Route
                            path='/signup'
                            element={
                              <PublicRoute>
                                <AuthLogin mode='signup' />
                              </PublicRoute>
                            }
                          />
                          <Route path='/features' element={<Features />} />
                          <Route path='/how-it-works' element={<HowItWorks />} />
                          <Route path='/testimonials' element={<TestimonialsPage />} />
                          <Route path='/platform' element={<PlatformOverview />} />
                          <Route path='/pricing' element={<Pricing />} />
                          <Route path='/privacy' element={<Privacy />} />
                          <Route path='/terms' element={<Terms />} />
                          <Route path='/accessibility' element={<Accessibility />} />
                          <Route path='/cookies' element={<Cookies />} />
                          <Route path='/subscribe' element={<Subscribe />} />
                          <Route path='/security' element={<Security />} />
                          <Route path='/status' element={<Status />} />
                          <Route path='/about' element={<About />} />
                          <Route path='/blog' element={<Blog />} />
                          <Route path='/careers' element={<Careers />} />
                          <Route path='/contact' element={<Contact />} />
                          <Route path='/gdpr' element={<GDPR />} />

                          {/* Protected application routes */}
                          <Route
                            path='/app'
                            element={
                              <ProtectedRoute>
                                <DashboardShell />
                              </ProtectedRoute>
                            }
                          >
                            <Route
                              index
                              element={<Navigate to='/app/dashboard' replace />}
                            />
                            <Route path='dashboard' element={<Dashboard />} />

                            {/* Residents Routes */}
                            <Route path='dashboard/residents' element={<Residents />} />
                            <Route path='dashboard/residents/intake' element={<ResidentIntake />} />
                            <Route path='dashboard/residents/support-plans' element={<SupportPlans />} />

                            {/* Properties Routes */}
                            <Route path='dashboard/properties' element={<Properties />} />
                            <Route path='dashboard/properties/register' element={<PropertyRegistration />} />

                            {/* Compliance Routes */}
                            <Route path='dashboard/compliance/safeguarding' element={<ComplianceSafeguarding />} />
                            <Route path='dashboard/compliance/incidents' element={<IncidentReport />} />
                            <Route path='dashboard/compliance/progress' element={<ProgressTracking />} />

                            {/* Reports Routes */}
                            <Route path='dashboard/reports' element={<Reports />} />
                            <Route path='dashboard/reports/analytics' element={<ReportsAnalytics />} />
                            <Route path='dashboard/reports/financials' element={<Financials />} />

                            {/* Settings Routes */}
                            <Route path='dashboard/settings/account' element={<SettingsAccount />} />
                            <Route path='dashboard/settings/billing' element={<SettingsBilling />} />
                            <Route path='dashboard/settings/team' element={<TeamManagement />} />

                            {/* Access Denied */}
                            <Route path='access-denied' element={<AccessDenied />} />

                            {/* Help & Support */}
                            <Route path='help' element={<Help />} />
                          </Route>

                          {/* Platform admin routes */}
                          <Route
                            path='/platform-admin/*'
                            element={
                              <ProtectedRoute requiredRole='platform-admin'>
                                <PlatformAdmin />
                              </ProtectedRoute>
                            }
                          />

                          {/* Catch all route */}
                          <Route path='*' element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </div>

                    <Toaster />
                    <Sonner />
                  </Router>
                </TooltipProvider>
              </AuthProvider>
            </QueryClientProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
