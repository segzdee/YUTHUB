import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/PageLoader';
import { Layout } from './components/Layout';
import { AccessibilityProvider } from './components/providers/AccessibilityProvider';
import { AuthProvider } from './components/providers/AuthProvider';
import { LanguageProvider } from './components/providers/LanguageProvider';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
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
const AuthLogin = lazy(() => import('./pages/AuthLogin'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      suspense: false,
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

                          {/* Protected application routes */}
                          <Route
                            path='/app'
                            element={
                              <ProtectedRoute>
                                <Layout />
                              </ProtectedRoute>
                            }
                          >
                            <Route
                              index
                              element={<Navigate to='/app/dashboard' replace />}
                            />
                            <Route path='dashboard' element={<Dashboard />} />
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
