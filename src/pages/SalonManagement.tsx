import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Phone, Instagram, Facebook, Youtube, Video, Upload, Calendar, X } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { salonApi, holidayApi } from "@/lib/api";
import { sessionManager } from "@/lib/session";

interface SalonData {
  name: string;
  description: string;
  address: string;
  phone: string;
  workingDays: string[];
  openTime: string;
  closeTime: string;
  selectedTheme: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  mainLogo: File | null;
  secondaryLogo: File | null;
  whatsappCustomText: string;
  evadedClientsReminderText: string;
}

interface Holiday {
  id?: string;
  name: string;
  date: string;
  type: 'municipal' | 'blocked';
  isRecurring?: boolean;
  professionalId?: string;
}

interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
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

const SalonManagement = ({ onBack }: { onBack?: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [municipalHolidays, setMunicipalHolidays] = useState<Holiday[]>([]);
  const [blockedDates, setBlockedDates] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', isRecurring: false, professionalId: '' });
  const [newBlockedDate, setNewBlockedDate] = useState({ name: '', date: '', professionalId: '' });
  
  const [salonData, setSalonData] = useState<SalonData>({
    name: "",
    description: "",
    address: "",
    phone: "",
    workingDays: [],
    openTime: "",
    closeTime: "",
    selectedTheme: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    accentColor: "#10b981",
    successColor: "#10b981",
    warningColor: "#f59e0b",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
    mainLogo: null,
    secondaryLogo: null,
    whatsappCustomText: "",
    evadedClientsReminderText: "",
  });

  useEffect(() => {
    loadSalonData();
    loadThemes();
    loadHolidays();
  }, []);

  const loadSalonData = async () => {
    try {
      const response = await salonApi.get();
      if (response.success && response.data) {
        setSalonData(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Error loading salon data:', error);
    }
  };

  const loadThemes = async () => {
    try {
      const response = await salonApi.getThemes();
      if (response.success) {
        setThemes(response.data || [
          { id: 'azul', name: 'Azul', primaryColor: '#3b82f6', secondaryColor: '#1e40af', accentColor: '#06b6d4', successColor: '#10b981', warningColor: '#f59e0b' },
          { id: 'rosa', name: 'Rosa', primaryColor: '#ec4899', secondaryColor: '#be185d', accentColor: '#f97316', successColor: '#10b981', warningColor: '#fbbf24' },
          { id: 'preto', name: 'Preto', primaryColor: '#1f2937', secondaryColor: '#374151', accentColor: '#6b7280', successColor: '#10b981', warningColor: '#f59e0b' },
          { id: 'cinza', name: 'Cinza', primaryColor: '#6b7280', secondaryColor: '#4b5563', accentColor: '#9ca3af', successColor: '#10b981', warningColor: '#f59e0b' },
          { id: 'verde', name: 'Verde', primaryColor: '#10b981', secondaryColor: '#059669', accentColor: '#34d399', successColor: '#22c55e', warningColor: '#f59e0b' },
        ]);
      }
    } catch (error) {
      console.error('Error loading themes:', error);
    }
  };

  const loadHolidays = async () => {
    try {
      const [municipalResponse, blockedResponse] = await Promise.all([
        holidayApi.getMunicipal(),
        holidayApi.getBlocked()
      ]);
      
      if (municipalResponse.success) {
        setMunicipalHolidays(municipalResponse.data || []);
      }
      if (blockedResponse.success) {
        setBlockedDates(blockedResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading holidays:', error);
    }
  };

  const handleInputChange = (field: keyof SalonData, value: string | File | null) => {
    setSalonData(prev => ({ ...prev, [field]: value }));
  };

  const handleThemeChange = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setSalonData(prev => ({
        ...prev,
        selectedTheme: themeId,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        accentColor: theme.accentColor,
        successColor: theme.successColor,
        warningColor: theme.warningColor,
      }));
    }
  };

  const handleWorkingDayChange = (dayId: string, checked: boolean) => {
    setSalonData(prev => ({
      ...prev,
      workingDays: checked
        ? [...prev.workingDays, dayId]
        : prev.workingDays.filter(id => id !== dayId)
    }));
  };

  const handleAddHoliday = async (type: 'municipal' | 'blocked') => {
    const holiday = type === 'municipal' ? newHoliday : newBlockedDate;
    
    if (!holiday.name || !holiday.date) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e data são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userId = sessionManager.getUserId();
      const salonId = sessionManager.getSalonId();
      const slug = sessionManager.getSlug();
      const dataToSend = { 
        ...holiday, 
        userId, 
        salonId, 
        slug,
        professionalId: holiday.professionalId || null 
      };
      
      const api = type === 'municipal' ? holidayApi.setMunicipal : holidayApi.setBlocked;
      const response = await api(dataToSend);
      
      if (response.success) {
        toast({
          title: "Feriado cadastrado!",
          description: `${holiday.name} foi adicionado com sucesso.`,
          className: "bg-blue-50 border-blue-200",
        });
        if (type === 'municipal') {
          setNewHoliday({ name: '', date: '', isRecurring: false, professionalId: '' });
        } else {
          setNewBlockedDate({ name: '', date: '', professionalId: '' });
        }
        loadHolidays();
      }
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o feriado.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveHoliday = async (id: string, type: 'municipal' | 'blocked') => {
    if (!window.confirm('TEM CERTEZA QUE DESEJA APAGAR O ITEM SELECIONADO?')) {
      return;
    }

    try {
      const api = type === 'municipal' ? holidayApi.deleteMunicipal : holidayApi.deleteBlocked;
      const response = await api(id);
      
      if (response.success) {
        toast({
          title: "Feriado removido!",
          description: "O feriado foi removido com sucesso.",
          className: "bg-blue-50 border-blue-200",
        });
        loadHolidays();
      } else {
        throw new Error(response.error || 'Erro ao remover');
      }
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o feriado.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userId = sessionManager.getUserId();
      const slug = sessionManager.getSlug();
      
      // Prepare payload with userId, slug and all 5 colors (renamed foreground to accent)
      const { salonid, foregroundColor, ...cleanData } = salonData as any;
      const payload = {
        ...cleanData,
        primaryColor: salonData.primaryColor,
        secondaryColor: salonData.secondaryColor,
        accentColor: salonData.accentColor,
        successColor: salonData.successColor,
        warningColor: salonData.warningColor,
        userId,
        slug
      };

      const response = await salonApi.set(payload);
      
      if (response.success) {
        toast({
          title: "Salão atualizado com sucesso!",
          description: "As informações foram salvas.",
          className: "bg-blue-50 border-blue-200",
        });
      } else {
        throw new Error(response.error || 'Erro desconhecido');
      }
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
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        )}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Informações do Salão</h2>
          <p className="text-muted-foreground">
            Configure as informações básicas do seu estabelecimento
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Principais</CardTitle>
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
              <Label htmlFor="description">Descrição (aceita HTML)</Label>
              <Textarea
                id="description"
                value={salonData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descreva seu salão... Você pode usar tags HTML como <b>, <i>, <br>, etc."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Aceita tags HTML básicas para formatação
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappCustomText">Texto personalizado para WhatsApp</Label>
              <Textarea
                id="whatsappCustomText"
                value={salonData.whatsappCustomText}
                onChange={(e) => handleInputChange("whatsappCustomText", e.target.value)}
                placeholder="Texto que será enviado junto com os agendamentos via WhatsApp..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evadedClientsReminderText">Texto para Lembrete à clientes evadidos</Label>
              <Textarea
                id="evadedClientsReminderText"
                value={salonData.evadedClientsReminderText}
                onChange={(e) => handleInputChange("evadedClientsReminderText", e.target.value)}
                placeholder="Mensagem de lembrete para clientes que não retornam há algum tempo..."
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

            {/* Logo Upload Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <FileUpload
                label="Logotipo Principal"
                accept="image/png,image/jpeg"
                onChange={(file) => handleInputChange("mainLogo", file)}
                placeholder="Upload do logotipo principal (PNG/JPG)"
              />
              <FileUpload
                label="Logotipo Secundário"
                accept="image/png,image/jpeg"
                onChange={(file) => handleInputChange("secondaryLogo", file)}
                placeholder="Upload do logotipo secundário (PNG/JPG)"
              />
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

        {/* Holiday Configuration */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Feriados
              </CardTitle>
              <CardDescription>
                Configure os feriados em que o salão não funcionará
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="holidayName">Nome do Feriado</Label>
                  <Input
                    id="holidayName"
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Carnaval, Festa Junina..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holidayDate">Data</Label>
                  <Input
                    id="holidayDate"
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={newHoliday.isRecurring}
                    onCheckedChange={(checked) => setNewHoliday(prev => ({ ...prev, isRecurring: checked as boolean }))}
                  />
                  <Label htmlFor="isRecurring" className="text-sm font-normal cursor-pointer">
                    Feriado Recorrente (todos os anos)
                  </Label>
                </div>
                <Button onClick={() => handleAddHoliday('municipal')} className="w-full">
                  Adicionar Feriado Municipal
                </Button>
              </div>
              
              <div className="space-y-2">
                {municipalHolidays.map((holiday) => (
                  <div key={holiday.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{holiday.name}</p>
                      <p className="text-sm text-muted-foreground">{holiday.date}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHoliday(holiday.id!, 'municipal')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datas Bloqueadas
              </CardTitle>
              <CardDescription>
                Cadastre datas específicas em que o salão não funcionará
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="blockedName">Motivo do Bloqueio</Label>
                  <Input
                    id="blockedName"
                    value={newBlockedDate.name}
                    onChange={(e) => setNewBlockedDate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Viagem, Evento particular..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blockedDate">Data</Label>
                  <Input
                    id="blockedDate"
                    type="date"
                    value={newBlockedDate.date}
                    onChange={(e) => setNewBlockedDate(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <Button onClick={() => handleAddHoliday('blocked')} className="w-full">
                  Adicionar Data Bloqueada
                </Button>
              </div>
              
              <div className="space-y-2">
                {blockedDates.map((date) => (
                  <div key={date.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{date.name}</p>
                      <p className="text-sm text-muted-foreground">{date.date}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHoliday(date.id!, 'blocked')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colors & Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Cores e Identidade Visual</CardTitle>
            <CardDescription>
              Selecione um tema ou personalize as cores do seu site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tema Predefinido</Label>
                <Select
                  value={salonData.selectedTheme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
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
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={salonData.accentColor}
                      onChange={(e) => handleInputChange("accentColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={salonData.accentColor}
                      onChange={(e) => handleInputChange("accentColor", e.target.value)}
                      placeholder="#10b981"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="successColor">Cor de Sucesso</Label>
                  <div className="flex gap-2">
                    <Input
                      id="successColor"
                      type="color"
                      value={salonData.successColor}
                      onChange={(e) => handleInputChange("successColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={salonData.successColor}
                      onChange={(e) => handleInputChange("successColor", e.target.value)}
                      placeholder="#10b981"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warningColor">Cor de Aviso</Label>
                  <div className="flex gap-2">
                    <Input
                      id="warningColor"
                      type="color"
                      value={salonData.warningColor}
                      onChange={(e) => handleInputChange("warningColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={salonData.warningColor}
                      onChange={(e) => handleInputChange("warningColor", e.target.value)}
                      placeholder="#f59e0b"
                      className="flex-1"
                    />
                  </div>
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
                <div className="relative">
                  <Video className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tiktok"
                    value={salonData.tiktok}
                    onChange={(e) => handleInputChange("tiktok", e.target.value)}
                    placeholder="tiktok.com/@seusalao"
                    className="pl-10"
                  />
                </div>
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