import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  service: string;
}

interface Professional {
  id: string;
  name: string;
}

interface ReassignAppointmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointments: Appointment[];
  professionals: Professional[];
  professionalToDelete: { id: string; name: string } | null;
  onConfirm: (reassignments: Record<string, string>) => void;
}

export const ReassignAppointmentsDialog = ({
  open,
  onOpenChange,
  appointments,
  professionals,
  professionalToDelete,
  onConfirm,
}: ReassignAppointmentsDialogProps) => {
  const [reassignments, setReassignments] = useState<Record<string, string>>({});

  const handleReassign = (appointmentId: string, newProfessionalId: string) => {
    setReassignments(prev => ({
      ...prev,
      [appointmentId]: newProfessionalId,
    }));
  };

  const handleConfirm = () => {
    // Verificar se todos os agendamentos foram reatribuídos
    const allReassigned = appointments.every(apt => reassignments[apt.id]);
    if (!allReassigned) {
      return;
    }
    onConfirm(reassignments);
    setReassignments({});
  };

  const allReassigned = appointments.every(apt => reassignments[apt.id]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Reatribuir Agendamentos</AlertDialogTitle>
          <AlertDialogDescription>
            O profissional <strong>{professionalToDelete?.name}</strong> possui{" "}
            <strong>{appointments.length}</strong> agendamento(s) pendente(s).
            <br />
            Selecione um profissional para assumir cada agendamento:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-4 border rounded-lg space-y-3 bg-muted/30"
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Cliente:</span> {appointment.clientName}
                </div>
                <div>
                  <span className="font-semibold">Serviço:</span> {appointment.service}
                </div>
                <div>
                  <span className="font-semibold">Data:</span> {appointment.date}
                </div>
                <div>
                  <span className="font-semibold">Horário:</span> {appointment.time}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`professional-${appointment.id}`}>
                  Novo Profissional
                </Label>
                <Select
                  value={reassignments[appointment.id] || ""}
                  onValueChange={(value) => handleReassign(appointment.id, value)}
                >
                  <SelectTrigger id={`professional-${appointment.id}`}>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals
                      .filter((p) => p.id !== professionalToDelete?.id)
                      .map((professional) => (
                        <SelectItem key={professional.id} value={professional.id}>
                          {professional.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReassignments({})}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!allReassigned}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Confirmar e Excluir Profissional
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
