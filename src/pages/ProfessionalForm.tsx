import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { X, Upload } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { professionalApi } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { sessionManager } from "@/lib/session";

interface Professional {
  id?: string;
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
  { id: "1", label: "Segunda-feira" },
  { id: "2", label: "Terça-feira" },
  { id: "3", label: "Quarta-feira" },
  { id: "4", label: "Quinta-feira" },
  { id: "5", label: "Sexta-feira" },
  { id: "6", label: "Sábado" },
  { id: "7", label: "Domingo" },
];

const ProfessionalForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Professional>({
    name: "",
    email: "",
    phone: "",
    workingDays: [],
    startTime: "",
    endTime: "",
    isActive: true,
    photoUrl: null,
  });

  useEffect(() => {
    if (id) {
      loadProfessional();
    }
  }, [id]);

  const loadProfessional = async () => {
    try {
      const response = await professionalApi.get();
      if (response.success && response.data) {
        const professional = response.data.find((p: any) => p.id === id);
        if (professional) {
          setFormData(professional);
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do profissional.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof Professional, value: string | boolean | null) => {
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
      const salonId = sessionManager.getSalonId();
      const userId = sessionManager.getUserId();
      const slug = sessionManager.getSlug();
      const dataToSend = { ...formData, salonId, userId, slug };
      if (id) {
        dataToSend.id = id;
      }
      
      const response = await professionalApi.set(dataToSend);
      
      if (response.success) {
        toast({
          title: id ? "Profissional atualizado!" : "Profissional cadastrado!",
          description: id 
            ? "As informações foram atualizadas com sucesso."
            : "O profissional foi adicionado com sucesso.",
          className: "bg-blue-50 border-blue-200",
        });
        navigate("/dashboard/professionals");
      } else {
        throw new Error(response.error || "Erro ao salvar profissional");
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o profissional.",
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
      const response = await professionalApi.delete(id);
      
      if (response.success) {
        toast({
          title: "Profissional apagado!",
          description: "O profissional foi removido com sucesso.",
        });
        navigate("/dashboard/professionals");
      } else {
        throw new Error(response.error || "Erro ao apagar profissional");
      }
    } catch (error) {
      toast({
        title: "Erro ao apagar",
        description: error instanceof Error ? error.message : "Não foi possível apagar o profissional.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={id ? "Editar Profissional" : "Novo Profissional"}
        description={id ? "Atualize as informações do profissional" : "Cadastre um novo profissional no sistema"}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Profissional</CardTitle>
            <CardDescription>
              Preencha os dados do profissional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="photo">Foto do Profissional</Label>
              <div className="flex items-center gap-4">
                {formData.photoUrl && (
                  <img 
                    src={formData.photoUrl} 
                    alt="Foto atual" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <FileUpload
                  id="photo"
                  label=""
                  accept="image/*"
                  value={formData.photoUrl}
                  onChange={(file) => {
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleInputChange("photoUrl", reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  placeholder="Clique para alterar a foto"
                />
              </div>
            </div>

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
              <Label htmlFor="phone">Telefone/WhatsApp *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Dias de Trabalho</Label>
              <div className="grid grid-cols-2 gap-3">
                {weekDays.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={formData.workingDays.includes(day.id)}
                      onCheckedChange={(checked) =>
                        handleWorkingDayChange(day.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={day.id} className="text-sm font-normal cursor-pointer">
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
                <Label htmlFor="endTime">Horário de Término</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Profissional ativo
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/professionals")}
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

export default ProfessionalForm;
