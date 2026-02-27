import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { Search, LogIn, Store, Users, Calendar, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { webmasterApi, WmSalon } from "@/lib/webmasterApi";
import { sessionManager } from "@/lib/session";

const WebmasterSalons = () => {
  const [salons, setSalons] = useState<WmSalon[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadSalons();
  }, []);

  const loadSalons = async () => {
    setIsLoading(true);
    try {
      const response = await webmasterApi.getAllSalons({ search: search || undefined });
      if (response.success && response.data) {
        setSalons(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar salões:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadSalons();
  };

  const handleImpersonate = async (salon: WmSalon) => {
    try {
      const response = await webmasterApi.impersonateSalon(salon.id);
      if (response.success && response.data) {
        const success = sessionManager.impersonate({
          sessionId: response.data.sessionId,
          salonId: response.data.salonId,
          userName: response.data.userName,
          userId: response.data.userId,
          slug: response.data.slug,
          role: response.data.role,
        });
        if (success) {
          toast({
            title: "Acesso concedido",
            description: `Acessando como admin do salão "${salon.name}"`,
          });
          navigate("/dashboard");
          window.location.reload();
        }
      } else {
        toast({ title: "Erro", description: "Não foi possível acessar este salão.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha na impersonação.", variant: "destructive" });
    }
  };

  const handleToggleActive = async (salon: WmSalon) => {
    try {
      const response = await webmasterApi.toggleSalonActive(salon.id, !salon.active);
      if (response.success) {
        setSalons(prev => prev.map(s => s.id === salon.id ? { ...s, active: !s.active } : s));
        toast({ title: salon.active ? "Salão desativado" : "Salão ativado" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao alterar status.", variant: "destructive" });
    }
  };

  const filteredSalons = search
    ? salons.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slug?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
      )
    : salons;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciar Salões"
        description="Visualize e acesse todos os salões cadastrados no sistema"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Salões Cadastrados ({filteredSalons.length})
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar salão..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-64"
              />
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando salões...</p>
          ) : filteredSalons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum salão encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salão</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead>Profissionais</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalons.map((salon) => (
                    <TableRow key={salon.id}>
                      <TableCell className="font-medium">{salon.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{salon.slug}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {salon.email && <div>{salon.email}</div>}
                          {salon.phone && <div className="text-muted-foreground">{salon.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {salon.city && salon.state ? `${salon.city}/${salon.state}` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {salon.professionalsCount ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={salon.active ? "default" : "secondary"}>
                          {salon.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(salon)}
                            title={salon.active ? "Desativar" : "Ativar"}
                          >
                            {salon.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleImpersonate(salon)}
                            title="Acessar como admin deste salão"
                          >
                            <LogIn className="h-4 w-4 mr-1" />
                            Acessar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebmasterSalons;
