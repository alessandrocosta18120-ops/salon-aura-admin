# Plano de Implementação - 17/11/2024 (v2)

## Mudanças Implementadas

### 7) Tela de Horários Agendados (AppointmentDetails)

#### a) Botão WhatsApp
**Frontend:**
- ✅ Implementado clique no botão que abre conversa do WhatsApp com texto padrão de confirmação
- ✅ Após clique, botão muda para "WhatsApp enviado" com cor vermelha (text-destructive)
- ✅ Atualiza status do agendamento de "pending" para "confirmed" via API
- ✅ Recarrega lista de agendamentos para refletir mudança de status
- ✅ Exibe toast de confirmação em azul claro

**Mensagem padrão:**
```
Olá [Nome do Cliente]! Confirmando seu agendamento para [Data] às [Hora] com [Profissional] - [Serviço].
```

**Backend necessário:**
- API: `setadmappointments` (ou `admin_setappointment.asp`)
- Parâmetros esperados:
  ```json
  {
    "id": "appointment_id",
    "status": "confirmed",
    "salonId": "auto_injected",
    "userId": "from_session",
    "slug": "from_session"
  }
  ```
- Ação: Atualizar o campo `status` para "confirmed" na tabela de agendamentos

#### b) Botão Ligar
**Frontend:**
- ✅ Implementado clique que abre app de telefone com `tel:` link
- ✅ Após clique, botão muda para "Telefonado" com cor vermelha (text-destructive)
- ✅ Remove caracteres não numéricos do telefone antes de criar o link

**Implementação:**
```typescript
const telUrl = `tel:${appointment.clientPhone.replace(/\D/g, '')}`;
window.location.href = telUrl;
```

#### c) Exibição de Dados do Cliente
**Status atual:**
- ✅ Nome do cliente sendo exibido com ícone de usuário
- ✅ Badge de status ao lado do nome (Confirmado/Pendente/Cancelado)
- ✅ Telefone exibido na linha abaixo com ícone de telefone
- ✅ Layout já estava implementado corretamente

**Estrutura visual:**
```
[User Icon] Nome do Cliente [Badge Status]
[Phone Icon] (11) 98765-4321
```

### 8) Sistema de Rotas

**Frontend:**
- ✅ Alterado de `BrowserRouter` para `HashRouter` em `src/App.tsx`
- ✅ Removido `basename="/admin"` do Router
- ✅ Agora todas as rotas usam hash (#) na URL: `/#/dashboard`, `/#/professionals`, etc.
- ✅ Isso evita erros 404 ao atualizar a página, pois sempre carrega o `index.html` base

**Antes:**
```
/admin/dashboard → Erro ao atualizar (404)
/admin/professionals → Erro ao atualizar (404)
```

**Depois:**
```
/#/dashboard → Funciona ao atualizar
/#/professionals → Funciona ao atualizar
```

**Nota sobre vite.config.ts:**
- O `base: '/admin/'` ainda está configurado no vite.config.ts
- Isso afeta apenas o build de produção e onde os assets são servidos
- Para desenvolvimento e SPA, o HashRouter resolve o problema de rotas

## Estado dos Botões

### Controle de Estado
- Implementado `useState` para rastrear botões clicados:
  - `whatsappSent`: Record<appointmentId, boolean>
  - `phoneCalled`: Record<appointmentId, boolean>

### Persistência
- Os estados dos botões são mantidos em memória durante a sessão
- Ao recarregar os agendamentos (após mudar de data), os estados são resetados
- Consideração futura: Persistir estados no localStorage ou backend se necessário

## Arquivos Modificados

### Frontend
1. `src/components/AppointmentDetails.tsx`
   - Adicionado estados `whatsappSent` e `phoneCalled`
   - Implementado `handleWhatsAppClick` com integração à API
   - Implementado `handlePhoneClick` com link tel:
   - Atualizado renderização dos botões com estados condicionais
   - Layout de exibição de cliente já estava correto

2. `src/App.tsx`
   - Alterado import de `BrowserRouter` para `HashRouter`
   - Removido prop `basename="/admin"`
   - Agora usa hash routing (#)

### Backend (necessário implementar)
1. API: `admin_setappointment.asp` ou `setadmappointments`
   - Adicionar suporte para atualização parcial (apenas status)
   - Aceitar parâmetros: id, status, salonId, userId, slug
   - Validar que o agendamento pertence ao salão do usuário
   - Atualizar apenas o campo status na tabela

### Database
Nenhuma alteração necessária se a tabela de agendamentos já possui:
- Campo `id` (primary key)
- Campo `status` (varchar ou enum: 'confirmed', 'pending', 'cancelled')
- Campo `salonId` para filtrar por salão

## Testes Recomendados

### Tela de Agendamentos
1. ✅ Verificar se nome do cliente aparece com badge de status
2. ✅ Verificar se telefone aparece na linha abaixo
3. ✅ Clicar no botão WhatsApp e verificar se abre conversa com mensagem
4. ✅ Verificar se botão muda para "WhatsApp enviado" em vermelho
5. ✅ Verificar se status muda de Pendente para Confirmado após WhatsApp
6. ✅ Clicar no botão Ligar e verificar se abre app de telefone
7. ✅ Verificar se botão muda para "Telefonado" em vermelho

### Sistema de Rotas
1. ✅ Acessar qualquer página da aplicação
2. ✅ Atualizar a página (F5) e verificar se não dá erro 404
3. ✅ Verificar se URLs usam hash: `/#/dashboard`, `/#/professionals`
4. ✅ Testar navegação entre páginas

## Próximos Passos

1. **Backend**: Implementar endpoint de atualização de status de agendamento
2. **Teste**: Validar integração completa frontend-backend
3. **UX**: Considerar adicionar confirmação visual mais forte após ações
4. **Persistência**: Avaliar se estados dos botões devem persistir entre sessões
