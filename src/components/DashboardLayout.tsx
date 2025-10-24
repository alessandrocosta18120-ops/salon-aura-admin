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
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { salonApi } from "@/lib/api";

const menuItems = [
  { title: "Agendamento Hoje", url: "/dashboard", icon: CalendarDays },
  { title: "Configurar Salão", url: "/dashboard/salon", icon: Store },
  { title: "Gerenciar Profissionais", url: "/dashboard/professionals", icon: Users },
  { title: "Cadastrar Serviços", url: "/dashboard/services", icon: Scissors },
  { title: "Administrar Clientes", url: "/dashboard/clients", icon: UserCog },
  { title: "Configurações", url: "/dashboard/settings", icon: Settings },
];

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary text-primary-foreground font-medium"
      : "text-foreground hover:bg-muted/50";

  const handleLogout = () => {
    navigate("/login");
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

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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