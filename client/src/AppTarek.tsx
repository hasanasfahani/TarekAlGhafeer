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

function Router() {
  return (
    <Switch>
      <Route path="/registration-form/success" component={RegistrationForm} />
      <Route path="/registration-form/failed" component={RegistrationForm} />
      <Route path="/registration-form/cancelled" component={RegistrationForm} />
      <Route path="/registration-form" component={RegistrationForm} />
      <Route path="/admin" component={AdminPortal} />
      <Route path="/main" component={Home} />
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
