import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Check } from "lucide-react";
import { appointmentApi } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/PageHeader";

interface Appointment {
  id: string;
  time: string;
  clientName: string;
  clientPhone: string;
  professionalName: string;
  professionalPhone: string;
  serviceName: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export const AppointmentReminders = ({ selectedDate, onBack }: { selectedDate: Date; onBack: () => void }) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remindersSent, setRemindersSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await appointmentApi.getByDate(format(selectedDate, 'yyyy-MM-dd'));
      if (response.success) {
        setAppointments(response.data || []);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Group appointments by professional
  const groupedByProfessional = appointments.reduce((acc, appointment) => {
    const key = appointment.professionalName;
    if (!acc[key]) {
      acc[key] = {
        professionalName: appointment.professionalName,
        professionalPhone: appointment.professionalPhone,
        appointments: []
      };
    }
    acc[key].appointments.push(appointment);
    return acc;
  }, {} as Record<string, { professionalName: string; professionalPhone: string; appointments: Appointment[] }>);

  const handleSendReminder = (professionalName: string, professionalPhone: string, appointments: Appointment[]) => {
    const appointmentsList = appointments
      .map(apt => `• ${apt.time} - ${apt.clientName} - ${apt.serviceName}`)
      .join('\n');
    
    const message = `Olá ${professionalName}!\n\nLembretes de agendamentos para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}:\n\n${appointmentsList}\n\nBom trabalho!`;
    
    // Format phone: remove all non-digits, then add country code
    const phoneDigits = professionalPhone.replace(/\D/g, '');
    const whatsappPhone = `55${phoneDigits}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Mark all appointments as sent
    setRemindersSent(prev => {
      const newSet = new Set(prev);
      appointments.forEach(apt => newSet.add(apt.id));
      return newSet;
    });
    
    toast({
      title: "Lembrete enviado",
      description: `Lembrete enviado para ${professionalName} com ${appointments.length} agendamento(s)`,
      className: "bg-blue-50 border-blue-200",
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Enviar Lembretes"
        description={`Lembretes para ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Agendamentos por Profissional</CardTitle>
          <CardDescription>
            Clique em "Enviar Lembrete" para notificar o profissional via WhatsApp com todos os agendamentos do dia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Carregando agendamentos...</p>
          ) : appointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum agendamento encontrado para esta data.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByProfessional).map(([professionalName, data]) => {
                const allSent = data.appointments.every(apt => remindersSent.has(apt.id));
                
                return (
                  <Card key={professionalName} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <CardTitle>{data.professionalName}</CardTitle>
                          <CardDescription>
                            {data.appointments.length} agendamento(s) • {data.professionalPhone}
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => handleSendReminder(data.professionalName, data.professionalPhone, data.appointments)}
                          disabled={allSent}
                          variant={allSent ? "secondary" : "default"}
                        >
                          {allSent ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Lembrete Enviado
                            </>
                          ) : (
                            <>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Enviar Lembrete
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.appointments.map((appointment) => (
                          <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{appointment.time}</span>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusText(appointment.status)}
                              </Badge>
                            </div>
                            <div className="text-sm sm:text-right">
                              <p className="font-medium">{appointment.clientName}</p>
                              <p className="text-muted-foreground">{appointment.serviceName} • {appointment.duration}min</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};