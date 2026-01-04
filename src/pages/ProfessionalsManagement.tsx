import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, Calendar, Clock, Ban, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { professionalApi, appointmentApi } from "@/lib/api";
import { ReassignAppointmentsDialog } from "@/components/ReassignAppointmentsDialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  photoUrl?: string | null;
}

const weekDays = [
  { id: "1", label: "Domingo", short: "Dom" },
  { id: "2", label: "Segunda", short: "Seg" },
  { id: "3", label: "Terça", short: "Ter" },
  { id: "4", label: "Quarta", short: "Qua" },
  { id: "5", label: "Quinta", short: "Qui" },
  { id: "6", label: "Sexta", short: "Sex" },
  { id: "7", label: "Sábado", short: "Sáb" },
];

const ProfessionalsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showSimpleDeleteDialog, setShowSimpleDeleteDialog] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<{ id: string; name: string } | null>(null);
  const [appointmentsToReassign, setAppointmentsToReassign] = useState<any[]>([]);

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const response = await professionalApi.get();
      if (response.success && response.data) {
        setProfessionals(response.data);
      } else {
        throw new Error(response.error || "Erro ao carregar profissionais");
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar profissionais",
        description: error instanceof Error ? error.message : "Não foi possível carregar a lista de profissionais.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = async (professional: Professional) => {
    setProfessionalToDelete({ id: professional.id, name: professional.name });
    
    // Verificar se existem agendamentos para este profissional
    try {
      const response = await appointmentApi.get();
      if (response.success && response.data) {
        const professionalAppointments = response.data.filter(
          (apt: any) => apt.professionalId === professional.id && new Date(apt.date) >= new Date()
        );
        
        if (professionalAppointments.length > 0) {
          setAppointmentsToReassign(professionalAppointments);
          setShowReassignDialog(true);
        } else {
          setShowSimpleDeleteDialog(true);
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível verificar agendamentos.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!professionalToDelete) return;

    try {
      const response = await professionalApi.delete(professionalToDelete.id);
      if (response.success) {
        toast({
          title: "Profissional excluído!",
          description: "O profissional foi removido com sucesso.",
          className: "bg-blue-50 border-blue-200",
        });
        loadProfessionals();
      } else {
        throw new Error(response.error || "Erro ao excluir");
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Não foi possível excluir o profissional.",
        variant: "destructive",
      });
    } finally {
      setShowSimpleDeleteDialog(false);
      setProfessionalToDelete(null);
    }
  };

  const handleConfirmReassign = async (reassignments: Record<string, string>) => {
    if (!professionalToDelete) return;

    try {
      // Reatribuir cada agendamento
      for (const [appointmentId, newProfessionalId] of Object.entries(reassignments)) {
        await appointmentApi.set({
          id: appointmentId,
          professionalId: newProfessionalId,
        });
      }

      // Excluir o profissional
      const response = await professionalApi.delete(professionalToDelete.id);
      if (response.success) {
        toast({
          title: "Profissional excluído!",
          description: "Os agendamentos foram reatribuídos e o profissional foi removido.",
          className: "bg-blue-50 border-blue-200",
        });
        loadProfessionals();
      } else {
        throw new Error(response.error || "Erro ao excluir");
      }
    } catch (error) {
      toast({
        title: "Erro ao processar",
        description: error instanceof Error ? error.message : "Não foi possível concluir a operação.",
        variant: "destructive",
      });
    } finally {
      setShowReassignDialog(false);
      setProfessionalToDelete(null);
      setAppointmentsToReassign([]);
    }
  };


  const getWorkingDaysDisplay = (workingDays: string[]) => {
    // Normaliza para string e ordena numericamente para exibir na ordem correta
    const normalizedDays = workingDays.map(d => String(d));
    return normalizedDays
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(dayId => weekDays.find(day => day.id === dayId)?.short)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profissionais</h2>
          <p className="text-muted-foreground">
            Gerencie os profissionais do seu salão
          </p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/professionals/new")}
          className="bg-gradient-to-r from-primary to-primary-hover"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Profissional
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Lista de Profissionais
          </CardTitle>
          <CardDescription>
            {professionals.length} profissional(is) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Dias de Trabalho</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={professional.photoUrl || undefined} alt={professional.name} />
                          <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{professional.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{professional.email}</div>
                        <div className="text-muted-foreground">{professional.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {getWorkingDaysDisplay(professional.workingDays)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {professional.startTime} - {professional.endTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={professional.isActive ? "default" : "secondary"}>
                        {professional.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/dashboard/professionals/edit/${professional.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(professional)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {professionals.map((professional) => (
              <div key={professional.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={professional.photoUrl || undefined} alt={professional.name} />
                    <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{professional.name}</p>
                    <Badge variant={professional.isActive ? "default" : "secondary"} className="mt-1">
                      {professional.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">E-mail:</span> {professional.email}</p>
                  <p><span className="text-muted-foreground">Telefone:</span> {professional.phone}</p>
                  <p><span className="text-muted-foreground">Dias:</span> {getWorkingDaysDisplay(professional.workingDays)}</p>
                  <p><span className="text-muted-foreground">Horário:</span> {professional.startTime} - {professional.endTime}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/dashboard/professionals/edit/${professional.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(professional)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ReassignAppointmentsDialog
        open={showReassignDialog}
        onOpenChange={setShowReassignDialog}
        appointments={appointmentsToReassign}
        professionals={professionals}
        professionalToDelete={professionalToDelete}
        onConfirm={handleConfirmReassign}
      />

      <AlertDialog open={showSimpleDeleteDialog} onOpenChange={setShowSimpleDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o profissional{" "}
              <strong>{professionalToDelete?.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfessionalsManagement;