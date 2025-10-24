import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Users, Scissors, Settings, TrendingUp, UserPlus, Calendar } from "lucide-react";
import ClientsManagement from "@/components/ClientsManagement";
import AppointmentDetails from "@/components/AppointmentDetails";
import { appointmentApi, professionalApi, serviceApi, clientApi } from "@/lib/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'appointments'>('dashboard');
  const [stats, setStats] = useState([
    {
      title: "Profissionais Ativos",
      value: "0",
      description: "Carregando...",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Serviços Cadastrados",
      value: "0",
      description: "Carregando...",
      icon: Scissors,
      color: "text-success",
    },
    {
      title: "Agendamentos Hoje",
      value: "0",
      description: "Carregando...",
      icon: TrendingUp,
      color: "text-warning",
    },
  ]);
  const [clientsCount, setClientsCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load professionals count
      const profResponse = await professionalApi.get();
      const professionalsCount = profResponse.success && profResponse.data 
        ? profResponse.data.filter((p: any) => p.isActive).length 
        : 0;

      // Load services count
      const servResponse = await serviceApi.get();
      const servicesCount = servResponse.success && servResponse.data 
        ? servResponse.data.filter((s: any) => s.isActive).length 
        : 0;

      // Load today's appointments
      const apptResponse = await appointmentApi.getToday();
      const appointmentsToday = apptResponse.success && apptResponse.data 
        ? apptResponse.data.length 
        : 0;

      // Load clients count
      const clientResponse = await clientApi.get();
      const totalClients = clientResponse.success && clientResponse.data 
        ? clientResponse.data.length 
        : 0;

      setStats([
        {
          title: "Profissionais Ativos",
          value: professionalsCount.toString(),
          description: "Cadastrados no sistema",
          icon: Users,
          color: "text-primary",
        },
        {
          title: "Serviços Cadastrados",
          value: servicesCount.toString(),
          description: "Disponíveis para agendamento",
          icon: Scissors,
          color: "text-success",
        },
        {
          title: "Agendamentos Hoje",
          value: appointmentsToday.toString(),
          description: "Confirmados para hoje",
          icon: TrendingUp,
          color: "text-warning",
        },
      ]);

      setClientsCount(totalClients);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  };

  const quickActions = [
    {
      title: "Configurar Salão",
      description: "Atualize informações básicas, horários e contatos",
      icon: Store,
      action: () => navigate("/dashboard/salon"),
      color: "from-primary to-primary-hover",
    },
    {
      title: "Gerenciar Profissionais",
      description: "Adicione novos profissionais e configure agendas",
      icon: Users,
      action: () => navigate("/dashboard/professionals"),
      color: "from-success to-success",
    },
    {
      title: "Cadastrar Serviços",
      description: "Configure serviços, preços e durações",
      icon: Scissors,
      action: () => navigate("/dashboard/services"),
      color: "from-secondary to-secondary-hover",
    },
    {
      title: "Administrar Clientes",
      description: "Cadastre clientes com agendamentos automáticos",
      icon: UserPlus,
      action: () => navigate("/dashboard/clients"),
      color: "from-warning to-warning",
    },
    {
      title: "Configurações Gerais",
      description: "Ajuste notificações, integrações e mais",
      icon: Settings,
      action: () => navigate("/dashboard/settings"),
      color: "from-muted-foreground to-muted-foreground",
    },
  ];

  if (currentView === 'appointments') {
    return <AppointmentDetails onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do seu salão de beleza
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              if (stat.title === "Agendamentos Hoje") {
                setCurrentView('appointments');
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.title === "Agendamentos Hoje" && (
                <p className="text-xs text-primary mt-1">
                  Clique para ver detalhes
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clients Overview */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes Cadastrados
          </CardTitle>
          <CardDescription>
            Visualização rápida dos clientes do salão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{clientsCount}</p>
              <p className="text-sm text-muted-foreground">Total de clientes</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard/clients")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Ver Todos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold mb-6">Ações Rápidas</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {quickActions.map((action) => (
            <Card key={action.title} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={action.action} className="w-full">
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;