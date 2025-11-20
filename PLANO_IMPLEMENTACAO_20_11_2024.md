# Plano de Implementação - 20/11/2024

## Resumo das Alterações

Este documento detalha todas as alterações implementadas em 20/11/2024, incluindo melhorias de UX, máscaras de input, correções de API e sistema de perfis de usuário.

---

## 1. Paginação e Ordenação de Clientes

### Frontend (ClientsManagement.tsx)
**Status:** ✅ Implementado

**Alterações:**
- Adicionado sistema de paginação com 10 itens por página
- Implementado ordenação alfabética e por data
- Navegação entre páginas com botões anterior/próximo
- Filtros de ordenação independentes para cada aba (Cadastrados, Fixos, Evadidos)

**Estados adicionados:**
```typescript
const [currentPageClients, setCurrentPageClients] = useState(1);
const [currentPageFixed, setCurrentPageFixed] = useState(1);
const [currentPageChurned, setCurrentPageChurned] = useState(1);
const [sortClients, setSortClients] = useState<'name' | 'date'>('name');
const [sortFixed, setSortFixed] = useState<'name' | 'date'>('name');
const [sortChurned, setSortChurned] = useState<'name' | 'date'>('date');
```

**Funções criadas:**
- `sortData()` - Ordena dados por nome ou data
- `paginateData()` - Divide dados em páginas
- `getTotalPages()` - Calcula número total de páginas

### Backend (APIs)
**Impacto:** Nenhum - ordenação e paginação são feitas no frontend

---

## 2. Máscaras de Input

### Frontend
**Status:** ✅ Implementado

**Novos arquivos criados:**
- `src/lib/masks.ts` - Funções de máscara para diferentes formatos
- `src/components/ui/masked-input.tsx` - Componente de input com máscara

**Máscaras implementadas:**
```typescript
// Telefone: (11) 99999-9999
phoneMask(value: string): string

// CPF: 999.999.999-99
cpfMask(value: string): string

// CNPJ: 99.999.999/9999-99
cnpjMask(value: string): string

// Moeda: R$ 999,99
currencyMask(value: string | number): string

// Conta Bancária: 99999-9
bankAccountMask(value: string): string

// Agência: 9999-9
bankAgencyMask(value: string): string

// Email: validação com regex
emailValidation(email: string): boolean
```

### Arquivos Atualizados
**ProfessionalForm.tsx:**
- Campo de telefone com máscara `phoneMask`
- Campo de email com validação `emailValidation`

**ServiceForm.tsx:**
- Campo de preço com máscara `currencyMask`
- Validação para evitar valores inválidos

**FinancialSettings.tsx:**
- CPF/CNPJ do titular com máscaras respectivas
- Agência e Conta com dígito separado
- Campos adicionais:
  - `bankCode` - Código do banco (3 dígitos)
  - `agencyDigit` - Dígito da agência
  - `accountDigit` - Dígito da conta
  - `accountHolderName` - Nome do titular
  - `accountHolderCPF` - CPF do titular

### Backend (APIs)
**admin_setadmfinancial.asp:**

**Novos parâmetros esperados:**
```asp
bankCode = Request("bankCode")
agencyNumber = Request("agencyNumber")
agencyDigit = Request("agencyDigit")
accountNumber = Request("accountNumber")
accountDigit = Request("accountDigit")
accountHolderName = Request("accountHolderName")
accountHolderCPF = Request("accountHolderCPF")
```

**Campos para UPDATE/INSERT:**
- `bank_code` - VARCHAR(3)
- `agency_number` - VARCHAR(10)
- `agency_digit` - VARCHAR(1)
- `account_number` - VARCHAR(20)
- `account_digit` - VARCHAR(2)
- `account_holder_name` - VARCHAR(200)
- `account_holder_cpf` - VARCHAR(14)

### Database
**Tabela: financial_settings**

```sql
ALTER TABLE financial_settings
ADD COLUMN bank_code VARCHAR(3),
ADD COLUMN agency_digit VARCHAR(1),
ADD COLUMN account_digit VARCHAR(2),
ADD COLUMN account_holder_name VARCHAR(200),
ADD COLUMN account_holder_cpf VARCHAR(14);
```

---

## 3. Correção de APIs de Feriados

### Frontend (SalonManagement.tsx)
**Status:** ✅ Implementado

**Alterações:**
- Corrigido todas as chamadas de API de `holidayApi.getMunicipal()` para `holidayApi.get()`
- Corrigido `holidayApi.setMunicipal()` para `holidayApi.set()`
- Corrigido `holidayApi.deleteMunicipal()` para `holidayApi.delete()`
- Botão renomeado de "Cadastrar Feriado Municipal" para "Cadastrar Feriado"
- Separação de feriados em 3 categorias: Nacional, Estadual, Municipal
- Campo `type` enviado no payload para diferenciar categorias

**Interface atualizada:**
```typescript
interface Holiday {
  id?: string;
  name: string;
  date: string;
  type: 'nacional' | 'estadual' | 'municipal' | 'blocked';
  isRecurring?: boolean;
  professionalId?: string;
  professionalName?: string;
}
```

### Backend (APIs)
**admin_getadmholidays.asp** (renomeado de admin_getadmmunicipalidays.asp):
- Retorna todos os feriados com campo `type`
- Permite filtrar por categoria

**admin_setadmholidays.asp** (renomeado de admin_setadmmunicipalidays.asp):
- Aceita parâmetro `type` ('nacional', 'estadual', 'municipal')
- Insere/atualiza com categoria especificada

**admin_deleteadmholiday.asp** (renomeado de admin_deleteadmmunicipalholiday.asp):
- Delete único para todos os tipos de feriado

### Database
**Tabela: holidays**

```sql
ALTER TABLE holidays
ADD COLUMN type VARCHAR(20) DEFAULT 'municipal',
ADD CONSTRAINT check_holiday_type 
  CHECK (type IN ('nacional', 'estadual', 'municipal', 'blocked'));
```

---

## 4. Correções em Agendamentos

### 4a. Exibir mensagem quando não há agendamentos
**Status:** ✅ Implementado

**AppointmentDetails.tsx:**
- Modificada função `loadAppointments()` para sempre limpar estado quando não há dados
- Exibe "Não há agendamentos para esta data" quando `appointments.length === 0`

### 4b. Atualizar calendário corretamente
**Status:** ✅ Implementado

**AppointmentDetails.tsx:**
- `useEffect` monitora mudanças em `selectedDate`
- Chama `loadAppointments()` automaticamente ao selecionar nova data
- Estado de loading durante carregamento

### 4c. Lembretes agrupados por profissional
**Status:** ⏳ Pendente

**Mudanças necessárias:**

**AppointmentReminders.tsx:**
- Agrupar agendamentos por `professionalId`
- Um botão de WhatsApp por profissional
- Mensagem concatenada com todos os agendamentos do profissional
- Formato da mensagem:
```
Olá [Nome do Profissional]!

Seus agendamentos para [data]:
- [hora] - [Cliente] - [Serviço]
- [hora] - [Cliente] - [Serviço]
...
```

### 4d. Remover link "Hoje"
**Status:** ✅ Implementado

**AppointmentDetails.tsx:**
- Removido botão "Hoje" da navegação de datas (linha 210-212)

### Backend (APIs)
**Nenhuma alteração necessária** - dados já incluem `professionalId` e `professionalName`

---

## 5. Sistema de Perfis de Usuário

### Status: ⏳ Em Implementação

**Níveis de acesso:**
1. **Admin** - Acesso total + gerenciar perfis
2. **Manager** - Acesso a todos os menus (exceto gerenciar perfis)
3. **Staff** - Apenas horário, agenda e dados pessoais

### Database

**Criar tabela de roles:**
```sql
CREATE TYPE app_role AS ENUM ('admin', 'manager', 'staff');

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    salon_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, salon_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_salon_id ON user_roles(salon_id);
```

**Função de verificação de role:**
```sql
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _salon_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND salon_id = _salon_id
      AND role = _role
  )
$$;
```

**RLS Policies:**
```sql
-- Admins podem ver todos os user_roles
CREATE POLICY "Admins can view all user_roles"
ON user_roles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), salon_id, 'admin'));

-- Admins podem inserir/atualizar user_roles
CREATE POLICY "Admins can manage user_roles"
ON user_roles FOR ALL
TO authenticated
USING (has_role(auth.uid(), salon_id, 'admin'));

-- Usuários podem ver seu próprio role
CREATE POLICY "Users can view own role"
ON user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### Frontend

**Novos componentes:**
- `src/components/UserRoles.tsx` - Gerenciamento de perfis (admin only)
- `src/hooks/useUserRole.ts` - Hook para verificar role do usuário
- `src/lib/permissions.ts` - Funções de verificação de permissões

**useUserRole.ts:**
```typescript
interface UserRole {
  role: 'admin' | 'manager' | 'staff' | null;
  loading: boolean;
  canAccess: (feature: string) => boolean;
}

export const useUserRole = (): UserRole => {
  // Implementação
}
```

**permissions.ts:**
```typescript
export const PERMISSIONS = {
  admin: ['*'], // All permissions
  manager: [
    'view_dashboard',
    'manage_appointments',
    'manage_clients',
    'manage_professionals',
    'manage_services',
    'manage_settings',
    'view_reports'
  ],
  staff: [
    'view_own_schedule',
    'view_own_appointments',
    'update_own_profile'
  ]
};

export const canAccess = (
  userRole: string,
  feature: string
): boolean => {
  const permissions = PERMISSIONS[userRole] || [];
  return permissions.includes('*') || permissions.includes(feature);
};
```

**DashboardLayout.tsx:**
- Adicionar verificação de role para exibir/ocultar menus
- Menu "Gerenciar Perfis" visível apenas para admins
- Redirect para página de acesso negado se usuário tentar acessar rota sem permissão

**Rotas protegidas:**
```typescript
<ProtectedRoute role="admin">
  <Route path="/dashboard/user-roles" element={<UserRoles />} />
</ProtectedRoute>

<ProtectedRoute role={['admin', 'manager']}>
  <Route path="/dashboard/clients" element={<ClientsManagement />} />
</ProtectedRoute>

<ProtectedRoute role={['admin', 'manager', 'staff']}>
  <Route path="/dashboard/my-schedule" element={<MySchedule />} />
</ProtectedRoute>
```

### Backend (APIs)

**admin_getuserroles.asp:**
```asp
' Retorna roles de todos os usuários (admin only)
' Parâmetros: salonId

Response
{
  "success": true,
  "data": [
    {
      "userId": "...",
      "userName": "...",
      "email": "...",
      "role": "manager",
      "createdAt": "..."
    }
  ]
}
```

**admin_setuserrole.asp:**
```asp
' Define/atualiza role de um usuário (admin only)
' Parâmetros: userId, salonId, role

' Validar que usuário requisitante é admin
' Inserir ou atualizar role na tabela user_roles
```

**Verificação de permissões:**
- Todas as APIs devem verificar role antes de executar ações sensíveis
- Usar função `has_role()` para validação

---

## 6. Exibir Nome do Profissional em Bloqueios

### Frontend
**Status:** ⏳ Pendente

**TimeBlocks.tsx e SalonManagement.tsx:**
- Exibir `professionalName` abaixo da data em todos os bloqueios
- Se `professionalName` não estiver disponível, buscar da lista de profissionais

**Exemplo de UI:**
```tsx
<div>
  <p className="font-medium">{block.name}</p>
  <p className="text-sm text-muted-foreground">{block.date}</p>
  {block.professionalName && (
    <p className="text-xs text-muted-foreground">
      Profissional: {block.professionalName}
    </p>
  )}
</div>
```

### Backend (APIs)
**admin_getadmtimeblocks.asp, admin_getadmholidays.asp, admin_getadmblockeddates.asp:**
- Incluir `professionalName` no JOIN com tabela de profissionais
- Retornar campo `professionalName` no JSON

```sql
SELECT 
  b.*,
  p.name as professionalName
FROM blocks b
LEFT JOIN professionals p ON b.professional_id = p.id
WHERE b.salon_id = @salonId
```

---

## 7. Responsividade

### Frontend
**Status:** ⏳ Pendente para todas as páginas listadas

**Páginas para tornar responsivas:**
- AppointmentDetails.tsx (agendamentos do dia)
- Appointments.tsx (agendamentos por data)
- ClientsManagement.tsx (todas as abas)
- ProfessionalsManagement.tsx (listar profissionais)
- ServicesManagement.tsx (listar serviços)

**Padrões de responsividade:**
- Usar `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` para layouts de grade
- Usar `flex-col md:flex-row` para layouts flexbox
- Usar `text-sm md:text-base` para tamanhos de fonte
- Ocultar colunas não essenciais em mobile com `hidden md:table-cell`
- Empilhar informações verticalmente em telas pequenas

**Exemplo:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4">
    {/* Content */}
  </Card>
</div>
```

### Backend
**Nenhuma alteração necessária**

---

## 8. Reorganização do Menu Principal

### Frontend (DashboardLayout.tsx)
**Status:** ✅ Implementado

**Alterações:**
- Separado "Início" (link para `/dashboard`)
- Criado "Gestão de Agendamentos" (link para `/dashboard/appointments`)
- Menu reorganizado para melhor navegação

**Estrutura do menu:**
```typescript
const menuItems = [
  { title: 'Início', href: '/dashboard', icon: Home },
  { title: 'Gestão de Agendamentos', href: '/dashboard/appointments', icon: Calendar },
  { title: 'Clientes', href: '/dashboard/clients', icon: Users },
  { title: 'Profissionais', href: '/dashboard/professionals', icon: UserCheck },
  { title: 'Serviços', href: '/dashboard/services', icon: Scissors },
  { title: 'Configurações', href: '/dashboard/settings', icon: Settings },
  // Admin only:
  { title: 'Gerenciar Perfis', href: '/dashboard/user-roles', icon: Shield, roles: ['admin'] },
];
```

### Backend
**Nenhuma alteração necessária**

---

## Resumo de Pendências

### Prioridade Alta
1. ✅ Máscaras de input implementadas
2. ✅ Correção de APIs de feriados
3. ✅ Mensagem quando não há agendamentos
4. ⏳ Lembretes agrupados por profissional
5. ⏳ Sistema de perfis de usuário (database + backend + frontend)

### Prioridade Média
1. ⏳ Exibir nome do profissional em bloqueios
2. ⏳ Responsividade completa em todas as páginas
3. ✅ Reorganização do menu

### Prioridade Baixa
1. ⏳ Testes de integração
2. ⏳ Documentação de APIs completa

---

## Próximos Passos

1. **Implementar sistema de perfis de usuário:**
   - Criar tabelas e funções no database
   - Implementar APIs backend
   - Criar componentes frontend
   - Adicionar verificações de permissão

2. **Completar lembretes por profissional:**
   - Atualizar AppointmentReminders.tsx
   - Agrupar lógica de envio

3. **Adicionar nome do profissional em bloqueios:**
   - Atualizar queries das APIs
   - Atualizar UI para exibir informação

4. **Revisar responsividade:**
   - Testar em diferentes dispositivos
   - Ajustar breakpoints conforme necessário

---

## Notas Importantes

- **Todas as máscaras devem ser aplicadas no frontend** para melhor UX
- **Validações devem existir tanto no frontend quanto backend** para segurança
- **Sistema de roles deve usar SECURITY DEFINER** para evitar recursão RLS
- **Sempre enviar userId, salonId e slug** nas requisições de API
- **Toasts de sucesso devem usar classe** `bg-blue-50 border-blue-200`
- **Confirmações de delete devem usar** `TEM CERTEZA QUE DESEJA APAGAR O ITEM SELECIONADO?`

---

**Data da implementação:** 20/11/2024  
**Última atualização:** 20/11/2024
