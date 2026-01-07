import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Building2,
  Users,
  Scissors,
  Settings,
  LogOut,
  CalendarDays,
  Store,
  UserCog,
  Shield,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { salonApi } from "@/lib/api";
import { sessionManager } from "@/lib/session";
import { Badge } from "@/components/ui/badge";

type UserRole = 'admin' | 'manager' | 'staff';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[]; // Which roles can see this menu
}

const allMenuItems: MenuItem[] = [
  { title: "Início", url: "/dashboard", icon: Building2, roles: ['admin', 'manager', 'staff'] },
  { title: "Gestão de Agendamentos", url: "/dashboard/appointments", icon: CalendarDays, roles: ['admin', 'manager', 'staff'] },
  { title: "Configurar Salão", url: "/dashboard/salon", icon: Store, roles: ['admin', 'manager'] },
  { title: "Gerenciar Profissionais", url: "/dashboard/professionals", icon: Users, roles: ['admin', 'manager'] },
  { title: "Cadastrar Serviços", url: "/dashboard/services", icon: Scissors, roles: ['admin', 'manager'] },
  { title: "Administrar Clientes", url: "/dashboard/clients", icon: UserCog, roles: ['admin', 'manager'] },
  { title: "Bloqueios de Horários e Datas", url: "/dashboard/time-blocks", icon: CalendarDays, roles: ['admin', 'manager', 'staff'] },
  { title: "Financeiro", url: "/dashboard/financial", icon: Settings, roles: ['admin', 'manager'] },
  { title: "Configurações", url: "/dashboard/settings", icon: Settings, roles: ['admin', 'manager'] },
  { title: "Gerenciar Usuários", url: "/dashboard/users", icon: Shield, roles: ['admin'] },
];

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const session = sessionManager.get();
    if (session) {
      setUserRole(session.role || 'staff');
      setUserName(session.userName || '');
    }
  }, []);

  // Filter menu items based on user role
  const visibleMenuItems = allMenuItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary text-primary-foreground font-medium"
      : "text-foreground hover:bg-muted/50";

  const handleLogout = () => {
    sessionManager.clear();
    navigate("/login");
  };

  const getRoleBadgeVariant = (role: UserRole | null) => {
    switch (role) {
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      case 'staff': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: UserRole | null) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Gerente';
      case 'staff': return 'Profissional';
      default: return '';
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <p className="font-semibold text-sm">Painel Administrativo</p>
                <p className="text-xs text-muted-foreground">datebook.com.br</p>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        {!isCollapsed && userName && (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
              </div>
              {userRole && (
                <Badge variant={getRoleBadgeVariant(userRole)} className="text-xs">
                  {getRoleLabel(userRole)}
                </Badge>
              )}
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!isCollapsed && "Sair"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

const DashboardLayout = () => {
  const [salonName, setSalonName] = useState<string>("");

  useEffect(() => {
    const loadSalonName = async () => {
      try {
        const response = await salonApi.get();
        if (response.success && response.data) {
          setSalonName(response.data.name || "");
        }
      } catch (error) {
        console.error("Erro ao carregar nome do salão:", error);
      }
    };
    loadSalonName();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="font-semibold">Painel Administrativo</h1>
            </div>
            {salonName && (
              <div className="font-medium text-sm">{salonName}</div>
            )}
          </header>
          <main className="flex-1 p-6 bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
