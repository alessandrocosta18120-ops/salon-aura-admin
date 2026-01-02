# Correção do Sistema de Perfis de Usuário

**Data:** 02/01/2026

## Problema Identificado

O sistema de perfis de usuário não estava funcionando corretamente. A API retornava o campo `role` corretamente, mas o frontend não estava salvando essa informação na sessão.

### Resposta da API (exemplo):
```json
{
    "success": true,
    "data": {
        "sessionId": "{5AA79614-CBD8-4AB7-AD0C-D252BC6E0BF}",
        "slug": "moraesealves",
        "userId": "1",
        "salonId": "1",
        "userName": "diego",
        "role": "admin",
        "requires2FA": false
    }
}
```

## Causa Raiz

No arquivo `src/pages/Login.tsx`, o campo `role` não estava sendo incluído no objeto `sessionData` que é salvo no `sessionStorage`.

## Correção Aplicada

### Arquivo: `src/pages/Login.tsx`

**Antes:**
```javascript
const sessionData = {
  sessionId: result.data.sessionId,
  salonId: result.data.salonId,
  userName: result.data.userName || username,
  userId: result.data.userId,
  slug: result.data.slug
};
```

**Depois:**
```javascript
const sessionData = {
  sessionId: result.data.sessionId,
  salonId: result.data.salonId,
  userName: result.data.userName || username,
  userId: result.data.userId,
  slug: result.data.slug,
  role: result.data.role || 'staff' // Role do usuário (admin, manager, staff)
};
```

## Arquivos Envolvidos no Sistema de Roles

| Arquivo | Função |
|---------|--------|
| `src/pages/Login.tsx` | Salva a sessão com o role do usuário |
| `src/lib/session.ts` | Gerencia a sessão (get, save, clear, getRole) |
| `src/hooks/useUserRole.ts` | Hook para verificar permissões do usuário |
| `src/components/DashboardLayout.tsx` | Filtra menus baseado no role |
| `src/pages/UsersManagement.tsx` | Tela de gerenciamento de usuários (apenas admin) |

## Níveis de Permissão

| Role | Descrição | Acessos |
|------|-----------|---------|
| `admin` | Administrador | Acesso total + gerenciamento de usuários |
| `manager` | Gerente | Acesso total exceto gerenciamento de usuários |
| `staff` | Profissional | Apenas agenda própria, bloqueios e início |

## Menus por Role

### Admin (todos os menus):
- Início
- Gestão de Agendamentos
- Configurar Salão
- Gerenciar Profissionais
- Cadastrar Serviços
- Administrar Clientes
- Bloqueios de Horários
- Financeiro
- Configurações
- Gerenciar Usuários

### Manager (sem gerenciamento de usuários):
- Início
- Gestão de Agendamentos
- Configurar Salão
- Gerenciar Profissionais
- Cadastrar Serviços
- Administrar Clientes
- Bloqueios de Horários
- Financeiro
- Configurações

### Staff (apenas operacional):
- Início
- Gestão de Agendamentos
- Bloqueios de Horários

## Requisitos da API

A API `admin_authlogin.asp` deve retornar o campo `role` com um dos valores:
- `admin`
- `manager`
- `staff`

Se o campo não for retornado, o sistema assumirá `staff` como padrão.

## Teste

Após o login, verifique no console do navegador:
```javascript
console.log(JSON.parse(sessionStorage.getItem('salon_admin_session')));
```

Deve exibir o objeto com o campo `role` preenchido corretamente.

## Observações

- O usuário precisa fazer logout e login novamente para que a correção tenha efeito
- As sessões antigas não terão o campo `role` e serão tratadas como `staff`
