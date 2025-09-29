import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Phone, MessageSquare } from "lucide-react";
import { clientApi } from "@/lib/api";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
}

interface FixedClient {
  id: string;
  clientId: string;
  name: string;
  phone: string;
  frequency: 'semanal' | 'quinzenal' | 'mensal';
  weekDay: string;
  time: string;
  professionalId: string;
  serviceId: string;
  active: boolean;
}

const ClientsManagement = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'registered' | 'fixed' | 'churned'>('registered');
  const [clients, setClients] = useState<Client[]>([]);
  const [fixedClients, setFixedClients] = useState<FixedClient[]>([]);
  const [churnedClients, setChurnedClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fixed client form
  const [newFixedClient, setNewFixedClient] = useState({
    name: '',
    phone: '',
    frequency: 'semanal' as 'semanal' | 'quinzenal' | 'mensal',
    weekDay: '',
    time: '',
    professionalId: '',
    serviceId: ''
  });

  // Reminder message for churned clients
  const [reminderMessage, setReminderMessage] = useState('');
  const [selectedChurned, setSelectedChurned] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'registered') {
        const response = await clientApi.get();
        if (response.success) {
          setClients(response.data || []);
        }
      } else if (activeTab === 'fixed') {
        const response = await clientApi.getFixed();
        if (response.success) {
          setFixedClients(response.data || []);
        }
      } else if (activeTab === 'churned') {
        const response = await clientApi.getChurned();
        if (response.success) {
          setChurnedClients(response.data || []);
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações dos clientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFixedClient = async () => {
    if (!newFixedClient.name || !newFixedClient.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await clientApi.setFixed(newFixedClient);
      if (response.success) {
        toast({
          title: "Cliente fixo cadastrado!",
          description: "Cliente foi adicionado aos agendamentos automáticos.",
        });
        setNewFixedClient({
          name: '',
          phone: '',
          frequency: 'semanal',
          weekDay: '',
          time: '',
          professionalId: '',
          serviceId: ''
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o cliente fixo.",
        variant: "destructive",
      });
    }
  };

  const handleSendReminders = async () => {
    if (selectedChurned.length === 0 || !reminderMessage) {
      toast({
        title: "Dados incompletos",
        description: "Selecione clientes e digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await clientApi.sendReminder({
        clientIds: selectedChurned,
        message: reminderMessage
      });
      
      if (response.success) {
        toast({
          title: "Lembretes enviados!",
          description: `Mensagens enviadas para ${selectedChurned.length} clientes.`,
        });
        setSelectedChurned([]);
        setReminderMessage('');
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar os lembretes.",
        variant: "destructive",
      });
    }
  };

  const weekDays = [
    { value: '1', label: 'Segunda-feira' },
    { value: '2', label: 'Terça-feira' },
    { value: '3', label: 'Quarta-feira' },
    { value: '4', label: 'Quinta-feira' },
    { value: '5', label: 'Sexta-feira' },
    { value: '6', label: 'Sábado' },
    { value: '7', label: 'Domingo' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Clientes</h2>
          <p className="text-muted-foreground">
            Gerencie clientes cadastrados, fixos e evadidos
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'registered' ? 'default' : 'outline'}
          onClick={() => setActiveTab('registered')}
        >
          <Users className="h-4 w-4 mr-2" />
          Clientes Cadastrados
        </Button>
        <Button
          variant={activeTab === 'fixed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('fixed')}
        >
          <Users className="h-4 w-4 mr-2" />
          Clientes Fixos
        </Button>
        <Button
          variant={activeTab === 'churned' ? 'default' : 'outline'}
          onClick={() => setActiveTab('churned')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Clientes Evadidos
        </Button>
      </div>

      {/* Registered Clients */}
      {activeTab === 'registered' && (
        <Card>
          <CardHeader>
            <CardTitle>Clientes Cadastrados</CardTitle>
            <CardDescription>
              Lista de todos os clientes por ordem alfabética
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Carregando...</p>
            ) : (
              <div className="space-y-2">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Último agendamento: {client.lastVisit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  </div>
                ))}
                {clients.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum cliente cadastrado
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fixed Clients */}
      {activeTab === 'fixed' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Cliente Fixo</CardTitle>
              <CardDescription>
                Cliente será agendado automaticamente na frequência configurada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fixedName">Nome do Cliente *</Label>
                  <Input
                    id="fixedName"
                    value={newFixedClient.name}
                    onChange={(e) => setNewFixedClient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fixedPhone">WhatsApp *</Label>
                  <Input
                    id="fixedPhone"
                    value={newFixedClient.phone}
                    onChange={(e) => setNewFixedClient(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={newFixedClient.frequency}
                    onValueChange={(value: 'semanal' | 'quinzenal' | 'mensal') =>
                      setNewFixedClient(prev => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dia da Semana</Label>
                  <Select
                    value={newFixedClient.weekDay}
                    onValueChange={(value) =>
                      setNewFixedClient(prev => ({ ...prev, weekDay: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fixedTime">Horário</Label>
                  <Input
                    id="fixedTime"
                    type="time"
                    value={newFixedClient.time}
                    onChange={(e) => setNewFixedClient(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleAddFixedClient} className="w-full">
                Cadastrar Cliente Fixo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes Fixos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fixedClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.frequency} - {weekDays.find(d => d.value === client.weekDay)?.label} às {client.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  </div>
                ))}
                {fixedClients.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum cliente fixo cadastrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Churned Clients */}
      {activeTab === 'churned' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Evadidos</CardTitle>
              <CardDescription>
                Clientes que não agendaram nos últimos 3 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnedClients.map((client) => (
                  <div key={client.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedChurned.includes(client.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedChurned(prev => [...prev, client.id]);
                        } else {
                          setSelectedChurned(prev => prev.filter(id => id !== client.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Última visita: {client.lastVisit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {churnedClients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Enviar Lembrete</CardTitle>
                <CardDescription>
                  Mensagem para atrair clientes evadidos de volta ao salão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderMessage">Mensagem de Lembrete</Label>
                  <textarea
                    id="reminderMessage"
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    placeholder="Digite sua mensagem para reconquistar o cliente..."
                    rows={4}
                    className="w-full p-3 border border-input rounded-md resize-none"
                  />
                </div>
                <Button
                  onClick={handleSendReminders}
                  disabled={selectedChurned.length === 0 || !reminderMessage}
                  className="w-full"
                >
                  Enviar para {selectedChurned.length} Cliente(s) Selecionado(s)
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientsManagement;