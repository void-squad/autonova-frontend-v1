import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';

interface CanProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can = ({ roles, children, fallback = null }: CanProps) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const normalizedUserRole = user.role?.toUpperCase();
  const hasRole = roles.some(
    (role) => normalizedUserRole === role.toUpperCase()
  );

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
