import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from '@/context/AppContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import SplashScreen from '@/components/SplashScreen';
import AppLayout from '@/components/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import ApartmentsPage from '@/pages/ApartmentsPage';
import BillingPage from '@/pages/BillingPage';
import ReportsPage from '@/pages/ReportsPage';
import LoginPage from '@/pages/LoginPage';
import PendingApprovalPage from '@/pages/PendingApprovalPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import UserManagementPage from '@/pages/UserManagementPage';
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const { user, loading, isApproved, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!isApproved && !isAdmin) {
    return <PendingApprovalPage />;
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/apartments" element={<ApartmentsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            {isAdmin && <Route path="/users" element={<UserManagementPage />} />}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AuthenticatedApp />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
