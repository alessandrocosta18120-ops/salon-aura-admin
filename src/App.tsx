import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SalonManagement from "./pages/SalonManagement";
import ProfessionalsManagement from "./pages/ProfessionalsManagement";
import ProfessionalForm from "./pages/ProfessionalForm";
import ServicesManagement from "./pages/ServicesManagement";
import ServiceForm from "./pages/ServiceForm";
import Settings from "./pages/Settings";
import ClientsManagement from "./components/ClientsManagement";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import TimeBlocks from "./pages/TimeBlocks";
import FinancialSettings from "./pages/FinancialSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="salon" element={<SalonManagement />} />
            <Route path="professionals" element={<ProfessionalsManagement />} />
            <Route path="professionals/new" element={<ProfessionalForm />} />
            <Route path="professionals/edit/:id" element={<ProfessionalForm />} />
            <Route path="services" element={<ServicesManagement />} />
            <Route path="services/new" element={<ServiceForm />} />
            <Route path="services/edit/:id" element={<ServiceForm />} />
            <Route path="clients" element={<ClientsManagement onBack={() => window.history.back()} />} />
            <Route path="time-blocks" element={<TimeBlocks />} />
            <Route path="financial" element={<FinancialSettings />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/" element={<Login />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
