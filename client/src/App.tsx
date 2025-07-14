import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AccessibilityProvider } from "@/components/providers/AccessibilityProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ErrorBoundary } from "@/components/design-system/ErrorHandling";
import { LoadingWrapper } from "@/components/design-system/LoadingStates";
import Dashboard from "@/pages/Dashboard";
import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import Subscribe from "@/pages/Subscribe";
import Housing from "@/pages/Housing";
import Support from "@/pages/Support";
import Independence from "@/pages/Independence";
import Analytics from "@/pages/Analytics";
import Safeguarding from "@/pages/Safeguarding";
import Crisis from "@/pages/Crisis";
import Financials from "@/pages/Financials";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import Login from "@/pages/Login";
import PropertyRegistration from "@/pages/forms/PropertyRegistration";
import ResidentIntake from "@/pages/forms/ResidentIntake";
import IncidentReport from "@/pages/forms/IncidentReport";
import ProgressTracking from "@/pages/forms/ProgressTracking";
import SupportPlan from "@/pages/forms/SupportPlan";
import Forms from "@/pages/Forms";
import Reports from "@/pages/Reports";
import Billing from "@/pages/Billing";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingWrapper loading={true} />;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/housing" component={Housing} />
          <Route path="/support" component={Support} />
          <Route path="/independence" component={Independence} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/safeguarding" component={Safeguarding} />
          <Route path="/crisis" component={Crisis} />
          <Route path="/financials" component={Financials} />
          <Route path="/settings" component={Settings} />
          <Route path="/help" component={Help} />
          <Route path="/forms" component={Forms} />
          <Route path="/reports" component={Reports} />
          <Route path="/billing" component={Billing} />
          <Route path="/forms/property-registration" component={PropertyRegistration} />
          <Route path="/forms/resident-intake" component={ResidentIntake} />
          <Route path="/forms/incident-report" component={IncidentReport} />
          <Route path="/forms/progress-tracking" component={ProgressTracking} />
          <Route path="/forms/support-plan" component={SupportPlan} />
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
                <a href="#main-content" className="skip-link">
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
