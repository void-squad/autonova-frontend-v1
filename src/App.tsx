import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RequireAuth } from "./components/auth/RequireAuth";
import DashboardLayout from "./components/layout/DashboardLayout";
import CustomerSidebar from "./components/layout/CustomerSidebar";
import EmployeeSidebar from "./components/layout/EmployeeSidebar";
import AdminSidebar from "./components/layout/AdminSidebar";
import { ProjectsStoreProvider } from "./contexts/ProjectsStore";

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuth2Callback from './pages/OAuth2Callback';
import NotFound from './pages/NotFound';

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookAppointment from "./pages/customer/book-appointment";
import MyAppointments from "./pages/customer/my-appointments";
import CustomerProjectProgress from "./pages/customer/ProjectProgress";
import VehiclesPage from "./pages/customer/vehicles";
import CustomerBilling from "./pages/customer/CustomerBilling";
import Profile from "./pages/Profile";

// Employee pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeServices from "./pages/employee/services";
import EmployeeProjects from "./pages/employee/projects";
import EmployeeTasks from "./pages/employee/tasks";
import EmployeeReports from "./pages/employee/reports";
import TimeLoggingPage from "./pages/employee/TimeLoggingPage";
import EmployeeProjectProgress from "./pages/employee/ProjectProgress";
import EmployeeBilling from "./pages/employee/EmployeeBilling";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmployees from "./pages/admin/employees";
import EmployeeDetail from "./pages/admin/employee-detail";
import AdminBilling from "./pages/admin/AdminBilling";
import { getAdminProjectRoutes } from "./pages/admin/projects";

const ProfileRoute = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();

  let sidebar: React.ReactNode | null = null;

  if (role === "ADMIN") {
    sidebar = <AdminSidebar />;
  } else if (role === "EMPLOYEE") {
    sidebar = <EmployeeSidebar />;
  } else {
    sidebar = <CustomerSidebar />;
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <Profile />
    </DashboardLayout>
  );
};

const queryClient = new QueryClient();

const App = () => {
  const adminProjectRoutes = getAdminProjectRoutes();

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

                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <ProfileRoute />
                    </RequireAuth>
                  }
                />

                {/* Test routes - Remove these in production */}
                <Route path="/test/book-appointment" element={<BookAppointment />} />
                <Route path="/test/appointments" element={<MyAppointments />} />
                <Route path="/test/progress/:projectId" element={<CustomerProjectProgress />} />
                <Route path="/test/employee/progress/:projectId" element={<EmployeeProjectProgress />} />

                {/* Customer routes */}
                <Route
                  path="/customer"
                  element={
                    <RequireAuth roles={["Customer"]}>
                      <DashboardLayout sidebar={<CustomerSidebar />} />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/customer/dashboard" replace />} />
                  <Route path="dashboard" element={<CustomerDashboard />} />
                  <Route path="book-appointment" element={<BookAppointment />} />
                  <Route path="appointments" element={<MyAppointments />} />
                  <Route path="billing" element={<CustomerBilling />} />
                  <Route path="progress/:projectId" element={<CustomerProjectProgress />} />
                  <Route path="vehicles" element={<VehiclesPage />} />
                </Route>

                {/* Employee routes */}
                <Route
                  path="/employee"
                  element={
                    <RequireAuth roles={["Employee"]}>
                      <DashboardLayout sidebar={<EmployeeSidebar />} />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/employee/dashboard" replace />} />
                  <Route path="dashboard" element={<EmployeeDashboard />} />
                  <Route path="time-logging" element={<TimeLoggingPage />} />
                  <Route path="tasks" element={<EmployeeTasks />} />
                  <Route path="services" element={<EmployeeServices />} />
                  <Route path="projects" element={<EmployeeProjects />} />
                  <Route path="projects/:projectId/progress" element={<EmployeeProjectProgress />} />
                  <Route path="reports" element={<EmployeeReports />} />
                  <Route path="billing" element={<EmployeeBilling />} />
                </Route>

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <RequireAuth roles={["Admin"]}>
                      <DashboardLayout sidebar={<AdminSidebar />} />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="employees" element={<AdminEmployees />} />
                  <Route path="employees/:id" element={<EmployeeDetail />} />
                  <Route path="billing" element={<AdminBilling />} />
                </Route>
                {adminProjectRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}

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
