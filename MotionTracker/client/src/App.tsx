import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ActivityProvider } from "@/lib/activity-context";
import { AppLayout } from "@/components/layout";
import { AnimatePresence, motion } from "framer-motion";

import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AddActivity from "@/pages/add-activity";
import Weekly from "@/pages/weekly";
import Monthly from "@/pages/monthly";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (user && !user.hasCompletedOnboarding) {
    return <Onboarding />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function AppRouter() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/login">
          <PageTransition>
            <Login />
          </PageTransition>
        </Route>
        <Route path="/onboarding">
          <PageTransition>
            <Onboarding />
          </PageTransition>
        </Route>
        <Route path="/">
          <ProtectedRoute>
            <PageTransition>
              <Dashboard />
            </PageTransition>
          </ProtectedRoute>
        </Route>
        <Route path="/add">
          <ProtectedRoute>
            <PageTransition>
              <AddActivity />
            </PageTransition>
          </ProtectedRoute>
        </Route>
        <Route path="/weekly">
          <ProtectedRoute>
            <PageTransition>
              <Weekly />
            </PageTransition>
          </ProtectedRoute>
        </Route>
        <Route path="/monthly">
          <ProtectedRoute>
            <PageTransition>
              <Monthly />
            </PageTransition>
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute>
            <PageTransition>
              <Settings />
            </PageTransition>
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <PageTransition>
              <Profile />
            </PageTransition>
          </ProtectedRoute>
        </Route>
        <Route>
          <PageTransition>
            <NotFound />
          </PageTransition>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="daily-motion-theme">
        <AuthProvider>
          <ActivityProvider>
            <TooltipProvider>
              <Toaster />
              <AppRouter />
            </TooltipProvider>
          </ActivityProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
