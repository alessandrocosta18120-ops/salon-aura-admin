import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Phone, MessageSquare, X, CalendarIcon, Clock, User } from "lucide-react";
import { appointmentApi, professionalApi, serviceApi, salonApi, settingsApi } from "@/lib/api";
import { format, addMonths, subMonths, addDays, subDays, parse, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  time: string;
  endTime?: string;
  clientName: string;
  clientPhone: string;
  professionalId: string;
  professionalName: string;
  serviceName: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface Professional {
  id: string;
  name: string;
  color?: string;
  isActive: boolean;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  isActive: boolean;
}

interface TimeSlot {
  time: string;
  appointments: Appointment[];
}

// Cores fallback para profissionais
const PROFESSIONAL_COLORS = [
  "hsl(221, 83%, 53%)", // Blue
  "hsl(142, 71%, 45%)", // Green
  "hsl(280, 87%, 65%)", // Purple
  "hsl(25, 95%, 53%)",  // Orange
  "hsl(340, 82%, 52%)", // Pink
  "hsl(174, 72%, 40%)", // Teal
  "hsl(45, 93%, 47%)",  // Yellow
  "hsl(0, 72%, 51%)",   // Red
];

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [slotSize, setSlotSize] = useState(30);
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [confirmationText, setConfirmationText] = useState("");
  
  // Action states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [selectedSlotTime, setSelectedSlotTime] = useState("");
  
  // Reschedule form
  const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date());
  const [rescheduleTime, setRescheduleTime] = useState("");
  
  // New appointment form
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newProfessionalId, setNewProfessionalId] = useState("");
  const [newServiceId, setNewServiceId] = useState("");
  
  // Contact states
  const [whatsappSent, setWhatsappSent] = useState<Record<string, boolean>>({});
  const [phoneCalled, setPhoneCalled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAppointments(selectedDate);
  }, [selectedDate]);

  const loadInitialData = async () => {
    try {
      // Load professionals
      const profResponse = await professionalApi.get();
      if (profResponse.success && profResponse.data) {
        setProfessionals(profResponse.data.filter((p: Professional) => p.isActive));
      }

      // Load services
      const servResponse = await serviceApi.get();
      if (servResponse.success && servResponse.data) {
        setServices(servResponse.data.filter((s: Service) => s.isActive));
      }

      // Load salon settings for working hours
      const salonResponse = await salonApi.get();
      if (salonResponse.success && salonResponse.data) {
        setOpenTime(salonResponse.data.openTime || "08:00");
        setCloseTime(salonResponse.data.closeTime || "18:00");
        setConfirmationText(salonResponse.data.whatsappCustomText || "");
      }

      // Load slot size
      const slotResponse = await settingsApi.getSlotSize();
      if (slotResponse.success && slotResponse.data) {
        setSlotSize(slotResponse.data.slotSize || 30);
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    }
  };

  const loadAppointments = async (date: Date) => {
    setIsLoading(true);
    try {
      const response = await appointmentApi.getByDate(format(date, 'yyyy-MM-dd'));
      if (response.success) {
        setAppointments(response.data || []);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      setAppointments([]);
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots based on salon hours and slot size
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    let currentHour = openHour;
    let currentMin = openMin;
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      const slotAppointments = appointments.filter(a => a.time === timeString);
      
      slots.push({
        time: timeString,
        appointments: slotAppointments
      });
      
      currentMin += slotSize;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
    
    return slots;
  }, [openTime, closeTime, slotSize, appointments]);

  // Get color for professional
  const getProfessionalColor = (professionalId: string): string => {
    const prof = professionals.find(p => p.id === professionalId);
    if (prof?.color) return prof.color;
    
    const index = professionals.findIndex(p => p.id === professionalId);
    return PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length];
  };

  // Date navigation
  const handlePreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handlePreviousMonth = () => setSelectedDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

  // Slot click handlers
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowActionMenu(true);
  };

  const handleEmptySlotClick = (time: string) => {
    setSelectedSlotTime(time);
    setNewClientName("");
    setNewClientPhone("");
    setNewProfessionalId("");
    setNewServiceId("");
    setShowNewAppointmentDialog(true);
  };

  // Action handlers
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      const response = await appointmentApi.set({ 
        id: selectedAppointment.id, 
        status: 'cancelled',
        action: 'cancel'
      });
      
      if (response.success) {
        toast({
          title: "Agendamento cancelado",
          description: "O agendamento foi cancelado com sucesso.",
        });
        loadAppointments(selectedDate);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setShowCancelDialog(false);
      setShowActionMenu(false);
      setSelectedAppointment(null);
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleTime) return;
    
    try {
      const response = await appointmentApi.set({ 
        id: selectedAppointment.id, 
        date: format(rescheduleDate, 'yyyy-MM-dd'),
        time: rescheduleTime,
        action: 'reschedule'
      });
      
      if (response.success) {
        toast({
          title: "Agendamento reagendado",
          description: `Novo horário: ${format(rescheduleDate, "dd/MM/yyyy")} às ${rescheduleTime}`,
        });
        loadAppointments(selectedDate);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Erro ao reagendar",
        description: "Não foi possível reagendar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setShowRescheduleDialog(false);
      setShowActionMenu(false);
      setSelectedAppointment(null);
    }
  };

  const handleConfirmWhatsApp = () => {
    if (!selectedAppointment) return;
    
    const text = confirmationText || 
      `Olá ${selectedAppointment.clientName}! Confirmando seu agendamento para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedAppointment.time} com ${selectedAppointment.professionalName} - ${selectedAppointment.serviceName}.`;
    
    const phoneDigits = selectedAppointment.clientPhone.replace(/\D/g, '');
    const whatsappPhone = `55${phoneDigits}`;
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    
    window.open(whatsappUrl, '_blank');
    setWhatsappSent(prev => ({ ...prev, [selectedAppointment.id]: true }));
    setShowActionMenu(false);
    setSelectedAppointment(null);
  };

  const handleCreateAppointment = async () => {
    if (!newClientName || !newClientPhone || !newProfessionalId || !newServiceId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar o agendamento.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await appointmentApi.set({
        clientName: newClientName,
        clientPhone: newClientPhone,
        professionalId: newProfessionalId,
        serviceId: newServiceId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedSlotTime,
        action: 'create'
      });
      
      if (response.success) {
        toast({
          title: "Agendamento criado",
          description: `Agendamento criado para ${newClientName} às ${selectedSlotTime}`,
        });
        loadAppointments(selectedDate);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Erro ao criar agendamento",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setShowNewAppointmentDialog(false);
    }
  };

  const handlePhoneClick = (appointment: Appointment) => {
    const telUrl = `tel:${appointment.clientPhone.replace(/\D/g, '')}`;
    window.location.href = telUrl;
    setPhoneCalled(prev => ({ ...prev, [appointment.id]: true }));
  };

  const handleWhatsAppClick = (appointment: Appointment) => {
    const message = `Olá ${appointment.clientName}! Confirmando seu agendamento para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${appointment.time} com ${appointment.professionalName} - ${appointment.serviceName}.`;
    const phoneDigits = appointment.clientPhone.replace(/\D/g, '');
    const whatsappPhone = `55${phoneDigits}`;
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setWhatsappSent(prev => ({ ...prev, [appointment.id]: true }));
  };

  // Summary stats
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Agenda</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Gerencie seus agendamentos
        </p>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Mês</span>
              </Button>
              <span className="font-semibold text-lg">
                {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <span className="hidden sm:inline mr-1">Mês</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar */}
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                className="rounded-md border pointer-events-auto"
              />
            </div>

            {/* Day navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sm:hidden">Anterior</span>
                <span className="hidden sm:inline ml-1">Dia Anterior</span>
              </Button>
              <span className="font-medium text-center">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
              <Button variant="outline" onClick={handleNextDay}>
                <span className="sm:hidden">Próximo</span>
                <span className="hidden sm:inline mr-1">Próximo Dia</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Legend (only if multiple professionals) */}
      {professionals.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Legenda - Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {professionals.map((prof) => (
                <div key={prof.id} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: getProfessionalColor(prof.id) }}
                  />
                  <span className="text-sm">{prof.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários - {format(selectedDate, "dd/MM/yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <div key={slot.time} className="border rounded-lg p-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-semibold w-14">{slot.time}</span>
                    
                    {slot.appointments.length > 0 ? (
                      <div className="flex flex-wrap gap-2 flex-1">
                        {slot.appointments.map((apt) => (
                          <button
                            key={apt.id}
                            onClick={() => handleAppointmentClick(apt)}
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm transition-all hover:opacity-80 cursor-pointer"
                            style={{ backgroundColor: getProfessionalColor(apt.professionalId) }}
                          >
                            <User className="h-4 w-4" />
                            <span className="font-medium">{apt.clientName}</span>
                            <span className="opacity-80">• {apt.serviceName}</span>
                            {professionals.length > 1 && (
                              <span className="opacity-70 text-xs">({apt.professionalName})</span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEmptySlotClick(slot.time)}
                        className="flex-1 py-2 border-2 border-dashed border-muted-foreground/30 rounded-md text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm"
                      >
                        Horário disponível - Clique para agendar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Summary */}
      {appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalAppointments}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{confirmedAppointments}</p>
                <p className="text-sm text-muted-foreground">Confirmados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{pendingAppointments}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Menu Popover */}
      <Dialog open={showActionMenu} onOpenChange={setShowActionMenu}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ações do Agendamento</DialogTitle>
            <DialogDescription>
              {selectedAppointment && (
                <>
                  <strong>{selectedAppointment.clientName}</strong> - {selectedAppointment.serviceName}
                  <br />
                  {selectedAppointment.time} com {selectedAppointment.professionalName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-4">
            {/* Phone and WhatsApp buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className={cn(
                  "flex-1",
                  selectedAppointment && phoneCalled[selectedAppointment.id] && "text-destructive border-destructive"
                )}
                onClick={() => selectedAppointment && handlePhoneClick(selectedAppointment)}
              >
                <Phone className="h-4 w-4 mr-2" />
                {selectedAppointment && phoneCalled[selectedAppointment.id] ? 'Telefonado' : 'Ligar'}
              </Button>
              <Button 
                variant="outline" 
                className={cn(
                  "flex-1",
                  selectedAppointment && whatsappSent[selectedAppointment.id] && "text-destructive border-destructive"
                )}
                onClick={() => selectedAppointment && handleWhatsAppClick(selectedAppointment)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {selectedAppointment && whatsappSent[selectedAppointment.id] ? 'WhatsApp enviado' : 'WhatsApp'}
              </Button>
            </div>

            <div className="border-t pt-3" />

            {/* Confirm via WhatsApp - Green */}
            <Button 
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
              onClick={handleConfirmWhatsApp}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Confirmar via WhatsApp
            </Button>

            {/* Reschedule - Yellow */}
            <Button 
              className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
              onClick={() => {
                setRescheduleDate(selectedDate);
                setRescheduleTime(selectedAppointment?.time || "");
                setShowRescheduleDialog(true);
              }}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Reagendar
            </Button>

            {/* Cancel - Red */}
            <Button
              variant="destructive" 
              className="w-full"
              onClick={() => setShowCancelDialog(true)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar Agendamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento?
              <br />
              <strong>Esta ação não poderá ser desfeita.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reagendar</DialogTitle>
            <DialogDescription>
              Selecione a nova data e horário para o agendamento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nova Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(rescheduleDate, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={(date) => date && setRescheduleDate(date)}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Novo Horário</Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.time} value={slot.time}>
                      {slot.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReschedule}>
              Confirmar Reagendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              {format(selectedDate, "dd/MM/yyyy")} às {selectedSlotTime}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente *</Label>
              <Input
                id="clientName"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientPhone">WhatsApp *</Label>
              <Input
                id="clientPhone"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Profissional *</Label>
              <Select value={newProfessionalId} onValueChange={setNewProfessionalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Serviço *</Label>
              <Select value={newServiceId} onValueChange={setNewServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAppointment}>
              Criar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
