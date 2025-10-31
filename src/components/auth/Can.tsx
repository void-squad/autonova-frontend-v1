import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';

interface CanProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can = ({ roles, children, fallback = null }: CanProps) => {
  const { user } = useAuth();

  if (!user || !roles.some((role) => user.roles.includes(role))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
