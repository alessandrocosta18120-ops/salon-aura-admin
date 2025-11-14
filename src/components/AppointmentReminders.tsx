import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Check } from "lucide-react";
import { appointmentApi, settingsApi } from "@/lib/api";
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
  const [defaultMessage, setDefaultMessage] = useState("");

  useEffect(() => {
    loadAppointments();
    loadDefaultMessage();
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

  const loadDefaultMessage = async () => {
    try {
      const response = await settingsApi.get();
      if (response.success && response.data?.confirmationMessage) {
        setDefaultMessage(response.data.confirmationMessage);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagem padrão:", error);
    }
  };

  const handleSendReminder = (appointment: Appointment) => {
    const message = defaultMessage
      .replace("{clientName}", appointment.clientName)
      .replace("{serviceName}", appointment.serviceName)
      .replace("{time}", appointment.time)
      .replace("{date}", format(selectedDate, "dd/MM/yyyy", { locale: ptBR }))
      .replace("{professionalName}", appointment.professionalName);

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${appointment.professionalPhone.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Mark as sent
    setRemindersSent(prev => new Set(prev).add(appointment.id));
    
    toast({
      title: "Lembrete enviado",
      description: `Lembrete enviado para ${appointment.professionalName}`,
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
          <CardTitle>Agendamentos</CardTitle>
          <CardDescription>
            Clique em "Enviar Lembrete" para notificar o profissional via WhatsApp
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
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const reminderSent = remindersSent.has(appointment.id);
                
                return (
                  <Card key={appointment.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{appointment.time}</span>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Cliente:</span> {appointment.clientName}</p>
                            <p><span className="font-medium">Telefone Cliente:</span> {appointment.clientPhone}</p>
                            <p><span className="font-medium">Profissional:</span> {appointment.professionalName}</p>
                            <p><span className="font-medium">Serviço:</span> {appointment.serviceName}</p>
                            <p><span className="font-medium">Duração:</span> {appointment.duration} minutos</p>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleSendReminder(appointment)}
                          disabled={reminderSent}
                          variant={reminderSent ? "secondary" : "default"}
                          className="shrink-0"
                        >
                          {reminderSent ? (
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
