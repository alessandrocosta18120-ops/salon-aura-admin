import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Scissors, Clock, DollarSign } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  professionalId: string;
  professionalName: string;
  isActive: boolean;
}

interface Professional {
  id: string;
  name: string;
}

const ServicesManagement = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Service, 'id' | 'professionalName'>>({
    name: "",
    description: "",
    duration: 60,
    price: 0,
    professionalId: "",
    isActive: true,
  });

  useEffect(() => {
    loadServices();
    loadProfessionals();
  }, []);

  const loadServices = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("../admin/api/getadmservices");
      // const data = await response.json();

      // Mock data for demonstration
      setServices([
        {
          id: "1",
          name: "Corte Feminino",
          description: "Corte de cabelo feminino com lavagem e finalização",
          duration: 90,
          price: 80,
          professionalId: "1",
          professionalName: "Ana Silva",
          isActive: true,
        },
        {
          id: "2",
          name: "Barba e Bigode",
          description: "Aparar barba e bigode com navalha",
          duration: 45,
          price: 35,
          professionalId: "2",
          professionalName: "Carlos Santos",
          isActive: true,
        },
        {
          id: "3",
          name: "Escova Progressiva",
          description: "Tratamento para alisamento dos cabelos",
          duration: 180,
          price: 150,
          professionalId: "1",
          professionalName: "Ana Silva",
          isActive: true,
        },
      ]);
    } catch (error) {
      toast({
        title: "Erro ao carregar serviços",
        description: "Não foi possível carregar a lista de serviços.",
        variant: "destructive",
      });
    }
  };

  const loadProfessionals = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("../admin/api/getadmprofessionals");
      // const data = await response.json();

      // Mock data for demonstration
      setProfessionals([
        { id: "1", name: "Ana Silva" },
        { id: "2", name: "Carlos Santos" },
      ]);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
    }
  };

  const handleInputChange = (field: keyof Omit<Service, 'id' | 'professionalName'>, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const endpoint = editingService ? "updateadmservice" : "setadmservice";
      // const response = await fetch(`../admin/api/${endpoint}`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData)
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const professionalName = professionals.find(p => p.id === formData.professionalId)?.name || "";

      if (editingService) {
        setServices(prev =>
          prev.map(s =>
            s.id === editingService.id
              ? { ...formData, id: editingService.id, professionalName }
              : s
          )
        );
        toast({
          title: "Serviço atualizado!",
          description: "As informações foram atualizadas com sucesso.",
        });
      } else {
        const newService = {
          ...formData,
          id: Date.now().toString(),
          professionalName,
        };
        setServices(prev => [...prev, newService]);
        toast({
          title: "Serviço cadastrado!",
          description: "O serviço foi adicionado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o serviço.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: 60,
      price: 0,
      professionalId: "",
      isActive: true,
    });
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      professionalId: service.professionalId,
      isActive: service.isActive,
    });
    setIsDialogOpen(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
          <p className="text-muted-foreground">
            Cadastre e gerencie os serviços oferecidos
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
              Adicionar Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Editar Serviço" : "Novo Serviço"}
                </DialogTitle>
                <DialogDescription>
                  {editingService
                    ? "Atualize as informações do serviço"
                    : "Cadastre um novo serviço no sistema"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome do Serviço *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Corte de cabelo, Barba, etc."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Descreva o serviço oferecido..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (minutos) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 0)}
                      placeholder="60"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                      placeholder="50.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="professionalId">Profissional *</Label>
                    <Select
                      value={formData.professionalId}
                      onValueChange={(value) => handleInputChange("professionalId", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id}>
                            {professional.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  {isLoading ? "Salvando..." : editingService ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Lista de Serviços
          </CardTitle>
          <CardDescription>
            {services.length} serviço(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-muted-foreground">
                          {service.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{service.professionalName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {formatDuration(service.duration)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium text-success">
                      <DollarSign className="w-4 h-4" />
                      {formatPrice(service.price)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
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

export default ServicesManagement;