import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { serviceApi, professionalApi } from "@/lib/api";
import { serviceSchema, getValidationErrorMessage } from "@/lib/validation";
import { PageHeader } from "@/components/PageHeader";
import { sessionManager } from "@/lib/session";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface Service {
  id?: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  professionalIds: string[];
  isActive: boolean;
}

interface Professional {
  id: string;
  name: string;
}

const ServiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [formData, setFormData] = useState<Service>({
    name: "",
    description: "",
    duration: 60,
    price: 0,
    professionalIds: [],
    isActive: true,
  });

  useEffect(() => {
    loadProfessionals();
    if (id) {
      loadService();
    }
  }, [id]);

  const loadProfessionals = async () => {
    try {
      const response = await professionalApi.get();
      if (response.success && response.data) {
        setProfessionals(response.data.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
    }
  };

  const loadService = async () => {
    try {
      const response = await serviceApi.get();
      if (response.success && response.data) {
        const service = response.data.find((s: any) => s.id === id);
        if (service) {
          setFormData({
            id: service.id,
            name: service.name,
            description: service.description,
            duration: service.duration,
            price: service.price,
            professionalIds: Array.isArray(service.professionalIds) ? service.professionalIds : [],
            isActive: service.isActive,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do serviço.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof Service, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfessionalToggle = (professionalId: string) => {
    setFormData(prev => ({
      ...prev,
      professionalIds: prev.professionalIds.includes(professionalId)
        ? prev.professionalIds.filter(id => id !== professionalId)
        : [...prev.professionalIds, professionalId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validationResult = serviceSchema.safeParse(formData);
      
      if (!validationResult.success) {
        toast({
          title: "Dados inválidos",
          description: getValidationErrorMessage(validationResult.error),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const salonId = sessionManager.getSalonId();
      const userId = sessionManager.getUserId();
      const slug = sessionManager.getSlug();
      const dataToSend = id 
        ? { ...validationResult.data, id, salonId, userId, slug }
        : { ...validationResult.data, salonId, userId, slug };

      console.log("Enviando dados do serviço:", dataToSend);

      const response = await serviceApi.set(dataToSend);
      
      if (response.success) {
        toast({
          title: id ? "Serviço atualizado!" : "Serviço cadastrado!",
          description: id 
            ? "As informações foram atualizadas com sucesso."
            : "O serviço foi adicionado com sucesso.",
          className: "bg-blue-50 border-blue-200",
        });
        navigate("/dashboard/services");
      } else {
        throw new Error(response.error || "Erro ao salvar serviço");
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o serviço.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const confirmed = window.confirm(
      "TEM CERTEZA QUE DESEJA APAGAR O ITEM SELECIONADO?\n\nEsta ação não pode ser desfeita."
    );
    
    if (!confirmed) return;
    
    setIsLoading(true);
    try {
      const response = await serviceApi.delete(id);
      
      if (response.success) {
        toast({
          title: "Serviço apagado!",
          description: "O serviço foi removido com sucesso.",
        });
        navigate("/dashboard/services");
      } else {
        throw new Error(response.error || "Erro ao apagar serviço");
      }
    } catch (error) {
      toast({
        title: "Erro ao apagar",
        description: error instanceof Error ? error.message : "Não foi possível apagar o serviço.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={id ? "Editar Serviço" : "Novo Serviço"}
        description={id ? "Atualize as informações do serviço" : "Cadastre um novo serviço no sistema"}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Serviço</CardTitle>
            <CardDescription>
              Preencha os dados do serviço
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Serviço *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Corte de Cabelo Masculino"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descreva o serviço..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
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
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Profissionais que realizam este serviço</Label>
              <div className="grid grid-cols-2 gap-3">
                {professionals.map((professional) => (
                  <div key={professional.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={professional.id}
                      checked={formData.professionalIds.includes(professional.id)}
                      onCheckedChange={() => handleProfessionalToggle(professional.id)}
                    />
                    <Label htmlFor={professional.id} className="text-sm font-normal cursor-pointer">
                      {professional.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Serviço ativo
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/services")}
                className="flex-1"
              >
                Cancelar
              </Button>
              {id && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Apagar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Salvando..." : id ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ServiceForm;
