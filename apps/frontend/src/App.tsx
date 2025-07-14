import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import Dashboard from "@/pages/Dashboard";
import PatientNote from "@/pages/PatientNote";
import NewVisit from "@/pages/NewVisit";
import AddPatient from "@/pages/AddPatient";
import PatientList from "@/pages/PatientList";
import VisitList from "@/pages/VisitList";
import Profile from "@/pages/Profile";
import Templates from "@/pages/Templates";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch key={location}>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/visit/new" component={NewVisit} />
        <Route path="/visit/:id" component={PatientNote} />
        <Route path="/visits" component={VisitList} />
        <Route path="/patients" component={PatientList} />
        <Route path="/patients/add" component={AddPatient} />
        <Route path="/profile" component={Profile} />
        <Route path="/templates" component={Templates} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
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
