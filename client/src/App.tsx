import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

// Page imports
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Housing from '@/pages/Housing';
import Safeguarding from '@/pages/Safeguarding';
import Support from '@/pages/Support';
import Independence from '@/pages/Independence';
import Crisis from '@/pages/Crisis';
import Reports from '@/pages/Reports';
import Analytics from '@/pages/Analytics';
import Forms from '@/pages/Forms';
import Help from '@/pages/Help';
import Settings from '@/pages/Settings';
import Financials from '@/pages/Financials';
import Billing from '@/pages/Billing';
import PlatformAdmin from '@/pages/PlatformAdmin';
import Pricing from '@/pages/Pricing';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Cookies from '@/pages/Cookies';
import Accessibility from '@/pages/Accessibility';
import NotFound from '@/pages/not-found';
import AuthLogin from '@/pages/AuthLogin';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<AuthLogin mode="signup" />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/accessibility" element={<Accessibility />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/housing" element={<Housing />} />
              <Route path="/safeguarding" element={<Safeguarding />} />
              <Route path="/support" element={<Support />} />
              <Route path="/independence" element={<Independence />} />
              <Route path="/crisis" element={<Crisis />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/forms" element={<Forms />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/platform-admin" element={<PlatformAdmin />} />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
          <Route path="/forms/incident-report" component={IncidentReport} />
          <Route path="/forms/progress-tracking" component={ProgressTracking} />
          <Route path="/forms/support-plan" component={SupportPlan} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/cookies" component={Cookies} />
          <Route path="/accessibility" component={Accessibility} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <a href="#main-content" className="absolute left-[-10000px] top-auto w-1 h-1 overflow-hidden focus:left-4 focus:top-4 focus:w-auto focus:h-auto focus:overflow-visible bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-primary-foreground">
                  Skip to main content
                </a>
                <Toaster />
                <div id="main-content" tabIndex={-1}>
                  <Router />
                </div>
              </TooltipProvider>
            </QueryClientProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
