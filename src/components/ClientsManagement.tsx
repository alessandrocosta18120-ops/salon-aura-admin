import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Users, Phone, MessageSquare, X, Search } from "lucide-react";
import { clientApi, professionalApi, serviceApi } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { sessionManager } from "@/lib/session";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SortControls, SortDirection, SortField } from "@/components/ui/sort-controls";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  createdAt?: string;
}

interface Professional {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
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
  createdAt?: string;
}

const ClientsManagement = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'registered' | 'fixed' | 'churned'>('registered');
  const [clients, setClients] = useState<Client[]>([]);
  const [fixedClients, setFixedClients] = useState<FixedClient[]>([]);
  const [churnedClients, setChurnedClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
  const [churnedPeriod, setChurnedPeriod] = useState('3');
  const [reminderMethod, setReminderMethod] = useState<'sms' | 'whatsapp' | 'both'>('both');
  
  // Broadcast message for registered clients
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastMethod, setBroadcastMethod] = useState<'sms' | 'whatsapp' | 'both'>('both');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const [editingFixedClient, setEditingFixedClient] = useState<FixedClient | null>(null);

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    loadData();
    loadProfessionals();
    loadServices();
  }, [activeTab]);

  const loadProfessionals = async () => {
    try {
      const response = await professionalApi.get();
      if (response.success && response.data) {
        setProfessionals(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await serviceApi.get();
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    }
  };

  // Sorting and filtering logic
  const sortAndFilter = <T extends { name: string; phone: string; lastVisit?: string; createdAt?: string }>(
    items: T[]
  ): T[] => {
    let filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm)
    );

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'phone') {
        comparison = a.phone.localeCompare(b.phone);
      } else if (sortField === 'date') {
        const dateA = a.lastVisit || a.createdAt || '';
        const dateB = b.lastVisit || b.createdAt || '';
        comparison = dateA.localeCompare(dateB);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  // Memoized filtered/sorted data
  const filteredClients = useMemo(() => sortAndFilter(clients), [clients, searchTerm, sortField, sortDirection]);
  const filteredFixedClients = useMemo(() => sortAndFilter(fixedClients), [fixedClients, searchTerm, sortField, sortDirection]);
  const filteredChurnedClients = useMemo(() => sortAndFilter(churnedClients), [churnedClients, searchTerm, sortField, sortDirection]);

  // Paginated data
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  const paginatedFixedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFixedClients.slice(start, start + pageSize);
  }, [filteredFixedClients, currentPage, pageSize]);

  const paginatedChurnedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredChurnedClients.slice(start, start + pageSize);
  }, [filteredChurnedClients, currentPage, pageSize]);

  // Total pages calculation
  const getTotalPages = (totalItems: number) => Math.ceil(totalItems / pageSize) || 1;

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditFixedClient = (client: FixedClient) => {
    setEditingFixedClient(client);
    // Normaliza para string para compatibilidade com Select
    setNewFixedClient({
      name: client.name,
      phone: client.phone,
      frequency: client.frequency,
      weekDay: String(client.weekDay),
      time: client.time,
      professionalId: String(client.professionalId),
      serviceId: String(client.serviceId)
    });
  };

  const handleCancelEdit = () => {
    setEditingFixedClient(null);
    setNewFixedClient({
      name: '',
      phone: '',
      frequency: 'semanal',
      weekDay: '',
      time: '',
      professionalId: '',
      serviceId: ''
    });
  };

  const handleDeleteFixedClient = async (id: string) => {
    if (!window.confirm('TEM CERTEZA QUE DESEJA APAGAR O CLIENTE FIXO SELECIONADO?')) {
      return;
    }

    try {
      const response = await clientApi.deleteFixed(id);
      if (response.success) {
        toast({
          title: "Cliente fixo apagado!",
          description: "O cliente foi removido dos agendamentos automáticos.",
          className: "bg-blue-50 border-blue-200",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Erro ao apagar",
        description: "Não foi possível apagar o cliente fixo.",
        variant: "destructive",
      });
    }
  };

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
          // Normaliza os dados para garantir que os IDs sejam strings
          const normalizedData = (response.data || []).map((client: FixedClient) => ({
            ...client,
            weekDay: String(client.weekDay),
            professionalId: String(client.professionalId),
            serviceId: String(client.serviceId)
          }));
          setFixedClients(normalizedData);
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
      const userId = sessionManager.getUserId();
      const salonId = sessionManager.getSalonId();
      const slug = sessionManager.getSlug();
      const dataToSend: any = { ...newFixedClient, userId, salonId, slug };
      
      if (editingFixedClient) {
        dataToSend.id = editingFixedClient.id;
      }
      
      const response = await clientApi.setFixed(dataToSend);
      if (response.success) {
        toast({
          title: editingFixedClient ? "Cliente fixo atualizado!" : "Cliente fixo cadastrado!",
          description: editingFixedClient 
            ? "Agendamento automático atualizado com sucesso."
            : "Cliente foi adicionado aos agendamentos automáticos.",
          className: "bg-blue-50 border-blue-200",
        });
        handleCancelEdit();
        loadData();
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cliente fixo.",
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
        message: reminderMessage,
        method: reminderMethod
      });
      
      if (response.success) {
        toast({
          title: "Lembretes enviados!",
          description: `Mensagens enviadas para ${selectedChurned.length} clientes via ${reminderMethod === 'both' ? 'SMS e WhatsApp' : reminderMethod.toUpperCase()}.`,
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

  const handleSendBroadcast = async () => {
    if (selectedClients.length === 0 || !broadcastMessage) {
      toast({
        title: "Dados incompletos",
        description: "Selecione clientes e digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await clientApi.sendBroadcast({
        clientIds: selectedClients,
        message: broadcastMessage,
        method: broadcastMethod
      });
      
      if (response.success) {
        toast({
          title: "Mensagens enviadas!",
          description: `Mensagens enviadas para ${selectedClients.length} clientes via ${broadcastMethod === 'both' ? 'SMS e WhatsApp' : broadcastMethod.toUpperCase()}.`,
        });
        setSelectedClients([]);
        setBroadcastMessage('');
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar as mensagens.",
        variant: "destructive",
      });
    }
  };

  const weekDays = [
    { value: '1', label: 'Domingo' },
    { value: '2', label: 'Segunda-feira' },
    { value: '3', label: 'Terça-feira' },
    { value: '4', label: 'Quarta-feira' },
    { value: '5', label: 'Quinta-feira' },
    { value: '6', label: 'Sexta-feira' },
    { value: '7', label: 'Sábado' },
  ];

  // Search and sort controls component
  const SearchAndSortControls = ({ showDateSort = true }: { showDateSort?: boolean }) => (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <SortControls
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        showDateSort={showDateSort}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gerenciamento de Clientes"
        description="Gerencie clientes cadastrados, fixos e evadidos"
        showBack={false}
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === 'registered' ? 'default' : 'outline'}
          onClick={() => setActiveTab('registered')}
        >
          <Users className="h-4 w-4 mr-2" />
          Cadastrados ({clients.length})
        </Button>
        <Button
          variant={activeTab === 'fixed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('fixed')}
        >
          <Users className="h-4 w-4 mr-2" />
          Fixos ({fixedClients.length})
        </Button>
        <Button
          variant={activeTab === 'churned' ? 'default' : 'outline'}
          onClick={() => setActiveTab('churned')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Evadidos ({churnedClients.length})
        </Button>
      </div>

      {/* Registered Clients */}
      {activeTab === 'registered' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Cadastrados</CardTitle>
              <CardDescription>
                Lista de todos os clientes com busca e ordenação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchAndSortControls />
              
              {isLoading ? (
                <p>Carregando...</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {paginatedClients.map((client) => (
                      <div key={client.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedClients(prev => [...prev, client.id]);
                            } else {
                              setSelectedClients(prev => prev.filter(id => id !== client.id));
                            }
                          }}
                        />
                        <div className="flex-1">
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
                    {paginatedClients.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                      </p>
                    )}
                  </div>
                  
                  {filteredClients.length > 0 && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={getTotalPages(filteredClients.length)}
                      pageSize={pageSize}
                      totalItems={filteredClients.length}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensagem em Massa</CardTitle>
              <CardDescription>
                Envie felicitações, promoções, avisos gerais e datas comemorativas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Método de Envio</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="broadcast-sms"
                      checked={broadcastMethod === 'sms' || broadcastMethod === 'both'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBroadcastMethod(broadcastMethod === 'whatsapp' ? 'both' : 'sms');
                        } else {
                          setBroadcastMethod(broadcastMethod === 'both' ? 'whatsapp' : 'sms');
                        }
                      }}
                    />
                    <Label htmlFor="broadcast-sms" className="cursor-pointer">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="broadcast-whatsapp"
                      checked={broadcastMethod === 'whatsapp' || broadcastMethod === 'both'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBroadcastMethod(broadcastMethod === 'sms' ? 'both' : 'whatsapp');
                        } else {
                          setBroadcastMethod(broadcastMethod === 'both' ? 'sms' : 'whatsapp');
                        }
                      }}
                    />
                    <Label htmlFor="broadcast-whatsapp" className="cursor-pointer">WhatsApp</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="broadcastMessage">Mensagem</Label>
                <textarea
                  id="broadcastMessage"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Digite sua mensagem promocional, felicitação ou aviso geral..."
                  rows={6}
                  className="w-full p-3 border border-input rounded-md resize-none"
                />
              </div>
              <Button
                onClick={handleSendBroadcast}
                disabled={selectedClients.length === 0 || !broadcastMessage}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar para {selectedClients.length} Cliente(s) Selecionado(s)
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fixed Clients */}
      {activeTab === 'fixed' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingFixedClient ? 'Editar Cliente Fixo' : 'Cadastrar Cliente Fixo'}</CardTitle>
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Profissional *</Label>
                  <Select
                    value={newFixedClient.professionalId}
                    onValueChange={(value) =>
                      setNewFixedClient(prev => ({ ...prev, professionalId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id}>
                          {prof.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Serviço *</Label>
                  <Select
                    value={newFixedClient.serviceId}
                    onValueChange={(value) =>
                      setNewFixedClient(prev => ({ ...prev, serviceId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddFixedClient} className="flex-1">
                  {editingFixedClient ? 'Atualizar Cliente Fixo' : 'Cadastrar Cliente Fixo'}
                </Button>
                {editingFixedClient && (
                  <Button onClick={handleCancelEdit} variant="outline">
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes Fixos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchAndSortControls showDateSort={false} />
              
              <div className="space-y-2">
                {paginatedFixedClients.map((client) => (
                  <div key={client.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.frequency} - {weekDays.find(d => d.value === client.weekDay)?.label} às {client.time}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditFixedClient(client)}
                      >
                        Alterar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteFixedClient(client.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {paginatedFixedClients.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente fixo cadastrado'}
                  </p>
                )}
              </div>
              
              {filteredFixedClients.length > 0 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={getTotalPages(filteredFixedClients.length)}
                  pageSize={pageSize}
                  totalItems={filteredFixedClients.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Churned Clients */}
      {activeTab === 'churned' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Período</CardTitle>
              <CardDescription>
                Defina o período de inatividade para identificar clientes evadidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <Label htmlFor="churnedPeriod">Clientes que não agendaram há</Label>
                <Input
                  id="churnedPeriod"
                  type="number"
                  min="1"
                  max="12"
                  value={churnedPeriod}
                  onChange={(e) => setChurnedPeriod(e.target.value)}
                  className="w-20"
                />
                <span>meses</span>
                <Button onClick={loadData} variant="outline">
                  Atualizar Lista
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes Evadidos</CardTitle>
              <CardDescription>
                Clientes que não agendaram nos últimos {churnedPeriod} meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchAndSortControls />
              
              <div className="space-y-4">
                {paginatedChurnedClients.map((client) => (
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
                {paginatedChurnedClients.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente evadido no período'}
                  </p>
                )}
              </div>
              
              {filteredChurnedClients.length > 0 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={getTotalPages(filteredChurnedClients.length)}
                  pageSize={pageSize}
                  totalItems={filteredChurnedClients.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enviar Lembrete</CardTitle>
              <CardDescription>
                Mensagem para atrair clientes evadidos de volta ao salão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Método de Envio</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reminder-sms"
                      checked={reminderMethod === 'sms' || reminderMethod === 'both'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setReminderMethod(reminderMethod === 'whatsapp' ? 'both' : 'sms');
                        } else {
                          setReminderMethod(reminderMethod === 'both' ? 'whatsapp' : 'sms');
                        }
                      }}
                    />
                    <Label htmlFor="reminder-sms" className="cursor-pointer">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reminder-whatsapp"
                      checked={reminderMethod === 'whatsapp' || reminderMethod === 'both'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setReminderMethod(reminderMethod === 'sms' ? 'both' : 'whatsapp');
                        } else {
                          setReminderMethod(reminderMethod === 'both' ? 'sms' : 'whatsapp');
                        }
                      }}
                    />
                    <Label htmlFor="reminder-whatsapp" className="cursor-pointer">WhatsApp</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminderMessage">Mensagem de Lembrete</Label>
                <textarea
                  id="reminderMessage"
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Digite sua mensagem para reconquistar o cliente..."
                  rows={6}
                  className="w-full p-3 border border-input rounded-md resize-none"
                />
              </div>
              <Button
                onClick={handleSendReminders}
                disabled={selectedChurned.length === 0 || !reminderMessage}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar para {selectedChurned.length} Cliente(s) Selecionado(s)
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientsManagement;
