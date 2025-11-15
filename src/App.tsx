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
import Help from "./pages/Help";

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
import BookAppointment from "./pages/customer/BookAppointment";
import MyAppointments from "./pages/customer/MyAppointments";
import CustomerProjectProgress from "./pages/customer/ProjectProgress";
import VehiclesPage from "./pages/customer/vehicles";
import CustomerBilling from "./pages/customer/CustomerBilling";
import Profile from "./pages/Profile";

// Employee pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeServices from "./pages/employee/services";
import EmployeeTasks from "./pages/employee/tasks";
import EmployeeReports from "./pages/employee/reports";
import TimeLoggingPage from "./pages/employee/TimeLoggingPage";
import EmployeeProjectProgress from "./pages/employee/ProjectProgress";
import EmployeeBilling from "./pages/employee/EmployeeBilling";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmployees from "./pages/admin/employees";
import EmployeeDetail from "./pages/admin/employee-detail";
import Notifications from "./pages/Notifications";
import { TimeLoggingPage as AdminTimeLoggingPage } from "./pages/admin/TimeLoggingPage";
import AdminBilling from "./pages/admin/AdminBilling";
import { getAdminProjectRoutes } from "./pages/admin/adminProjectsRoutes";
import ManageAppointments from "./pages/admin/ManageAppointments";

const getSidebarForRole = (role?: string | null) => {
  const normalized = role?.toUpperCase();
  if (normalized === "ADMIN") return <AdminSidebar />;
  if (normalized === "EMPLOYEE") return <EmployeeSidebar />;
  return <CustomerSidebar />;
};

const ProfileRoute = () => {
  const { user } = useAuth();
  const sidebar = getSidebarForRole(user?.role);

  return (
    <DashboardLayout sidebar={sidebar}>
      <Profile />
    </DashboardLayout>
  );
};

const HelpRoute = () => {
  const { user } = useAuth();
  const sidebar = getSidebarForRole(user?.role);

  return (
    <DashboardLayout sidebar={sidebar}>
      <Help />
    </DashboardLayout>
  );
};

const NotificationsRoute = () => {
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
      <Notifications />
    </DashboardLayout>
  );
};
import UserManagement from "./pages/admin/UserManagement";

const queryClient = new QueryClient();
const adminProjectRoutes = getAdminProjectRoutes();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
                <Route
                  path="/help"
                  element={
                    <RequireAuth>
                      <HelpRoute />
                    </RequireAuth>
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    <RequireAuth>
                      <NotificationsRoute />
                    </RequireAuth>
                  }
                />

                {/* Test routes - Remove these in production */}
                <Route path="/test/book-appointment" element={<BookAppointment />} />
                <Route path="/test/appointments" element={<MyAppointments />} />
                <Route path="/test/progress/:projectId" element={<CustomerProjectProgress />} />

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
                  <Route path="time-logging" element={<AdminTimeLoggingPage />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="billing" element={<AdminBilling />} />
                  {/* <Route path="billing" element={<AdminBilling />} /> */}
                  <Route path="appointments" element={<ManageAppointments />} />
                  <Route path="users" element={<UserManagement />} />
                </Route>
                {adminProjectRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
