import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { RequireRole } from "@/components/auth/RequireRole";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SalonManagement from "./pages/SalonManagement";
import ProfessionalsManagement from "./pages/ProfessionalsManagement";
import ProfessionalForm from "./pages/ProfessionalForm";
import ProfessionalCredentials from "./pages/ProfessionalCredentials";
import ServicesManagement from "./pages/ServicesManagement";
import ServiceForm from "./pages/ServiceForm";
import Settings from "./pages/Settings";
import ClientsManagement from "./components/ClientsManagement";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import TimeBlocks from "./pages/TimeBlocks";
import FinancialSettings from "./pages/FinancialSettings";
import Appointments from "./pages/Appointments";
import UsersManagement from "./pages/UsersManagement";

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
            <Route path="appointments" element={<Appointments />} />
            <Route path="salon" element={<RequireRole allowedRoles={['admin', 'manager']}><SalonManagement /></RequireRole>} />
            <Route path="professionals" element={<RequireRole allowedRoles={['admin', 'manager']}><ProfessionalsManagement /></RequireRole>} />
            <Route path="professionals/new" element={<RequireRole allowedRoles={['admin', 'manager']}><ProfessionalForm /></RequireRole>} />
            <Route path="professionals/edit/:id" element={<RequireRole allowedRoles={['admin', 'manager']}><ProfessionalForm /></RequireRole>} />
            <Route path="professionals/credentials/:professionalId" element={<RequireRole allowedRoles={['admin', 'manager']}><ProfessionalCredentials /></RequireRole>} />
            <Route path="services" element={<RequireRole allowedRoles={['admin', 'manager']}><ServicesManagement /></RequireRole>} />
            <Route path="services/new" element={<RequireRole allowedRoles={['admin', 'manager']}><ServiceForm /></RequireRole>} />
            <Route path="services/edit/:id" element={<RequireRole allowedRoles={['admin', 'manager']}><ServiceForm /></RequireRole>} />
            <Route path="clients" element={<RequireRole allowedRoles={['admin', 'manager']}><ClientsManagement onBack={() => window.history.back()} /></RequireRole>} />
            <Route path="time-blocks" element={<TimeBlocks />} />
            <Route path="financial" element={<RequireRole allowedRoles={['admin', 'manager']}><FinancialSettings /></RequireRole>} />
            <Route path="settings" element={<RequireRole allowedRoles={['admin', 'manager']}><Settings /></RequireRole>} />
            <Route path="users" element={<RequireRole allowedRoles={['admin']}><UsersManagement /></RequireRole>} />
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
