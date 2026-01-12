import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Lock, AlertTriangle, KeyRound, CheckCircle } from "lucide-react";
import { credentialsApi } from "@/lib/api";

interface TokenData {
  professionalId: string;
  professionalName: string;
  email: string;
}

const PublicPasswordReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get("token") || "";

  // Estado de validação do token
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState("");

  // Campos do formulário
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado de submissão
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validação do token ao carregar a página
  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setTokenValid(false);
      setTokenError("Link inválido. Verifique se o link está completo.");
      setIsLoadingToken(false);
    }
  }, [token]);

  const validateToken = async () => {
    setIsLoadingToken(true);
    try {
      const response = await credentialsApi.validatePasswordResetToken(token);
      
      if (response.success && response.data) {
        setTokenValid(true);
        setTokenData({
          professionalId: response.data.professionalId,
          professionalName: response.data.professionalName || "Profissional",
          email: response.data.email || "",
        });
      } else {
        setTokenValid(false);
        setTokenError(response.error || "Token inválido ou expirado. Solicite um novo link.");
      }
    } catch (error) {
      console.error("Erro ao validar token:", error);
      setTokenValid(false);
      setTokenError("Erro ao validar o link. Tente novamente.");
    } finally {
      setIsLoadingToken(false);
    }
  };

  // Validação de senha
  const validatePassword = (pwd: string): { valid: boolean; message: string } => {
    if (pwd.length < 6) {
      return { valid: false, message: "Senha deve ter pelo menos 6 caracteres" };
    }
    if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      return { valid: false, message: "Senha deve conter letras e números" };
    }
    return { valid: true, message: "" };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.valid) {
      toast({
        title: "Senha inválida",
        description: passwordValidation.message,
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await credentialsApi.resetPassword({
        token,
        password,
      });

      if (response.success) {
        setIsSuccess(true);
        toast({
          title: "Senha redefinida com sucesso!",
          description: "Agora você pode fazer login com sua nova senha.",
          className: "bg-green-50 border-green-200",
        });
      } else {
        throw new Error(response.error || "Erro ao redefinir senha");
      }
    } catch (error) {
      toast({
        title: "Erro ao redefinir senha",
        description: error instanceof Error ? error.message : "Não foi possível redefinir a senha.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tela de loading
  if (isLoadingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validando link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de token inválido
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Link Inválido</CardTitle>
            <CardDescription>{tokenError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Este link pode ter expirado ou já foi utilizado. Solicite um novo link através da opção "Esqueci minha senha" na tela de login.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate("/login")} 
              className="w-full"
              variant="outline"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de sucesso
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/login")} 
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulário de redefinição de senha
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            Olá, {tokenData?.professionalName}! Digite sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {password && !passwordValidation.valid && (
                <p className="text-sm text-red-500">{passwordValidation.message}</p>
              )}
              {password && passwordValidation.valid && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Senha válida
                </p>
              )}
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-500">As senhas não conferem</p>
              )}
              {passwordsMatch && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Senhas conferem
                </p>
              )}
            </div>

            {/* Requisitos da senha */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">A senha deve conter:</p>
              <ul className="text-sm space-y-1">
                <li className={`flex items-center gap-2 ${password.length >= 6 ? "text-green-600" : "text-muted-foreground"}`}>
                  {password.length >= 6 ? <CheckCircle className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border" />}
                  Pelo menos 6 caracteres
                </li>
                <li className={`flex items-center gap-2 ${/[A-Za-z]/.test(password) ? "text-green-600" : "text-muted-foreground"}`}>
                  {/[A-Za-z]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border" />}
                  Pelo menos uma letra
                </li>
                <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-green-600" : "text-muted-foreground"}`}>
                  {/[0-9]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border" />}
                  Pelo menos um número
                </li>
              </ul>
            </div>

            {/* Botão de submit */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !passwordValidation.valid || !passwordsMatch}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Redefinir Senha
                </>
              )}
            </Button>

            {/* Link para voltar */}
            <div className="text-center">
              <Button 
                type="button"
                variant="link" 
                onClick={() => navigate("/login")}
                className="text-muted-foreground"
              >
                Voltar ao Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicPasswordReset;
