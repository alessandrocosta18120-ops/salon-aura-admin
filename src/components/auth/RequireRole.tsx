import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sessionManager } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";

type UserRole = 'admin' | 'manager' | 'staff';

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export const RequireRole = ({ allowedRoles, children }: RequireRoleProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const session = sessionManager.get();
    
    if (!session) {
      navigate('/login');
      return;
    }

    const userRole = session.role || 'staff';
    
    if (!allowedRoles.includes(userRole)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [allowedRoles, navigate, toast]);

  const session = sessionManager.get();
  if (!session) return null;
  
  const userRole = session.role || 'staff';
  if (!allowedRoles.includes(userRole)) return null;

  return <>{children}</>;
};
