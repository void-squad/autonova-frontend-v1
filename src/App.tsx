import { useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/auth/RequireAuth";
import DashboardLayout from "./components/layout/DashboardLayout";
import CustomerSidebar from "./components/layout/CustomerSidebar";
import EmployeeSidebar from "./components/layout/EmployeeSidebar";
import AdminSidebar from "./components/layout/AdminSidebar";
import { ProjectsStoreProvider } from "./contexts/ProjectsStore";
import { getEmployeeProjectRoutes } from "./pages/employee/projects";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuth2Callback from "./pages/OAuth2Callback";
import NotFound from "./pages/NotFound";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookAppointment from "./pages/customer/book-appointment";
import MyAppointments from "./pages/customer/my-appointments";

// Employee pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => {
  const employeeProjectRoutes = useMemo(() => getEmployeeProjectRoutes(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectsStoreProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/oauth2/callback" element={<OAuth2Callback />} />

                {/* Test routes - Remove these in production */}
                <Route path="/test/book-appointment" element={<BookAppointment />} />
                <Route path="/test/appointments" element={<MyAppointments />} />

                {/* Customer routes */}
                <Route
                  path="/customer"
                  element={
                    <RequireAuth roles={['Customer']}>
                      <DashboardLayout sidebar={<CustomerSidebar />} />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/customer/dashboard" replace />} />
                  <Route path="dashboard" element={<CustomerDashboard />} />
                  <Route path="book-appointment" element={<BookAppointment />} />
                  <Route path="appointments" element={<MyAppointments />} />
                </Route>

                {/* Employee routes */}
                <Route
                  path="/employee"
                  element={
                    <RequireAuth roles={['Employee']}>
                      <DashboardLayout sidebar={<EmployeeSidebar />} />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/employee/dashboard" replace />} />
                  <Route path="dashboard" element={<EmployeeDashboard />} />
                </Route>
                {employeeProjectRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <RequireAuth roles={['Admin']}>
                      <DashboardLayout sidebar={<AdminSidebar />} />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ProjectsStoreProvider>
      </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
