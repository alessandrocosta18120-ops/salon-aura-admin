import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Bell, Shield, MessageSquare, Calendar, Clock } from "lucide-react";
import { settingsApi } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { sessionManager } from "@/lib/session";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsData {
  // Notificações
  sendSocialLinks: boolean;
  confirmationMessage: string;
  twoFactorAuth: boolean;
  notificationMethod: "sms" | "whatsapp" | "both";
  
  // Confirmação automática
  confirmationEnabled: boolean;
  confirmationTiming: string;
  confirmationSendTime: string;
  confirmationCustomMessage: string;
  
  // Cancelamentos
  minCancelDays: number;
  allowSameDayCancel: boolean;
  cancelMessage: string;
  
  // Integrações
  whatsappApi: string;
  emailProvider: string;
  
  // Segurança
  sessionTimeout: number;
  maxLoginAttempts: number;
  
  // Outros
  timeZone: string;
  slotSize: number;
}

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    sendSocialLinks: true,
    confirmationMessage: "Seu agendamento foi confirmado! Aguardamos você no salão.",
    twoFactorAuth: true,
    notificationMethod: "both",
    confirmationEnabled: false,
    confirmationTiming: "previous_day",
    confirmationSendTime: "18:00",
    confirmationCustomMessage: "",
    minCancelDays: 1,
    allowSameDayCancel: false,
    cancelMessage: "Agendamento cancelado. Entre em contato para reagendar.",
    whatsappApi: "",
    emailProvider: "smtp",
    sessionTimeout: 60,
    maxLoginAttempts: 3,
    timeZone: "America/Sao_Paulo",
    slotSize: 30,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsApi.get();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof SettingsData, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const salonId = sessionManager.getSalonId();
      const userId = sessionManager.getUserId();
      const slug = sessionManager.getSlug();
      const dataToSend = { ...settings, salonId, userId, slug };
      
      const response = await settingsApi.set(dataToSend);
      
      if (response.success) {
        toast({
          title: "Configurações salvas!",
          description: "As configurações foram atualizadas com sucesso.",
          className: "bg-blue-50 border-blue-200",
        });
      } else {
        throw new Error(response.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <PageHeader 
        title="Configurações Gerais"
        description="Configure as preferências e integrações do sistema"
        showBack={false}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações e Mensagens
            </CardTitle>
            <CardDescription>
              Configure como os clientes recebem confirmações e lembretes via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enviar links de redes sociais</Label>
                <p className="text-sm text-muted-foreground">
                  Incluir links das redes sociais nas mensagens de confirmação
                </p>
              </div>
              <Switch
                checked={settings.sendSocialLinks}
                onCheckedChange={(checked) => handleInputChange("sendSocialLinks", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmationMessage">Mensagem de Confirmação (após agendamento)</Label>
              <Textarea
                id="confirmationMessage"
                value={settings.confirmationMessage}
                onChange={(e) => handleInputChange("confirmationMessage", e.target.value)}
                placeholder="Personalize a mensagem de confirmação..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cancelamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Política de Cancelamentos
            </CardTitle>
            <CardDescription>
              Configure as regras para cancelamento de agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minCancelDays">Dias mínimos para cancelamento</Label>
                <Input
                  id="minCancelDays"
                  type="number"
                  min="0"
                  max="7"
                  value={settings.minCancelDays}
                  onChange={(e) => handleInputChange("minCancelDays", parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir cancelamento no mesmo dia</Label>
                  <p className="text-sm text-muted-foreground">
                    Clientes podem cancelar no dia do agendamento
                  </p>
                </div>
                <Switch
                  checked={settings.allowSameDayCancel}
                  onCheckedChange={(checked) => handleInputChange("allowSameDayCancel", checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancelMessage">Mensagem de Cancelamento</Label>
              <Textarea
                id="cancelMessage"
                value={settings.cancelMessage}
                onChange={(e) => handleInputChange("cancelMessage", e.target.value)}
                placeholder="Mensagem enviada quando um agendamento é cancelado..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configure as opções de segurança do painel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação de dois fatores</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar código de verificação a cada acesso
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleInputChange("twoFactorAuth", checked)}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout da sessão (minutos)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="15"
                  max="480"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange("sessionTimeout", parseInt(e.target.value) || 60)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Máximo de tentativas de login</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleInputChange("maxLoginAttempts", parseInt(e.target.value) || 3)}
                />
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Configurações do Sistema
            </CardTitle>
            <CardDescription>
              Preferências gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="timeZone">Fuso Horário</Label>
              <Select
                value={settings.timeZone}
                onValueChange={(value) => handleInputChange("timeZone", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Slot Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Tamanho dos Slots de Agendamento
            </CardTitle>
            <CardDescription>
              Defina a duração padrão de cada slot de horário disponível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={settings.slotSize.toString()}
              onValueChange={(value) => handleInputChange("slotSize", parseInt(value))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="slot30" />
                <Label htmlFor="slot30" className="cursor-pointer font-normal">
                  30 minutos (mais flexibilidade para agendamentos)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="60" id="slot60" />
                <Label htmlFor="slot60" className="cursor-pointer font-normal">
                  60 minutos (menos slots, agenda mais espaçada)
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-primary-hover px-8"
          >
            {isLoading ? "Salvando..." : "Salvar Todas as Configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;