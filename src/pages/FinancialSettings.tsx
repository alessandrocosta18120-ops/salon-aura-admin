import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, CreditCard, Building } from "lucide-react";
import { settingsApi } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { sessionManager } from "@/lib/session";

interface FinancialData {
  enablePayment: boolean;
  bankCode: string;
  bankName: string;
  accountType: string;
  agencyNumber: string;
  agencyDigit: string;
  accountNumber: string;
  accountDigit: string;
  accountHolderName: string;
  accountHolderCPF: string;
  pixKey: string;
  pixKeyType: string;
  additionalInfo: string;
}

const FinancialSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FinancialData>({
    enablePayment: false,
    bankCode: "",
    bankName: "",
    accountType: "corrente",
    agencyNumber: "",
    agencyDigit: "",
    accountNumber: "",
    accountDigit: "",
    accountHolderName: "",
    accountHolderCPF: "",
    pixKey: "",
    pixKeyType: "cpf",
    additionalInfo: "",
  });

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const response = await settingsApi.getFinancial();
      if (response.success && response.data) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    }
  };

  const handleInputChange = (field: keyof FinancialData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const salonId = sessionManager.getSalonId();
      const dataToSend = { ...formData, salonId };
      
      const response = await settingsApi.setFinancial(dataToSend);
      
      if (response.success) {
        toast({
          title: "Dados salvos com sucesso!",
          description: "As configurações financeiras foram atualizadas.",
          className: "bg-blue-50 border-blue-200",
        });
      } else {
        throw new Error(response.error || "Erro ao salvar");
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações financeiras.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Configurações Financeiras"
        description="Configure os dados bancários e opções de pagamento"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pagamento na Plataforma
            </CardTitle>
            <CardDescription>
              Habilite a cobrança diretamente na plataforma de agendamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="enablePayment"
                checked={formData.enablePayment}
                onCheckedChange={(checked) => handleInputChange("enablePayment", checked)}
              />
              <Label htmlFor="enablePayment" className="cursor-pointer">
                Habilitar cobrança na plataforma de agendamento
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Dados Bancários
            </CardTitle>
            <CardDescription>
              Informações da conta bancária para recebimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankCode">Código do Banco</Label>
                <Input
                  id="bankCode"
                  value={formData.bankCode}
                  onChange={(e) => handleInputChange("bankCode", e.target.value)}
                  placeholder="Ex: 001, 237, 341"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Nome do Banco</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  placeholder="Ex: Banco do Brasil, Itaú, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo de Conta</Label>
                <select
                  id="accountType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.accountType}
                  onChange={(e) => handleInputChange("accountType", e.target.value)}
                >
                  <option value="corrente">Conta Corrente</option>
                  <option value="poupanca">Conta Poupança</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Nome do Titular</Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                  placeholder="Nome completo do titular"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolderCPF">CPF do Titular</Label>
                <Input
                  id="accountHolderCPF"
                  value={formData.accountHolderCPF}
                  onChange={(e) => handleInputChange("accountHolderCPF", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="agencyNumber">Agência</Label>
                <Input
                  id="agencyNumber"
                  value={formData.agencyNumber}
                  onChange={(e) => handleInputChange("agencyNumber", e.target.value)}
                  placeholder="0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencyDigit">Dígito da Agência</Label>
                <Input
                  id="agencyDigit"
                  value={formData.agencyDigit}
                  onChange={(e) => handleInputChange("agencyDigit", e.target.value)}
                  placeholder="0"
                  maxLength={1}
                />
              </div>

              <div className="space-y-2"></div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Número da Conta</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  placeholder="00000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountDigit">Dígito da Conta</Label>
                <Input
                  id="accountDigit"
                  value={formData.accountDigit}
                  onChange={(e) => handleInputChange("accountDigit", e.target.value)}
                  placeholder="0"
                  maxLength={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pix
            </CardTitle>
            <CardDescription>
              Configurações para recebimento via Pix
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pixKeyType">Tipo de Chave Pix</Label>
                <select
                  id="pixKeyType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.pixKeyType}
                  onChange={(e) => handleInputChange("pixKeyType", e.target.value)}
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave Pix</Label>
                <Input
                  id="pixKey"
                  value={formData.pixKey}
                  onChange={(e) => handleInputChange("pixKey", e.target.value)}
                  placeholder="Digite sua chave Pix"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Informações Adicionais</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                placeholder="Instruções adicionais para pagamento..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-primary-hover px-8"
          >
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FinancialSettings;
