# Plano de Implementação - 02/12/2024

## Resumo das Alterações

Este documento detalha todas as mudanças implementadas no sistema em 02/12/2024, incluindo correções de bugs, melhorias de UX e implementação de novas funcionalidades.

---

## 1. Correção dos Dias da Semana (Profissionais)

### Frontend
**Arquivo:** `src/pages/ProfessionalForm.tsx`

**Alteração:**
- Corrigida a correspondência dos dias da semana para o padrão correto:
  - 1 = Domingo
  - 2 = Segunda-feira
  - 3 = Terça-feira
  - 4 = Quarta-feira
  - 5 = Quinta-feira
  - 6 = Sexta-feira
  - 7 = Sábado

### Backend
**API Afetada:** `admin_setadmprofessionals.asp`

**Mudanças Necessárias:**
- Garantir que o backend interprete corretamente os valores 1-7 conforme o novo padrão
- Atualizar queries de banco de dados que filtram por dia da semana
- Verificar lógica de agendamento automático para usar o novo padrão

### Database
- Verificar se dados existentes precisam de migração
- Atualizar constraints/validações que verificam dias da semana

---

## 2. Sistema de Perfis de Usuário

### Frontend
**Novos Componentes:**
- Sistema de controle de acesso baseado em roles (Admin, Manager, Staff)
- UI para gerenciamento de perfis de usuários (apenas Admin)

**Arquivos a Criar:**
- `src/pages/UserManagement.tsx` - Gerenciamento de usuários
- `src/lib/roles.ts` - Utilitários de verificação de roles
- `src/hooks/useUserRole.ts` - Hook para acessar role do usuário atual

### Backend
**Novas APIs Necessárias:**

1. **admin_getuserroles.asp**
   - GET: Retorna roles de todos os usuários (apenas Admin)
   - Parâmetros: salonId
   - Retorno: Lista de users com seus roles

2. **admin_setuserrole.asp**
   - POST: Atribui/atualiza role de um usuário (apenas Admin)
   - Parâmetros: userId, role (admin/manager/staff), salonId
   - Validações: Apenas Admin pode alterar roles

3. **admin_getcurrentuserrole.asp**
   - GET: Retorna role do usuário atual
   - Parâmetros: userId, salonId
   - Retorno: { role: 'admin'|'manager'|'staff' }

### Database
**Tabelas Criadas (Supabase):**
```sql
-- Enum para roles
create type public.app_role as enum ('admin', 'manager', 'staff');

-- Tabela de roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Security definer function
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
```

**Políticas RLS:**
- Admins: acesso total
- Usuários: podem ver apenas seus próprios roles

### Regras de Acesso
**Admin:**
- Acesso total ao sistema
- Gerenciar perfis de outros usuários
- Todas as configurações e relatórios

**Manager:**
- Acesso a todos os menus exceto gerenciamento de perfis
- Visualizar e editar agendamentos
- Gerenciar clientes, serviços e profissionais
- Não pode alterar roles de usuários

**Staff:**
- Acesso apenas ao próprio horário
- Visualizar própria agenda
- Editar dados pessoais
- Sem acesso a configurações administrativas

---

## 3. Lembretes Agrupados por Profissional

### Frontend
**Arquivo:** `src/components/AppointmentReminders.tsx`

**Alterações:**
- Agrupamento de agendamentos por profissional
- Um único botão de envio por profissional
- Mensagem consolidada com todos os agendamentos do dia

**Formato da Mensagem:**
```
Olá [Nome Profissional]!

Lembretes de agendamentos para [data]:

• [horário] - [Cliente] - [Serviço]
• [horário] - [Cliente] - [Serviço]
...

Bom trabalho!
```

### Backend
Nenhuma alteração necessária - lógica implementada no frontend

---

## 4. Máscaras de Input com Limitação de Caracteres

### Frontend
**Arquivo:** `src/lib/masks.ts`

**Alterações:**
- `phoneMask`: Limita entrada a 11 dígitos (formato brasileiro)
- `cpfMask`: Limita entrada a 11 dígitos
- `cnpjMask`: Limita entrada a 14 dígitos
- `bankAccountMask`: Limita entrada a 13 dígitos
- `bankAgencyMask`: Limita entrada a 5 dígitos

**Implementação:**
Todas as máscaras agora usam `.substring(0, maxLength)` para forçar o limite de caracteres e prevenir erros de digitação.

### Backend
Nenhuma alteração necessária - validação client-side

---

## 5. Correção do Formato WhatsApp

### Frontend
**Arquivo:** `src/components/AppointmentDetails.tsx`

**Alteração:**
```javascript
// Antes: +55197582-4433 (errado)
// Depois: +5511975824433 (correto)

const phoneDigits = phone.replace(/\D/g, '');
const whatsappPhone = `55${phoneDigits}`;
```

**Lógica:**
1. Remove todos os não-dígitos do telefone
2. Adiciona código do país (55) no início
3. Resultado: +5511975824433 (formato WhatsApp correto)

### Backend
Nenhuma alteração necessária

---

## 6. Gerenciamento de Clientes Fixos (CRUD Completo)

### Frontend
**Arquivo:** `src/components/ClientsManagement.tsx`

**Alterações:**
- Botão "Alterar" para cada cliente fixo
- Botão "Apagar" com confirmação
- Formulário reutilizado para edição
- Estados de edição gerenciados corretamente

**Novas Funções:**
- `handleEditFixedClient`: Carrega dados do cliente no formulário
- `handleDeleteFixedClient`: Remove cliente fixo
- `handleCancelEdit`: Cancela edição e limpa formulário

### Backend
**Nova API Necessária:**

**admin_deleteadmfixedclient.asp**
- POST: Remove cliente fixo
- Parâmetros: id, salonId
- Validação: Verificar se cliente pertence ao salão
- Retorno: { success: true/false }

### Database
- Soft delete recomendado (adicionar campo `deleted_at`)
- Ou hard delete com verificação de integridade referencial

---

## 7. Exibição de Nome do Profissional em Bloqueios

### Frontend
**Arquivos:**
- `src/pages/TimeBlocks.tsx`
- `src/pages/SalonManagement.tsx`

**Alterações:**
- Exibição do nome do profissional abaixo da data em todos os bloqueios
- Separação de feriados por categoria (Nacional, Estadual, Municipal)
- Nome do profissional exibido em feriados e datas bloqueadas quando aplicável

**Implementação:**
```javascript
{block.professionalId && (
  <p className="text-xs text-muted-foreground">
    Profissional: {professionals.find(p => p.id === block.professionalId)?.name || 'Desconhecido'}
  </p>
)}
```

### Backend
**APIs Afetadas:**
- `admin_getadmtimeblocks.asp`
- `admin_getadmholidays.asp`
- `admin_getadmblockeddates.asp`

**Mudanças Necessárias:**
Incluir `professionalName` no retorno JSON quando `professionalId` estiver presente:
```json
{
  "id": "123",
  "date": "2024-12-25",
  "professionalId": "prof456",
  "professionalName": "João Silva"
}
```

### Database
- Adicionar JOIN com tabela de profissionais nas queries de bloqueios
- Garantir performance com índices apropriados

---

## 8. Paginação de Clientes (Pendente)

### Frontend
**Status:** Implementação pendente para próxima fase

**Requisitos:**
- Paginação de 10/20/50 itens por página
- Ordenação por:
  - Nome (alfabético)
  - Data de cadastro
  - Última visita (para evadidos)
- Filtros de busca por nome/telefone

**Arquivos a Modificar:**
- `src/components/ClientsManagement.tsx`

**Bibliotecas Sugeridas:**
- TanStack Table (react-table) para tabelas com sorting/pagination
- Ou implementação custom com controle de estado

### Backend
**APIs a Modificar:**
- `admin_getadmclients.asp`
- `admin_getadmfixedclients.asp`
- `admin_getadmchurnedclients.asp`

**Parâmetros Adicionais:**
```
page: número da página (default: 1)
pageSize: itens por página (default: 20)
sortBy: campo de ordenação (name, created_at, last_visit)
sortOrder: asc ou desc
search: termo de busca (opcional)
```

**Retorno Esperado:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## 9. APIs de Feriados Renomeadas

### Backend
**Alterações:**

**Antes:**
- `admin_getadmmunicipaldays.asp`
- `admin_setadmmunicipalday.asp`
- `admin_deleteadmmunicipalday.asp`

**Depois:**
- `admin_getadmholidays.asp`
- `admin_setadmholidays.asp`
- `admin_deleteadmholiday.asp`

**Mudanças Adicionais:**
- Suporte para categorias: 'nacional', 'estadual', 'municipal'
- Campo `type` no payload e retorno
- Filtro por categoria na API GET

**Payload Exemplo:**
```json
{
  "name": "Natal",
  "date": "2024-12-25",
  "type": "nacional",
  "isRecurring": true,
  "professionalId": null,
  "salonId": "salon123"
}
```

---

## Checklist de Implementação Backend

### Prioridade ALTA (Bloqueadores)
- [ ] Atualizar `admin_setadmprofessionals.asp` - nova lógica de dias da semana
- [ ] Criar `admin_deleteadmfixedclient.asp` - deletar clientes fixos
- [ ] Renomear e atualizar APIs de feriados (municipal → holidays com tipos)
- [ ] Adicionar `professionalName` no retorno de bloqueios/feriados

### Prioridade MÉDIA (Features Completas)
- [ ] Criar sistema de user roles (3 APIs novas)
- [ ] Migrar dados existentes de dias da semana (se necessário)
- [ ] Atualizar validações de telefone para aceitar formato brasileiro

### Prioridade BAIXA (Melhorias Futuras)
- [ ] Implementar paginação nas APIs de clientes
- [ ] Adicionar logging de alterações de roles
- [ ] Criar relatórios de uso por perfil

---

## Notas de Segurança

1. **User Roles:**
   - NUNCA armazenar roles em localStorage
   - Sempre validar permissões no backend
   - Usar RLS policies do Supabase

2. **Validação de Inputs:**
   - Backend deve revalidar todas as máscaras
   - Sanitizar inputs antes de salvar no banco
   - Prevenir SQL injection

3. **WhatsApp:**
   - Validar formato de telefone antes de gerar links
   - Limitar taxa de envio de mensagens
   - Logs de mensagens enviadas

---

## Testes Recomendados

### Dias da Semana
- [ ] Criar profissional com domingo marcado (valor 1)
- [ ] Verificar se agendamento em domingo funciona
- [ ] Testar todos os dias da semana

### User Roles
- [ ] Login como Admin - verificar acesso total
- [ ] Login como Manager - verificar restrições
- [ ] Login como Staff - verificar acesso limitado
- [ ] Tentar acessar rotas restritas

### Clientes Fixos
- [ ] Criar cliente fixo
- [ ] Editar cliente fixo
- [ ] Deletar cliente fixo
- [ ] Verificar se agendamentos automáticos continuam funcionando

### WhatsApp
- [ ] Enviar confirmação com telefone (11) 97582-4433
- [ ] Verificar se abre WhatsApp corretamente
- [ ] Testar com diferentes formatos de telefone

### Bloqueios
- [ ] Criar bloqueio com profissional
- [ ] Verificar se nome aparece na listagem
- [ ] Criar feriado nacional/estadual/municipal
- [ ] Verificar agrupamento correto

---

## Compatibilidade

### Frontend
- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- Supabase JS Client

### Backend
- ASP Classic
- SQL Server ou MySQL
- IIS 7+

### Browser Support
- Chrome/Edge (últimas 2 versões)
- Firefox (últimas 2 versões)
- Safari (últimas 2 versões)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Próximos Passos

1. Implementar sistema completo de user roles
2. Adicionar paginação e filtros avançados em clientes
3. Melhorar responsividade em todas as telas
4. Adicionar testes automatizados
5. Implementar sistema de notificações push
6. Dashboard com métricas e KPIs

---

**Data de Criação:** 02/12/2024  
**Última Atualização:** 02/12/2024  
**Versão:** 1.0