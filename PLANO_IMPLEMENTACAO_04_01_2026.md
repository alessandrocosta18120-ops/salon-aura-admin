# Plano de Implementação - 04/01/2026

## Resumo das Alterações

Este documento descreve todas as alterações implementadas no frontend e as mudanças necessárias no backend (APIs) e banco de dados.

---

## 1. Máscara de Telefone no Cadastro do Salão

### Alteração Frontend
- **Arquivo:** `src/pages/SalonManagement.tsx`
- **Descrição:** Campo de telefone agora usa máscara brasileira: `(XX) XXXXX-XXXX`
- **Componente:** `MaskedInput` com `phoneMask` de `src/lib/masks.ts`
- **Limite:** 15 caracteres máximo

### Impacto Backend
- Nenhuma alteração necessária na API `admin_setsadmalon.asp`
- O telefone será enviado no formato `(11) 99999-9999`

---

## 2. Campo de E-mail do Salão

### Alteração Frontend
- **Arquivo:** `src/pages/SalonManagement.tsx`
- **Descrição:** Novo campo de e-mail adicionado com validação em tempo real
- **Validação:** Usa `emailValidation` de `src/lib/masks.ts`
- **Interface:** Adicionado campo `email` ao tipo `SalonData`

### Alteração Backend Necessária
- **API:** `admin_setsadmalon.asp`
- **Novo campo:** `email` (string, opcional)
- **Validação:** Formato de e-mail válido

### Alteração Banco de Dados
```sql
ALTER TABLE salons ADD COLUMN email VARCHAR(255) NULL;
```

---

## 3. Select de Tipo de Feriado (Nacional/Estadual/Municipal)

### Alteração Frontend
- **Arquivo:** `src/pages/SalonManagement.tsx`
- **Descrição:** Adicionado select com 3 opções no formulário de feriados
- **Opções:** Municipal, Estadual, Nacional
- **Campo enviado:** `type` (antes era `category`, agora convertido para `type` no payload)

### Impacto Backend
- **API:** `admin_setadmholidays.asp`
- **Campo:** `type` deve aceitar valores: `'municipal'`, `'estadual'`, `'nacional'`
- A API já deve suportar este campo, apenas garantir que aceita os 3 valores

---

## 4. Responsividade das Telas

### Alterações Frontend
- **Agendamentos:** `src/components/AppointmentDetails.tsx`
  - Layout mobile-first com `flex-col sm:flex-row`
  - Botões empilham verticalmente em mobile
  - Resumo do dia com grid 3 colunas em todos os tamanhos

- **Lista de Profissionais:** `src/pages/ProfessionalsManagement.tsx`
  - Tabela visível apenas em desktop (`hidden md:block`)
  - Cards em mobile (`md:hidden`) com informações empilhadas

- **Lista de Serviços:** `src/pages/ServicesManagement.tsx`
  - Tabela visível apenas em desktop
  - Cards em mobile com layout vertical

### Impacto Backend
- Nenhuma alteração necessária

---

## 5. Tela de Bloqueio do Profissional (Renomeada de TimeBlocks)

### Alteração Frontend
- **Arquivo:** `src/pages/TimeBlocks.tsx`
- **Novo título:** "Bloqueio do Profissional"
- **Nova funcionalidade:** Abas para "Bloqueio de Horários" e "Bloqueio de Datas"

### Bloqueio de Datas (Nova Funcionalidade)
- Permite bloquear dias inteiros para um profissional específico
- Campos: Profissional, Data, Motivo
- Utiliza a API `admin_setadmblockeddates.asp` com `professionalId`

### APIs Utilizadas
- `admin_getadmtimeblocks.asp` - Lista bloqueios de horários
- `admin_setadmtimeblock.asp` - Cadastra bloqueio de horário
- `admin_deleteadmtimeblock.asp` - Remove bloqueio de horário
- `admin_getadmblockeddates.asp` - Lista datas bloqueadas
- `admin_setadmblockeddates.asp` - Cadastra data bloqueada
- `admin_deleteadmblockedday.asp` - Remove data bloqueada

### Impacto Backend
- **API:** `admin_setadmblockeddates.asp`
- **Campo obrigatório:** `professionalId` para bloqueios do profissional
- O bloqueio de data do profissional é diferente do bloqueio do salão (que não tem `professionalId`)

---

## 6. Limpeza da Tela de Configurações

### Alterações Frontend
- **Arquivo:** `src/pages/Settings.tsx`
- **Removido:**
  1. Switch "Ativar mensagens de confirmação automáticas"
  2. Select "Método de Notificação" (SMS/WhatsApp/Ambos)
  3. Card inteiro de "Integrações" (API WhatsApp e Provedor de E-mail)

### Impacto Backend
- Os campos removidos podem ser ignorados nas APIs
- O sistema usará apenas WhatsApp para notificações

---

## Checklist de Validação

### Frontend
- [ ] Telefone do salão aceita apenas formato brasileiro
- [ ] E-mail do salão valida formato em tempo real
- [ ] Select de tipo de feriado aparece com 3 opções
- [ ] Tela de agendamentos responsiva em mobile
- [ ] Tela de profissionais responsiva em mobile
- [ ] Tela de serviços responsiva em mobile
- [ ] Tela "Bloqueio do Profissional" com 2 abas funcionando
- [ ] Configurações sem opções de confirmação automática e integrações

### Backend
- [ ] API `admin_setsadmalon.asp` aceita campo `email`
- [ ] API `admin_setadmholidays.asp` aceita `type` com valores municipal/estadual/nacional
- [ ] API `admin_setadmblockeddates.asp` aceita `professionalId` para bloqueios individuais
- [ ] API `admin_getadmblockeddates.asp` retorna `professionalId` quando existir

### Banco de Dados
- [ ] Coluna `email` adicionada na tabela `salons`
- [ ] Coluna `type` na tabela `holidays` aceita municipal/estadual/nacional
- [ ] Coluna `professional_id` na tabela `blocked_dates` permite bloqueios individuais

---

## Arquivos Modificados

1. `src/pages/SalonManagement.tsx` - Máscara telefone, campo email, select feriado
2. `src/pages/Settings.tsx` - Remoção de opções
3. `src/components/AppointmentDetails.tsx` - Responsividade
4. `src/pages/ProfessionalsManagement.tsx` - Responsividade
5. `src/pages/ServicesManagement.tsx` - Responsividade
6. `src/pages/TimeBlocks.tsx` - Renomeado e adicionado bloqueio de datas

---

## Data da Implementação
**04 de Janeiro de 2026**
