import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, User, Lock, AlertTriangle, KeyRound } from "lucide-react";
import { credentialsApi } from "@/lib/api";

interface CredentialsStatus {
  hasCredentials: boolean;
  isReset: boolean;
  username?: string;
  professionalName?: string;
}

const PublicCredentialsReset = () => {
  const navigate = useNavigate();
  const { professionalId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get("token") || "";

  // Status das credenciais
  const [credentialsStatus, setCredentialsStatus] = useState<CredentialsStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState("");

  // Campos do formulário
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validação do username
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");

  // Estado geral
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega e valida token e status das credenciais
  useEffect(() => {
    if (professionalId && token) {
      validateTokenAndLoadStatus();
    } else {
      setTokenValid(false);
      setTokenError("Link inválido. Verifique se o link está completo.");
      setIsLoadingStatus(false);
    }
  }, [professionalId, token]);

  const validateTokenAndLoadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      // Valida o token e carrega status das credenciais
      const response = await credentialsApi.validateResetToken(professionalId!, token);
      
      if (response.success && response.data) {
        setTokenValid(true);
        setCredentialsStatus({
          hasCredentials: response.data.hasCredentials || false,
          isReset: true,
          username: response.data.username || "",
          professionalName: response.data.professionalName || "Profissional"
        });
        if (response.data.username) {
          setUsername(response.data.username);
        }
      } else {
        setTokenValid(false);
        setTokenError(response.error || "Token inválido ou expirado. Solicite um novo link.");
      }
    } catch (error) {
      console.error("Erro ao validar token:", error);
      setTokenValid(false);
      setTokenError("Erro ao validar o link. Tente novamente.");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Debounce para verificação de username
  const checkUsernameAvailability = useCallback(async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      setUsernameError(usernameToCheck.length > 0 && usernameToCheck.length < 3 
        ? "Username deve ter pelo menos 3 caracteres" 
        : "");
      return;
    }

    if (usernameToCheck.length > 10) {
      setUsernameAvailable(false);
      setUsernameError("Username deve ter no máximo 10 caracteres");
      return;
    }

    // Se o username não mudou do original, está disponível
    if (credentialsStatus?.username === usernameToCheck) {
      setUsernameAvailable(true);
      setUsernameError("");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError("");

    try {
      const response = await credentialsApi.checkUsernamePublic(usernameToCheck, professionalId!, token);
      if (response.success) {
        const isAvailable = response.data?.available !== false;
        setUsernameAvailable(isAvailable);
        if (!isAvailable) {
          setUsernameError("Este username já está em uso. Escolha outro.");
        }
      } else {
        setUsernameAvailable(null);
        setUsernameError("Erro ao verificar disponibilidade");
      }
    } catch (error) {
      setUsernameAvailable(null);
      setUsernameError("Erro ao verificar disponibilidade");
    } finally {
      setIsCheckingUsername(false);
    }
  }, [credentialsStatus?.username, professionalId, token]);

  // Efeito para debounce da verificação de username
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username && tokenValid) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability, tokenValid]);

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

  // Handler do username com limite de caracteres
  const handleUsernameChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .substring(0, 10);
    setUsername(sanitized);
    setUsernameAvailable(null);
  };

  // Submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!username || username.length < 3) {
      toast({
        title: "Username inválido",
        description: "O username deve ter pelo menos 3 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (!usernameAvailable && credentialsStatus?.username !== username) {
      toast({
        title: "Username indisponível",
        description: "Por favor, escolha outro username.",
        variant: "destructive",
      });
      return;
    }

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
      const response = await credentialsApi.setCredentialsPublic({
        professionalId: professionalId!,
        username,
        password,
        token,
      });

      if (response.success) {
        toast({
          title: "Credenciais definidas com sucesso!",
          description: "Agora você pode fazer login com seu username e senha.",
          className: "bg-green-50 border-green-200",
        });

        // Redireciona para a tela de login após sucesso
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(response.error || "Erro ao salvar credenciais");
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
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
                Este link pode ter expirado ou já foi utilizado. Entre em contato com o administrador do salão para solicitar um novo link.
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Definir Credenciais de Acesso</CardTitle>
          <CardDescription>
            Olá, {credentialsStatus?.professionalName}! Defina seu username e senha para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Digite seu username"
                  maxLength={10}
                  className={`pr-10 ${
                    usernameError 
                      ? "border-red-500 focus:ring-red-500" 
                      : usernameAvailable === true 
                        ? "border-green-500 focus:ring-green-500" 
                        : ""
                  }`}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isCheckingUsername ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : usernameAvailable === true ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : usernameAvailable === false ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : null}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm ${usernameError ? "text-red-500" : "text-muted-foreground"}`}>
                  {usernameError || `${username.length}/10 caracteres`}
                </p>
                {usernameAvailable && !usernameError && (
                  <p className="text-sm text-green-600">Username disponível!</p>
                )}
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
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
                <p className="text-sm text-green-600">Senha válida!</p>
              )}
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
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
                <p className="text-sm text-green-600">Senhas conferem!</p>
              )}
            </div>

            {/* Botões */}
            <div className="space-y-3 pt-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={
                  isSubmitting || 
                  !username || 
                  !password || 
                  !confirmPassword ||
                  !passwordValidation.valid ||
                  !passwordsMatch ||
                  (usernameAvailable === false)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Definir Credenciais
                  </>
                )}
              </Button>
            </div>

            {/* Info */}
            <Alert className="bg-blue-50 border-blue-200">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Após definir suas credenciais, você será redirecionado para a tela de login.
              </AlertDescription>
            </Alert>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicCredentialsReset;
