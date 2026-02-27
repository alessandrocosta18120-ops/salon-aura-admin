import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/PageHeader";
import { Search, LogIn, Users, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { webmasterApi, WmUser } from "@/lib/webmasterApi";
import { sessionManager } from "@/lib/session";

const WebmasterUsers = () => {
  const [users, setUsers] = useState<WmUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await webmasterApi.getAllUsers({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      });
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleImpersonate = async (user: WmUser) => {
    try {
      const response = await webmasterApi.impersonateUser(user.id);
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
            description: `Acessando como "${user.name}" (${user.role})`,
          });
          navigate("/dashboard");
          window.location.reload();
        }
      } else {
        toast({ title: "Erro", description: "Não foi possível acessar este usuário.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha na impersonação.", variant: "destructive" });
    }
  };

  const handleToggleActive = async (user: WmUser) => {
    try {
      const response = await webmasterApi.toggleUserActive(user.id, !user.active);
      if (response.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: !u.active } : u));
        toast({ title: user.active ? "Usuário desativado" : "Usuário ativado" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao alterar status.", variant: "destructive" });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge variant="default">Admin</Badge>;
      case "manager": return <Badge variant="secondary">Gerente</Badge>;
      case "staff": return <Badge variant="outline">Profissional</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.salonName?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciar Usuários"
        description="Visualize e acesse todos os usuários de todos os salões"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários do Sistema ({filteredUsers.length})
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar usuário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-64"
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filtrar role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="staff">Profissional</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando usuários...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Salão</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.username}</TableCell>
                      <TableCell>{user.salonName || `ID: ${user.salonId}`}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.email && <div>{user.email}</div>}
                          {user.phone && <div className="text-muted-foreground">{user.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(user)}
                            title={user.active ? "Desativar" : "Ativar"}
                          >
                            {user.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleImpersonate(user)}
                            title="Acessar como este usuário"
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

export default WebmasterUsers;
