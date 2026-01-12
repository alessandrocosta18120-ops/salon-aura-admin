import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/admin/api/admin_authlogin.asp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o painel...",
        });
        
        // Armazena sessão completa com salonId, userId, slug e role
        if (result.data?.sessionId && result.data?.salonId) {
          const sessionData = {
            sessionId: result.data.sessionId,
            salonId: result.data.salonId,
            userName: result.data.userName || username,
            userId: result.data.userId, // ID do profissional/usuário logado
            slug: result.data.slug, // Slug do salão
            role: result.data.role || 'staff' // Role do usuário (admin, manager, staff)
          };
          sessionStorage.setItem('salon_admin_session', JSON.stringify(sessionData));
        }
        
        navigate("/dashboard");
      } else {
        throw new Error(result.error || "Credenciais inválidas");
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Usuário ou senha inválidos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-muted via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Scissors className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Painel Administrativo</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sistema de gestão de agendamentos digitais
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-primary to-primary-hover"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-center flex flex-wrap justify-center gap-x-2">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/credentials/recovery?type=password")}
                className="text-primary hover:text-primary-hover px-1"
              >
                Esqueci minha senha
              </Button>
              <span className="text-muted-foreground">|</span>
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/credentials/recovery?type=username")}
                className="text-primary hover:text-primary-hover px-1"
              >
                Esqueci meu usuário
              </Button>
            </div>
            
            {/* Notice for new users */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground text-center">
                Não tem cadastro ainda no datebook?{" "}
                <span className="font-medium text-foreground">
                  Cadastre-se para usar a plataforma.
                </span>{" "}
                Acesse{" "}
                <a 
                  href="https://datebook.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-hover underline font-medium"
                >
                  datebook.com.br
                </a>{" "}
                e organize a sua agenda!
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;