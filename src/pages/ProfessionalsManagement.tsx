import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, Calendar, Clock, Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Professional, 'id'>>({
    name: "",
    email: "",
    phone: "",
    workingDays: [],
    startTime: "",
    endTime: "",
    isActive: true,
  });

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("../admin/api/getadmprofessionals");
      // const data = await response.json();

      // Mock data for demonstration
      setProfessionals([
        {
          id: "1",
          name: "Ana Silva",
          email: "ana@salon.com",
          phone: "(11) 99999-1111",
          workingDays: ["1", "2", "3", "4", "5"],
          startTime: "08:00",
          endTime: "18:00",
          isActive: true,
        },
        {
          id: "2",
          name: "Carlos Santos",
          email: "carlos@salon.com",
          phone: "(11) 99999-2222",
          workingDays: ["2", "3", "4", "5", "6"],
          startTime: "09:00",
          endTime: "19:00",
          isActive: true,
        },
      ]);
    } catch (error) {
      toast({
        title: "Erro ao carregar profissionais",
        description: "Não foi possível carregar a lista de profissionais.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof Omit<Professional, 'id'>, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkingDayChange = (dayId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      workingDays: checked
        ? [...prev.workingDays, dayId]
        : prev.workingDays.filter(id => id !== dayId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const endpoint = editingProfessional ? "updateadmprofessional" : "setadmprofessional";
      // const response = await fetch(`../admin/api/${endpoint}`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData)
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingProfessional) {
        setProfessionals(prev =>
          prev.map(p =>
            p.id === editingProfessional.id
              ? { ...formData, id: editingProfessional.id }
              : p
          )
        );
        toast({
          title: "Profissional atualizado!",
          description: "As informações foram atualizadas com sucesso.",
        });
      } else {
        const newProfessional = {
          ...formData,
          id: Date.now().toString(),
        };
        setProfessionals(prev => [...prev, newProfessional]);
        toast({
          title: "Profissional cadastrado!",
          description: "O profissional foi adicionado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o profissional.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      workingDays: [],
      startTime: "",
      endTime: "",
      isActive: true,
    });
    setEditingProfessional(null);
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      workingDays: professional.workingDays,
      startTime: professional.startTime,
      endTime: professional.endTime,
      isActive: professional.isActive,
    });
    setIsDialogOpen(true);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-primary to-primary-hover"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingProfessional ? "Editar Profissional" : "Novo Profissional"}
                </DialogTitle>
                <DialogDescription>
                  {editingProfessional
                    ? "Atualize as informações do profissional"
                    : "Cadastre um novo profissional no sistema"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Nome do profissional"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Dias de Trabalho</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {weekDays.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`work-${day.id}`}
                          checked={formData.workingDays.includes(day.id)}
                          onCheckedChange={(checked) =>
                            handleWorkingDayChange(day.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`work-${day.id}`} className="text-sm">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Horário de Início</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Horário de Fim</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked as boolean)
                    }
                  />
                  <Label htmlFor="isActive">Profissional ativo</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : editingProfessional ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  <TableCell className="font-medium">{professional.name}</TableCell>
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
                      onClick={() => handleEdit(professional)}
                    >
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