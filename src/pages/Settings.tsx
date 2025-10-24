import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Bell, Shield, MessageSquare, Calendar } from "lucide-react";
import { settingsApi } from "@/lib/api";
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
}

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    sendSocialLinks: true,
    confirmationMessage: "Seu agendamento foi confirmado! Aguardamos você no salão.",
    twoFactorAuth: true,
    notificationMethod: "both",
    minCancelDays: 1,
    allowSameDayCancel: false,
    cancelMessage: "Agendamento cancelado. Entre em contato para reagendar.",
    whatsappApi: "",
    emailProvider: "smtp",
    sessionTimeout: 60,
    maxLoginAttempts: 3,
    timeZone: "America/Sao_Paulo",
  });

  const [confirmationSettings, setConfirmationSettings] = useState({
    enabled: false,
    timing: "previous_day",
    sendTime: "18:00",
    customMessage: ""
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
      
      const confirmResponse = await settingsApi.getConfirmation();
      if (confirmResponse.success && confirmResponse.data) {
        setConfirmationSettings(confirmResponse.data);
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
      const response = await settingsApi.set(settings);
      
      if (response.success) {
        toast({
          title: "Configurações salvas!",
          description: "As configurações foram atualizadas com sucesso.",
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

  const handleConfirmationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await settingsApi.setConfirmation(confirmationSettings);
      
      if (response.success) {
        toast({
          title: "Configurações de confirmação salvas!",
          description: "As configurações de confirmação foram atualizadas.",
        });
      } else {
        throw new Error(response.error || "Erro ao salvar configurações de confirmação");
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as configurações de confirmação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Configure as preferências e integrações do sistema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações e Mensagens
            </CardTitle>
            <CardDescription>
              Configure como os clientes recebem confirmações e lembretes
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
              <Label htmlFor="confirmationMessage">Mensagem de Confirmação</Label>
              <Textarea
                id="confirmationMessage"
                value={settings.confirmationMessage}
                onChange={(e) => handleInputChange("confirmationMessage", e.target.value)}
                placeholder="Personalize a mensagem de confirmação..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationMethod">Método de Notificação</Label>
              <Select
                value={settings.notificationMethod}
                onValueChange={(value) => handleInputChange("notificationMethod", value as "email" | "whatsapp" | "both")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">Apenas SMS</SelectItem>
                  <SelectItem value="whatsapp">Apenas WhatsApp</SelectItem>
                  <SelectItem value="both">SMS e WhatsApp</SelectItem>
                </SelectContent>
              </Select>
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

        {/* Integrações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Integrações
            </CardTitle>
            <CardDescription>
              Configure as integrações com serviços externos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="whatsappApi">API WhatsApp (Token)</Label>
              <Input
                id="whatsappApi"
                type="password"
                value={settings.whatsappApi}
                onChange={(e) => handleInputChange("whatsappApi", e.target.value)}
                placeholder="Token da API do WhatsApp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailProvider">Provedor de E-mail</Label>
              <Select
                value={settings.emailProvider}
                onValueChange={(value) => handleInputChange("emailProvider", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP Personalizado</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                </SelectContent>
              </Select>
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

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-primary-hover px-8"
          >
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>

      {/* Confirmation Message Settings */}
      <form onSubmit={handleConfirmationSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensagem de Confirmação
            </CardTitle>
            <CardDescription>
              Configure o envio automático de mensagens de confirmação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="confirmationEnabled"
                checked={confirmationSettings.enabled}
                onCheckedChange={(checked) =>
                  setConfirmationSettings(prev => ({ ...prev, enabled: checked }))
                }
              />
              <Label htmlFor="confirmationEnabled" className="text-sm font-medium">
                Ativar mensagens de confirmação automáticas
              </Label>
            </div>

            {confirmationSettings.enabled && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Quando enviar</Label>
                    <Select
                      value={confirmationSettings.timing}
                      onValueChange={(value) =>
                        setConfirmationSettings(prev => ({ ...prev, timing: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="previous_day">Dia anterior ao agendamento</SelectItem>
                        <SelectItem value="morning">Manhã do dia do agendamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sendTime">Horário de envio</Label>
                    <Input
                      id="sendTime"
                      type="time"
                      value={confirmationSettings.sendTime}
                      onChange={(e) =>
                        setConfirmationSettings(prev => ({ ...prev, sendTime: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customMessage">Mensagem personalizada</Label>
                  <Textarea
                    id="customMessage"
                    value={confirmationSettings.customMessage}
                    onChange={(e) =>
                      setConfirmationSettings(prev => ({ ...prev, customMessage: e.target.value }))
                    }
                    placeholder="Digite a mensagem que será enviada para confirmar o agendamento..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se deixar em branco, será usada a mensagem padrão do sistema
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !confirmationSettings.enabled}
            className="bg-gradient-to-r from-secondary to-secondary-hover px-8"
          >
            {isLoading ? "Salvando..." : "Salvar Configurações de Confirmação"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;