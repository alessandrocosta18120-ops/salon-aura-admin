import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, User, Phone, MessageSquare } from "lucide-react";
import { appointmentApi } from "@/lib/api";

interface Appointment {
  id: string;
  time: string;
  clientName: string;
  clientPhone: string;
  professionalName: string;
  serviceName: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const AppointmentDetails = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendReminderToProfessional, setSendReminderToProfessional] = useState(false);

  useEffect(() => {
    loadTodayAppointments();
  }, []);

  const loadTodayAppointments = async () => {
    try {
      const response = await appointmentApi.getToday();
      if (response.success) {
        setAppointments(response.data || []);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Não foi possível carregar os agendamentos de hoje.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReminderToggle = async (checked: boolean) => {
    setSendReminderToProfessional(checked);
    
    // TODO: Save professional reminder preference
    toast({
      title: checked ? "Lembrete ativado" : "Lembrete desativado",
      description: checked 
        ? "Profissionais receberão lembretes dos agendamentos."
        : "Lembretes para profissionais foram desativados.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  // Group appointments by time
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    if (!acc[appointment.time]) {
      acc[appointment.time] = [];
    }
    acc[appointment.time].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedTimes = Object.keys(groupedAppointments).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agendamentos de Hoje</h2>
          <p className="text-muted-foreground">
            Detalhamento completo dos agendamentos do dia
          </p>
        </div>
      </div>

      {/* Professional Reminder Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Configurações de Lembrete
          </CardTitle>
          <CardDescription>
            Configure lembretes automáticos para profissionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="professionalReminder"
              checked={sendReminderToProfessional}
              onCheckedChange={handleReminderToggle}
            />
            <label
              htmlFor="professionalReminder"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enviar lembrete no WhatsApp dos profissionais sobre agendamentos do próximo dia
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Carregando agendamentos...</p>
            </CardContent>
          </Card>
        ) : sortedTimes.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Nenhum agendamento para hoje
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedTimes.map((time) => (
            <Card key={time}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {time}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupedAppointments[time].map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.clientName}</span>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{appointment.clientPhone}</span>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{appointment.serviceName}</p>
                          <p className="text-muted-foreground">{appointment.duration} min</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Profissional:</span>
                          <span>{appointment.professionalName}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 mr-2" />
                          Ligar
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{appointments.length}</p>
                <p className="text-sm text-muted-foreground">Total de Agendamentos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </p>
                <p className="text-sm text-muted-foreground">Confirmados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {appointments.filter(a => a.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentDetails;