import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SavedDebates from "@/pages/SavedDebates";
import DebateDetails from "@/pages/DebateDetails";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/saved" component={SavedDebates} />
      <Route path="/debate/:id" component={DebateDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
