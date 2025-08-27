import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Instagram, Facebook, Youtube, Upload } from "lucide-react";

interface SalonData {
  name: string;
  description: string;
  address: string;
  phone: string;
  workingDays: string[];
  openTime: string;
  closeTime: string;
  primaryColor: string;
  secondaryColor: string;
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  latitude: string;
  longitude: string;
  mainLogo: string;
  secondaryLogo: string;
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

const SalonManagement = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [salonData, setSalonData] = useState<SalonData>({
    name: "",
    description: "",
    address: "",
    phone: "",
    workingDays: [],
    openTime: "",
    closeTime: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
    latitude: "",
    longitude: "",
    mainLogo: "",
    secondaryLogo: "",
  });

  useEffect(() => {
    // TODO: Load salon data from API
    // loadSalonData();
  }, []);

  const handleInputChange = (field: keyof SalonData, value: string) => {
    setSalonData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkingDayChange = (dayId: string, checked: boolean) => {
    setSalonData(prev => ({
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
      // const response = await fetch("../admin/api/setsadmalon", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(salonData)
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Salão atualizado com sucesso!",
        description: "As informações foram salvas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as informações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Informações do Salão</h2>
        <p className="text-muted-foreground">
          Configure as informações básicas do seu estabelecimento
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados principais do seu salão de beleza
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Salão *</Label>
                <Input
                  id="name"
                  value={salonData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Salão Beleza & Estilo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={salonData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={salonData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descreva seu salão..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  value={salonData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Rua, número, bairro, cidade, CEP"
                  className="pl-10"
                  rows={2}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Horário de Funcionamento</CardTitle>
            <CardDescription>
              Configure os dias e horários de atendimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Dias de Funcionamento</Label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                {weekDays.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={salonData.workingDays.includes(day.id)}
                      onCheckedChange={(checked) =>
                        handleWorkingDayChange(day.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={day.id} className="text-sm font-normal">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="openTime">Horário de Abertura</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={salonData.openTime}
                  onChange={(e) => handleInputChange("openTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">Horário de Fechamento</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={salonData.closeTime}
                  onChange={(e) => handleInputChange("closeTime", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colors & Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Cores e Identidade Visual</CardTitle>
            <CardDescription>
              Personalize as cores do seu site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={salonData.primaryColor}
                    onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={salonData.primaryColor}
                    onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={salonData.secondaryColor}
                    onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={salonData.secondaryColor}
                    onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Redes Sociais</CardTitle>
            <CardDescription>
              Conecte suas redes sociais para maior visibilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    value={salonData.instagram}
                    onChange={(e) => handleInputChange("instagram", e.target.value)}
                    placeholder="@seusalao"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="facebook"
                    value={salonData.facebook}
                    onChange={(e) => handleInputChange("facebook", e.target.value)}
                    placeholder="facebook.com/seusalao"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="youtube"
                    value={salonData.youtube}
                    onChange={(e) => handleInputChange("youtube", e.target.value)}
                    placeholder="youtube.com/seusalao"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  value={salonData.tiktok}
                  onChange={(e) => handleInputChange("tiktok", e.target.value)}
                  placeholder="@seusalao"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Localização GPS</CardTitle>
            <CardDescription>
              Coordenadas para integração com mapas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={salonData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="-23.5505"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={salonData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="-46.6333"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-primary-hover px-8"
          >
            {isLoading ? "Salvando..." : "Salvar Informações"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SalonManagement;