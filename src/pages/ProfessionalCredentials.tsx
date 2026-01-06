import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, User, Lock, AlertTriangle } from "lucide-react";
import { credentialsApi, professionalApi } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { sessionManager } from "@/lib/session";

interface CredentialsStatus {
  hasCredentials: boolean;
  isReset: boolean;
  username?: string;
}

const ProfessionalCredentials = () => {
  const navigate = useNavigate();
  const { professionalId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Dados do profissional
  const [professionalName, setProfessionalName] = useState("");
  const [professionalEmail, setProfessionalEmail] = useState("");

  // Status das credenciais
  const [credentialsStatus, setCredentialsStatus] = useState<CredentialsStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

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
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Modo: 'create' (criação inicial) ou 'reset' (redefinição)
  const mode = searchParams.get("mode") || "create";
  const isResetMode = mode === "reset" || credentialsStatus?.isReset;

  // Gera sugestão de username baseado no nome
  const generateUsernameSuggestion = (name: string): string => {
    if (!name) return "";
    const normalized = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]/g, "") // Remove caracteres especiais
      .substring(0, 10); // Max 10 caracteres
    return normalized;
  };

  // Carrega dados do profissional e status das credenciais
  useEffect(() => {
    if (professionalId) {
      loadProfessionalData();
      loadCredentialsStatus();
    }
  }, [professionalId]);

  const loadProfessionalData = async () => {
    try {
      const response = await professionalApi.get();
      if (response.success && response.data) {
        const professional = response.data.find((p: any) => p.id === professionalId);
        if (professional) {
          setProfessionalName(professional.name || "");
          setProfessionalEmail(professional.email || "");
          
          // Gera sugestão de username se for criação
          if (!credentialsStatus?.hasCredentials) {
            const suggestion = generateUsernameSuggestion(professional.name);
            setUsername(suggestion);
            // Valida a sugestão automaticamente
            if (suggestion) {
              checkUsernameAvailability(suggestion);
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar profissional:", error);
    }
  };

  const loadCredentialsStatus = async () => {
    if (!professionalId) return;
    
    setIsLoadingStatus(true);
    try {
      const response = await credentialsApi.getCredentialsStatus(professionalId);
      if (response.success && response.data) {
        setCredentialsStatus(response.data);
        if (response.data.username) {
          setUsername(response.data.username);
        }
      } else {
        // Se não encontrou status, assumir que é criação inicial
        setCredentialsStatus({ hasCredentials: false, isReset: false });
      }
    } catch (error) {
      console.error("Erro ao carregar status das credenciais:", error);
      setCredentialsStatus({ hasCredentials: false, isReset: false });
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

    // Se for edição e o username não mudou, não precisa verificar
    if (credentialsStatus?.username === usernameToCheck) {
      setUsernameAvailable(true);
      setUsernameError("");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError("");

    try {
      const response = await credentialsApi.checkUsername(usernameToCheck);
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
  }, [credentialsStatus?.username]);

  // Efeito para debounce da verificação de username
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

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
    // Limitar a 10 caracteres e remover caracteres especiais
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
      const salonId = sessionManager.getSalonId();
      const userId = sessionManager.getUserId();
      const slug = sessionManager.getSlug();

      const response = await credentialsApi.setCredentials({
        professionalId: professionalId!,
        username,
        password,
      });

      if (response.success) {
        toast({
          title: isResetMode ? "Credenciais redefinidas!" : "Credenciais criadas!",
          description: isResetMode 
            ? "O username e senha foram atualizados com sucesso."
            : "O profissional agora pode acessar o sistema.",
          className: "bg-green-50 border-green-200",
        });

        // Enviar e-mail automaticamente se tiver email cadastrado
        if (professionalEmail) {
          try {
            await credentialsApi.sendResetEmail(professionalId!);
          } catch (emailError) {
            console.error("Erro ao enviar e-mail:", emailError);
          }
        }

        navigate("/dashboard/professionals");
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

  // Enviar e-mail de redefinição
  const handleSendResetEmail = async () => {
    if (!professionalEmail) {
      toast({
        title: "E-mail não cadastrado",
        description: "Este profissional não possui e-mail cadastrado.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      const response = await credentialsApi.sendResetEmail(professionalId!);
      if (response.success) {
        toast({
          title: "E-mail enviado!",
          description: `Um e-mail foi enviado para ${professionalEmail} com instruções.`,
          className: "bg-blue-50 border-blue-200",
        });
      } else {
        throw new Error(response.error || "Erro ao enviar e-mail");
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar e-mail",
        description: error instanceof Error ? error.message : "Não foi possível enviar o e-mail.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pageTitle = isResetMode 
    ? "Redefinir Credenciais" 
    : credentialsStatus?.hasCredentials 
      ? "Alterar Credenciais" 
      : "Criar Credenciais de Acesso";

  const pageDescription = isResetMode
    ? `Redefina o username e senha de ${professionalName}`
    : credentialsStatus?.hasCredentials
      ? `Altere as credenciais de acesso de ${professionalName}`
      : `Crie o username e senha para ${professionalName} acessar o sistema`;

  return (
    <div className="space-y-6">
      <PageHeader 
        title={pageTitle}
        description={pageDescription}
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Credenciais de Acesso
            </CardTitle>
            <CardDescription>
              {credentialsStatus?.hasCredentials 
                ? "Atualize o username e/ou senha do profissional"
                : "Defina o username e senha para o profissional acessar o sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alerta para modo reset */}
            {isResetMode && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Você está redefinindo as credenciais. O profissional receberá um novo username e senha.
                </AlertDescription>
              </Alert>
            )}

            {/* Campo Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Digite o username"
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
                  placeholder="Digite a senha"
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
                  placeholder="Confirme a senha"
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

            {/* Info sobre e-mail */}
            {professionalEmail && (
              <Alert className="bg-blue-50 border-blue-200">
                <Lock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Após salvar, um e-mail será enviado para <strong>{professionalEmail}</strong> com as instruções de acesso e um link para redefinição de senha.
                </AlertDescription>
              </Alert>
            )}

            {!professionalEmail && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Este profissional não possui e-mail cadastrado. Lembre-se de informar o username e senha pessoalmente.
                </AlertDescription>
              </Alert>
            )}

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/professionals")}
                className="flex-1"
              >
                Cancelar
              </Button>

              {credentialsStatus?.hasCredentials && professionalEmail && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendResetEmail}
                  disabled={isSendingEmail}
                  className="flex-1"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Reenviar E-mail"
                  )}
                </Button>
              )}

              <Button
                type="submit"
                disabled={
                  isSubmitting || 
                  !usernameAvailable || 
                  !passwordValidation.valid || 
                  !passwordsMatch
                }
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : credentialsStatus?.hasCredentials ? (
                  "Atualizar Credenciais"
                ) : (
                  "Criar Credenciais"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ProfessionalCredentials;
