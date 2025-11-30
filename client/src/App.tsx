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
const DashboardExample = lazy(() => import('./pages/DashboardExample'));
const Housing = lazy(() => import('./pages/Housing'));
const Support = lazy(() => import('./pages/Support'));
const Independence = lazy(() => import('./pages/Independence'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Safeguarding = lazy(() => import('./pages/Safeguarding'));
const Crisis = lazy(() => import('./pages/Crisis'));
const Financials = lazy(() => import('./pages/Financials'));
const Billing = lazy(() => import('./pages/Billing'));
const Forms = lazy(() => import('./pages/Forms'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Help = lazy(() => import('./pages/Help'));
const PlatformAdmin = lazy(() => import('./pages/PlatformAdmin'));
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
// NotFound page will be created if needed
const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-gray-600">Page not found</p>
    </div>
  </div>
);

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
                  <Router>
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
                            <Route path='dashboard-example' element={<DashboardExample />} />
                            <Route path='housing' element={<Housing />} />
                            <Route path='support' element={<Support />} />
                            <Route
                              path='independence'
                              element={<Independence />}
                            />
                            <Route path='analytics' element={<Analytics />} />
                            <Route
                              path='safeguarding'
                              element={<Safeguarding />}
                            />
                            <Route path='crisis' element={<Crisis />} />
                            <Route path='financials' element={<Financials />} />
                            <Route path='billing' element={<Billing />} />
                            <Route path='forms/*' element={<Forms />} />
                            <Route path='reports' element={<Reports />} />
                            <Route path='settings/*' element={<Settings />} />
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
