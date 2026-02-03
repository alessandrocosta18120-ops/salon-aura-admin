# Plano de Implementação - Taxa de Reserva e Instruções de Pagamento

**Data:** 03/02/2026

## Resumo das Alterações

Este documento descreve as alterações realizadas no sistema de agendamento para suportar taxa de reserva (sinal) em serviços e instruções de pagamento.

---

## 1. Taxa de Reserva em Serviços

### 1.1 Alterações no Frontend

**Arquivo:** `src/pages/ServiceForm.tsx`

Novos campos adicionados ao formulário de serviços:
- **Checkbox "Exigir taxa de reserva (sinal)"** - Habilita/desabilita a cobrança de taxa
- **Campo "Valor da Taxa de Reserva (R$)"** - Valor monetário com máscara brasileira (exibido apenas quando checkbox está marcado)

### 1.2 Alterações Necessárias na API

**API:** `admin_setadmservices.asp` e `admin_getadmservices.asp`

#### Novos Campos no Payload:

```json
{
  "id": "123",
  "name": "Corte de Cabelo",
  "description": "Corte masculino completo",
  "duration": 60,
  "price": 50.00,
  "professionalIds": ["prof1", "prof2"],
  "isActive": true,
  "requiresDeposit": true,
  "depositAmount": 25.00,
  "salonId": "789",
  "userId": "456",
  "slug": "meu-salao"
}
```

#### Campos Adicionais:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `requiresDeposit` | Boolean | Indica se o serviço exige taxa de reserva |
| `depositAmount` | Decimal | Valor da taxa de reserva em reais |

### 1.3 Alterações no Banco de Dados

**Tabela:** `services` (ou equivalente)

```sql
ALTER TABLE services ADD COLUMN requires_deposit BIT DEFAULT 0;
ALTER TABLE services ADD COLUMN deposit_amount DECIMAL(10,2) DEFAULT 0.00;
```

---

## 2. Instruções de Pagamento

### 2.1 Alterações no Frontend

**Arquivo:** `src/pages/FinancialSettings.tsx`

Novo campo adicionado:
- **Textarea "Instruções de Pagamento de Sinal/Serviço"** - Texto livre para orientar o cliente sobre como realizar pagamentos

### 2.2 Alterações Necessárias na API

**API:** `admin_setadmfinancial.asp` e `admin_getadmfinancial.asp`

#### Novo Campo no Payload:

```json
{
  "enablePayment": true,
  "bankCode": "001",
  "bankName": "Banco do Brasil",
  "accountType": "corrente",
  "agencyNumber": "1234",
  "agencyDigit": "5",
  "accountNumber": "12345",
  "accountDigit": "6",
  "accountHolderName": "João da Silva",
  "accountHolderCPF": "123.456.789-00",
  "pixKey": "joao@email.com",
  "pixKeyType": "email",
  "additionalInfo": "Informações adicionais",
  "paymentInstructions": "Para confirmar seu agendamento, realize o pagamento do sinal via PIX...",
  "salonId": "789"
}
```

#### Campo Adicional:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `paymentInstructions` | Text | Instruções detalhadas para pagamento de sinal ou serviço |

### 2.3 Alterações no Banco de Dados

**Tabela:** `financial_settings` (ou equivalente)

```sql
ALTER TABLE financial_settings ADD COLUMN payment_instructions TEXT;
```

---

## 3. Renomeação de Campo

### 3.1 Alteração no Frontend

**Arquivo:** `src/pages/SalonManagement.tsx`

O label do campo foi alterado de:
- **Antes:** "Texto personalizado para WhatsApp"
- **Depois:** "Texto de Confirmação de Agendamento para WhatsApp"

> **Nota:** Esta alteração é apenas visual (label). O campo `whatsappCustomText` permanece com o mesmo nome na API.

---

## 4. Fluxo de Utilização

### 4.1 Configuração pelo Administrador

1. Acesse **Serviços** > Editar/Criar serviço
2. Marque a opção "Exigir taxa de reserva (sinal)"
3. Informe o valor da taxa
4. Salve o serviço

5. Acesse **Configurações Financeiras**
6. Preencha as instruções de pagamento
7. Salve as configurações

### 4.2 Experiência do Cliente (Futuro)

Quando o serviço exigir taxa de reserva:
1. Cliente seleciona o serviço
2. Sistema exibe o valor da taxa e as instruções de pagamento
3. Cliente realiza o pagamento
4. Envia comprovante pelo canal indicado
5. Agendamento é confirmado após validação

---

## 5. Checklist de Implementação

### Frontend ✅
- [x] Checkbox de taxa de reserva no formulário de serviços
- [x] Campo de valor da taxa com máscara de moeda
- [x] Campo de instruções de pagamento em configurações financeiras
- [x] Renomeação do label do campo WhatsApp

### Backend (Pendente)
- [ ] Adicionar campos `requiresDeposit` e `depositAmount` na API de serviços
- [ ] Adicionar campo `paymentInstructions` na API financeira
- [ ] Criar colunas no banco de dados
- [ ] Validar valor da taxa (não pode ser maior que o preço do serviço)

### Tela de Agendamento Público (Futuro)
- [ ] Exibir informações de taxa quando serviço exigir
- [ ] Exibir instruções de pagamento
- [ ] Integrar com gateway de pagamento (se aplicável)

---

## 6. Considerações de Segurança

1. **Validação de Valores:** O backend deve validar que `depositAmount` não exceda o `price` do serviço
2. **Sanitização:** Todos os campos de texto devem ser sanitizados contra XSS
3. **Permissões:** Apenas usuários Admin/Manager podem alterar configurações financeiras

---

## 7. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | 03/02/2026 | Versão inicial - Taxa de reserva e instruções de pagamento |
