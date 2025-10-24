import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, Calendar, Clock, Ban, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { professionalApi } from "@/lib/api";
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
  { id: "1", label: "Segunda", short: "Seg" },
  { id: "2", label: "Terça", short: "Ter" },
  { id: "3", label: "Quarta", short: "Qua" },
  { id: "4", label: "Quinta", short: "Qui" },
  { id: "5", label: "Sexta", short: "Sex" },
  { id: "6", label: "Sábado", short: "Sáb" },
  { id: "7", label: "Domingo", short: "Dom" },
];

const ProfessionalsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<Professional[]>([]);

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


  const getWorkingDaysDisplay = (workingDays: string[]) => {
    return workingDays
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/professionals/edit/${professional.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalsManagement;