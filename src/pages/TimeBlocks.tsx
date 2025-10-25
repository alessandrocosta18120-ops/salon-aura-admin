import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, X, ArrowLeft } from "lucide-react";
import { professionalApi, scheduleApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface TimeBlock {
  id?: string;
  professionalId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

interface Professional {
  id: string;
  name: string;
}

const TimeBlocks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [newBlock, setNewBlock] = useState<TimeBlock>({
    professionalId: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  });

  useEffect(() => {
    loadProfessionals();
    loadTimeBlocks();
  }, []);

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

  const loadTimeBlocks = async () => {
    try {
      const response = await scheduleApi.getBlocks();
      if (response.success && response.data) {
        setTimeBlocks(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar bloqueios:", error);
    }
  };

  const handleAddBlock = async () => {
    if (!newBlock.professionalId || !newBlock.date || !newBlock.startTime || !newBlock.endTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar um bloqueio.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await scheduleApi.setBlock(newBlock);
      if (response.success) {
        toast({
          title: "Bloqueio adicionado!",
          description: "O horário foi bloqueado com sucesso.",
        });
        setNewBlock({
          professionalId: "",
          date: "",
          startTime: "",
          endTime: "",
          reason: "",
        });
        loadTimeBlocks();
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar bloqueio",
        description: "Não foi possível adicionar o bloqueio de horário.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveBlock = async (blockId: string) => {
    try {
      const response = await scheduleApi.deleteBlock(blockId);
      if (response.success) {
        toast({
          title: "Bloqueio removido",
          description: "O horário foi desbloqueado com sucesso.",
        });
        loadTimeBlocks();
      }
    } catch (error) {
      toast({
        title: "Erro ao remover bloqueio",
        description: "Não foi possível remover o bloqueio.",
        variant: "destructive",
      });
    }
  };

  const getProfessionalName = (id: string) => {
    return professionals.find(p => p.id === id)?.name || "Desconhecido";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bloqueios de Horários</h2>
          <p className="text-muted-foreground">
            Gerencie os horários bloqueados para cada profissional
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Novo Bloqueio
          </CardTitle>
          <CardDescription>
            Bloqueie horários para almoço, intervalos, compromissos pessoais, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="professional">Profissional *</Label>
              <Select
                value={newBlock.professionalId}
                onValueChange={(value) => setNewBlock(prev => ({ ...prev, professionalId: value }))}
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
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={newBlock.date}
                onChange={(e) => setNewBlock(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de Início *</Label>
              <Input
                id="startTime"
                type="time"
                value={newBlock.startTime}
                onChange={(e) => setNewBlock(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Término *</Label>
              <Input
                id="endTime"
                type="time"
                value={newBlock.endTime}
                onChange={(e) => setNewBlock(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                value={newBlock.reason}
                onChange={(e) => setNewBlock(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Ex: Almoço, Reunião, Buscar filho na escola..."
              />
            </div>
          </div>

          <Button onClick={handleAddBlock} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Bloqueio
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários Bloqueados
          </CardTitle>
          <CardDescription>
            {timeBlocks.length} bloqueio(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeBlocks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum horário bloqueado no momento
              </p>
            ) : (
              timeBlocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{getProfessionalName(block.professionalId)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(block.date).toLocaleDateString('pt-BR')} • {block.startTime} - {block.endTime}
                    </div>
                    {block.reason && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Motivo: {block.reason}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBlock(block.id!)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeBlocks;
