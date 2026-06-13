import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/HomeTarek";
import RegistrationForm from "@/pages/RegistrationForm";
import AdminPortal from "@/pages/AdminPortal";
import { LanguageProvider } from "@/lib/i18n";
import { isAdminHostname } from "@/lib/coach";

function LegacyMainRedirect() {
  window.location.replace("/");
  return null;
}

function Router() {
  if (isAdminHostname()) {
    return (
      <Switch>
        <Route path="/admin" component={AdminPortal} />
        <Route path="/" component={AdminPortal} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/registration-success" component={RegistrationForm} />
      <Route path="/payment-failed" component={RegistrationForm} />
      <Route path="/payment-cancelled" component={RegistrationForm} />
      <Route path="/registration-form/success" component={RegistrationForm} />
      <Route path="/registration-form/failed" component={RegistrationForm} />
      <Route path="/registration-form/cancelled" component={RegistrationForm} />
      <Route path="/registration-form" component={RegistrationForm} />
      <Route path="/main" component={LegacyMainRedirect} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Router />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
