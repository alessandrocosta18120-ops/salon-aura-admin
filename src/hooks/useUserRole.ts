// Hook for managing user roles
import { useState, useEffect, useCallback } from 'react';
import { sessionManager } from '@/lib/session';

export type UserRole = 'admin' | 'manager' | 'staff';

interface UseUserRoleReturn {
  role: UserRole | null;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  canManageUsers: boolean;
  canAccessAllMenus: boolean;
  canOnlyAccessOwnData: boolean;
  setRole: (role: UserRole) => void;
}

export const useUserRole = (): UseUserRoleReturn => {
  const [role, setRoleState] = useState<UserRole | null>(null);

  useEffect(() => {
    const session = sessionManager.get();
    if (session?.role) {
      setRoleState(session.role as UserRole);
    }
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    const session = sessionManager.get();
    if (session) {
      sessionManager.save({ ...session, role: newRole });
    }
  }, []);

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isStaff = role === 'staff';

  return {
    role,
    isAdmin,
    isManager,
    isStaff,
    canManageUsers: isAdmin,
    canAccessAllMenus: isAdmin || isManager,
    canOnlyAccessOwnData: isStaff,
    setRole,
  };
};
