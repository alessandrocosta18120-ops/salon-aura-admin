# Plano de Implementação - 02/12/2024 (Atualizado 03/12/2024)

## Resumo das Alterações

Este documento detalha todas as mudanças implementadas no sistema, incluindo correções de bugs, melhorias de UX e implementação de novas funcionalidades.

---

## 1. Correção dos Dias da Semana (Profissionais) ✅ CONCLUÍDO

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

## 2. Sistema de Perfis de Usuário ✅ CONCLUÍDO

### Frontend
**Arquivos Criados:**
- `src/hooks/useUserRole.ts` - Hook para gerenciar role do usuário
- `src/pages/UsersManagement.tsx` - Tela de gerenciamento de usuários (apenas Admin)
- `src/components/ui/pagination-controls.tsx` - Controles de paginação reutilizáveis
- `src/components/ui/sort-controls.tsx` - Controles de ordenação reutilizáveis

**Arquivos Modificados:**
- `src/lib/session.ts` - Adicionado campo `role` na sessão
- `src/components/DashboardLayout.tsx` - Menu filtrado por role + badge de role do usuário
- `src/App.tsx` - Adicionada rota `/dashboard/users`

### Implementação de Roles
**Três níveis de acesso implementados:**

| Menu | Admin | Manager | Staff |
|------|-------|---------|-------|
| Início | ✅ | ✅ | ✅ |
| Gestão de Agendamentos | ✅ | ✅ | ✅ |
| Configurar Salão | ✅ | ✅ | ❌ |
| Gerenciar Profissionais | ✅ | ✅ | ❌ |
| Cadastrar Serviços | ✅ | ✅ | ❌ |
| Administrar Clientes | ✅ | ✅ | ❌ |
| Bloqueios de Horários | ✅ | ✅ | ✅ |
| Financeiro | ✅ | ✅ | ❌ |
| Configurações | ✅ | ✅ | ❌ |
| Gerenciar Usuários | ✅ | ❌ | ❌ |

### Backend - APIs Necessárias

**1. admin_authlogin.asp (MODIFICAR)**
- Adicionar campo `role` no retorno JSON
```json
{
  "success": true,
  "data": {
    "sessionId": "xxx",
    "salonId": "1",
    "userId": "1",
    "userName": "Admin",
    "slug": "salon",
    "role": "admin"
  }
}
```

**2. admin_getadmusers.asp (CRIAR)**
- GET: Lista todos os usuários com seus roles
- Parâmetros: salonId
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "João Admin",
      "email": "admin@email.com",
      "role": "admin",
      "active": true,
      "createdAt": "2024-01-01"
    }
  ]
}
```

**3. admin_setadmuserrole.asp (CRIAR)**
- POST: Atualiza role de um usuário (apenas Admin)
- Body: `{"userId": "1", "role": "manager"}`
- Validações: Verificar se usuário logado é Admin

**4. admin_deleteadmuser.asp (CRIAR)**
- POST: Remove um usuário
- Body: `{"id": "1"}`
- Validações: Não permitir auto-exclusão

### Database (SQL Server)
```sql
-- Tabela de roles
CREATE TABLE user_roles (
    id INT PRIMARY KEY IDENTITY,
    userId INT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Índice para performance
CREATE INDEX idx_user_roles_userId ON user_roles(userId);
```

---

## 3. Lembretes Agrupados por Profissional ✅ CONCLUÍDO

### Frontend
**Arquivo:** `src/components/AppointmentReminders.tsx`

**Alterações:**
- Agrupamento de agendamentos por profissional
- Um único botão de envio por profissional (não mais por agendamento)
- Mensagem consolidada com todos os agendamentos do dia
- Estado "Lembrete Enviado" por profissional

**Formato da Mensagem:**
```
Olá [Nome Profissional]!

Lembretes de agendamentos para hoje:

• [horário] - [Cliente] - [Serviço]
• [horário] - [Cliente] - [Serviço]
...

Bom trabalho!
```

### Backend
Nenhuma alteração necessária - lógica implementada no frontend

---

## 4. Máscaras de Input com Limitação de Caracteres ✅ CONCLUÍDO

### Frontend
**Arquivo:** `src/lib/masks.ts`

**Alterações:**
- `phoneMask`: Formato (XX) XXXXX-XXXX, limitado a 11 dígitos
- `cpfMask`: Formato XXX.XXX.XXX-XX, limitado a 11 dígitos
- `cnpjMask`: Formato XX.XXX.XXX/XXXX-XX, limitado a 14 dígitos
- `bankAccountMask`: Limita entrada a 13 dígitos
- `bankAgencyMask`: Limita entrada a 5 dígitos

**Implementação:**
Todas as máscaras usam `.substring(0, maxLength)` para forçar o limite de caracteres.

### Backend
Recomendado validar no backend também para segurança adicional.

---

## 5. Correção do Formato WhatsApp ✅ CONCLUÍDO

### Frontend
**Arquivo:** `src/components/AppointmentDetails.tsx`

**Alteração:**
```javascript
// Antes: +55197582-4433 (errado - faltando DDD)
// Depois: +5511975824433 (correto)

const phoneDigits = phone.replace(/\D/g, '');
const whatsappPhone = `55${phoneDigits}`;
```

**Lógica:**
1. Remove todos os não-dígitos do telefone armazenado
2. Adiciona código do país (55) no início
3. Resultado correto para WhatsApp API

### Backend
Nenhuma alteração necessária

---

## 6. Paginação e Ordenação de Clientes ✅ CONCLUÍDO

### Frontend
**Arquivos Criados:**
- `src/components/ui/pagination-controls.tsx` - Componente de paginação
- `src/components/ui/sort-controls.tsx` - Componente de ordenação

**Arquivo Modificado:** `src/components/ClientsManagement.tsx`

**Funcionalidades Implementadas:**
- Busca por nome ou telefone (filtro em tempo real)
- Ordenação por Nome, Data ou Telefone (ascendente/descendente)
- Paginação com 10, 25, 50 ou 100 itens por página
- Contador de itens exibidos ("Exibindo 1-10 de 156")
- Navegação: primeira, anterior, próxima, última página
- Aplicado nos três tipos de clientes: Cadastrados, Fixos e Evadidos

### Backend - Alterações Opcionais
Se o volume de dados for grande, considerar implementar paginação server-side:

**Parâmetros adicionais nas APIs:**
```
page: número da página (default: 1)
pageSize: itens por página (default: 20)
sortBy: campo de ordenação (name, created_at, last_visit)
sortOrder: asc ou desc
search: termo de busca (opcional)
```

**Retorno esperado:**
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

## 7. Gerenciamento de Clientes Fixos (CRUD Completo) ✅ CONCLUÍDO

### Frontend
**Arquivo:** `src/components/ClientsManagement.tsx`

**Funcionalidades:**
- Botão "Alterar" para cada cliente fixo
- Botão "Apagar" (X) com confirmação
- Formulário reutilizado para criação e edição
- Cancelamento de edição

**Novas Funções:**
- `handleEditFixedClient`: Carrega dados do cliente no formulário
- `handleDeleteFixedClient`: Remove cliente fixo com confirmação
- `handleCancelEdit`: Cancela edição e limpa formulário

### Backend
**Nova API Necessária:**

**admin_deleteadmfixedclient.asp**
- POST: Remove cliente fixo
- Parâmetros: `{"id": "123", "salonId": "xxx"}`
- Validação: Verificar se cliente pertence ao salão
- Retorno: `{ "success": true/false }`

---

## 8. Exibição de Nome do Profissional em Bloqueios ✅ CONCLUÍDO

### Frontend
**Arquivos Modificados:**
- `src/pages/TimeBlocks.tsx`
- `src/pages/SalonManagement.tsx`

**Alterações:**
- Nome do profissional exibido abaixo da data em todos os bloqueios
- Separação de feriados por categoria (Nacional, Estadual, Municipal)
- Profissional exibido quando aplicável

### Backend
**APIs Afetadas:**
- `admin_getadmtimeblocks.asp`
- `admin_getadmholidays.asp`
- `admin_getadmblockeddates.asp`

**Mudança Recomendada:**
Incluir `professionalName` no retorno JSON:
```json
{
  "id": "123",
  "date": "2024-12-25",
  "professionalId": "prof456",
  "professionalName": "João Silva"
}
```

---

## Checklist de Implementação Backend

### ✅ Implementado no Frontend
- [x] Correção dias da semana
- [x] Sistema de roles (UI completa)
- [x] Lembretes agrupados por profissional
- [x] Máscaras com limite de caracteres
- [x] Correção formato WhatsApp
- [x] Paginação e ordenação de clientes
- [x] CRUD de clientes fixos (frontend)
- [x] Nome do profissional em bloqueios

### 🔧 Pendente no Backend (Prioridade ALTA)
- [ ] Adicionar campo `role` no retorno de `admin_authlogin.asp`
- [ ] Criar `admin_getadmusers.asp`
- [ ] Criar `admin_setadmuserrole.asp`
- [ ] Criar `admin_deleteadmuser.asp`
- [ ] Criar `admin_deleteadmfixedclient.asp`
- [ ] Adicionar `professionalName` no retorno de bloqueios

### 🔧 Pendente no Backend (Prioridade MÉDIA)
- [ ] Validar dias da semana 1-7 no backend
- [ ] Adicionar tabela `user_roles` no banco
- [ ] Implementar verificações de permissão no backend

### 🔧 Opcional (Melhorias Futuras)
- [ ] Paginação server-side para grandes volumes
- [ ] Logs de alterações de roles
- [ ] Soft delete para clientes fixos

---

## Notas de Segurança

1. **User Roles:**
   - Roles são validados a cada requisição no backend
   - Frontend filtra menus, mas backend deve verificar permissões
   - Não confiar apenas em sessionStorage

2. **Validação de Inputs:**
   - Backend deve revalidar todas as máscaras
   - Sanitizar inputs antes de salvar no banco
   - Prevenir SQL injection

3. **WhatsApp:**
   - Validar formato de telefone antes de gerar links
   - Logs de mensagens enviadas recomendados

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

### Clientes
- [ ] Buscar cliente por nome
- [ ] Buscar cliente por telefone
- [ ] Ordenar por nome (A-Z e Z-A)
- [ ] Ordenar por data
- [ ] Navegar entre páginas
- [ ] Alterar quantidade por página

### Clientes Fixos
- [ ] Criar cliente fixo
- [ ] Editar cliente fixo
- [ ] Deletar cliente fixo
- [ ] Cancelar edição

### WhatsApp
- [ ] Enviar confirmação com telefone (11) 97582-4433
- [ ] Verificar se abre WhatsApp corretamente
- [ ] Testar com diferentes formatos de telefone

### Bloqueios
- [ ] Criar bloqueio com profissional
- [ ] Verificar se nome aparece na listagem
- [ ] Criar feriado de cada tipo
- [ ] Verificar agrupamento correto

---

**Data de Criação:** 02/12/2024  
**Última Atualização:** 03/12/2024  
**Versão:** 2.0
