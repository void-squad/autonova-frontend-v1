import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: string[];
}

export const RequireAuth = ({ children, roles }: RequireAuthProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (roles && roles.length > 0 && user) {
    const userRole = user.role?.toUpperCase();
    const hasRequiredRole = roles.some(role => userRole === role.toUpperCase());
    
    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to their dashboard
      if (userRole === 'ADMIN') {
        return <Navigate to="/admin" replace />;
      } else if (userRole === 'EMPLOYEE') {
        return <Navigate to="/employee" replace />;
      } else {
        return <Navigate to="/customer" replace />;
      }
    }
  }

  return <>{children}</>;
};
