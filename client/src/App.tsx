import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Housing } from './pages/Housing';
import { Support } from './pages/Support';
import { Independence } from './pages/Independence';
import { Analytics } from './pages/Analytics';
import { Safeguarding } from './pages/Safeguarding';
import { Crisis } from './pages/Crisis';
import { Financials } from './pages/Financials';
import { Billing } from './pages/Billing';
import { Forms } from './pages/Forms';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { PageLoader } from './components/common/PageLoader';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/housing" element={<Housing />} />
              <Route path="/support" element={<Support />} />
              <Route path="/independence" element={<Independence />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/safeguarding" element={<Safeguarding />} />
              <Route path="/crisis" element={<Crisis />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/forms" element={<Forms />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </Layout>
          <Toaster />
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
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
