import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import Subscribe from "@/pages/Subscribe";
import PropertyRegistration from "@/pages/forms/PropertyRegistration";
import ResidentIntake from "@/pages/forms/ResidentIntake";
import IncidentReport from "@/pages/forms/IncidentReport";
import ProgressTracking from "@/pages/forms/ProgressTracking";
import SupportPlan from "@/pages/forms/SupportPlan";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/pricing" component={Pricing} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/subscribe" component={Subscribe} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
