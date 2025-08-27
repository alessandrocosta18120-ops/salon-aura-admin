import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Users, Scissors, Settings, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Profissionais Ativos",
      value: "12",
      description: "3 novos este mês",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Serviços Cadastrados",
      value: "28",
      description: "5 atualizados",
      icon: Scissors,
      color: "text-success",
    },
    {
      title: "Agendamentos Hoje",
      value: "45",
      description: "87% ocupação",
      icon: TrendingUp,
      color: "text-warning",
    },
  ];

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
      title: "Configurações Gerais",
      description: "Ajuste notificações, integrações e mais",
      icon: Settings,
      action: () => navigate("/dashboard/settings"),
      color: "from-warning to-warning",
    },
  ];

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
          <Card key={stat.title} className="shadow-md">
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
            </CardContent>
          </Card>
        ))}
      </div>

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