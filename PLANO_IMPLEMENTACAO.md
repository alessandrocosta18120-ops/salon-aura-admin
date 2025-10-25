# Plano de Implementação - Alterações do Sistema

## 📋 Resumo das Alterações Implementadas

### 1. ✅ Mudanças Visuais e de Texto
- [x] Texto da tela de login alterado para "Sistema de gestão de agendamentos digitais"
- [x] Sidebar: Texto "Admin Panel" alterado para "Painel Administrativo"
- [x] Links do menu principal ajustados para cor preta (melhor contraste com fundo branco)
- [x] Campo TikTok reincluído nas redes sociais

### 2. ✅ Ajustes de Rotas
- [x] Base URL da aplicação configurada para `/admin/`
- [x] URLs das APIs ajustadas para `/admin/api/`
- [x] Configuração do Vite atualizada com `base: '/admin/'`

### 3. ✅ Nova Funcionalidade: Bloqueios de Horários
- [x] Criada página `TimeBlocks.tsx` para gerenciar bloqueios
- [x] Permite múltiplos bloqueios por dia e profissional
- [x] Campos: profissional, data, hora início, hora fim, motivo
- [x] Rota adicionada: `/dashboard/time-blocks`

### 4. ✅ Nova Funcionalidade: Configurações Financeiras
- [x] Criada página `FinancialSettings.tsx`
- [x] Checkbox "Habilitar cobrança na plataforma"
- [x] Campos para dados bancários (banco, agência, conta)
- [x] Configuração de chave PIX com tipo e valor
- [x] Rota adicionada: `/dashboard/financial`

### 5. ✅ Melhorias em Feriados
- [x] Adicionado checkbox "Feriado Recorrente" no cadastro de feriados municipais
- [x] Interface atualizada para marcar feriados que se repetem anualmente

### 6. ✅ Proteção de Dados
- [x] Foto do profissional nunca é apagada, apenas alterada
- [x] FileUpload ajustado para sempre manter foto existente

---

## 🔧 APIs ASP Necessárias (Backend)

### APIs de Bloqueios de Horários
```asp
' admin_getadmtimeblocks.asp
' Retorna: Array de bloqueios de horários
' GET: salonId (automático via session)
' Response: {
'   success: true,
'   data: [
'     {
'       id: "uuid",
'       professionalId: "uuid",
'       date: "2025-01-15",
'       startTime: "12:00",
'       endTime: "13:00",
'       reason: "Almoço"
'     }
'   ]
' }

' admin_setadmtimeblock.asp
' Cria ou atualiza bloqueio
' POST: { salonId, professionalId, date, startTime, endTime, reason }
' Response: { success: true, data: { id: "uuid" } }

' admin_deleteadmtimeblock.asp
' Remove bloqueio
' POST: { salonId, id }
' Response: { success: true }
```

### APIs Financeiras
```asp
' admin_getadmfinancial.asp
' Retorna configurações financeiras
' GET: salonId (automático)
' Response: {
'   success: true,
'   data: {
'     enablePayment: false,
'     bankName: "",
'     accountType: "corrente",
'     agencyNumber: "",
'     accountNumber: "",
'     pixKey: "",
'     pixKeyType: "cpf",
'     additionalInfo: ""
'   }
' }

' admin_setadmfinancial.asp
' Salva configurações financeiras
' POST: { salonId, enablePayment, bankName, accountType, agencyNumber, accountNumber, pixKey, pixKeyType, additionalInfo }
' Response: { success: true }
```

### APIs de Configuração de Slots
```asp
' admin_getadmslotsize.asp
' Retorna tamanho do slot configurado
' GET: salonId (automático)
' Response: {
'   success: true,
'   data: { slotSize: 30 } // 30 ou 60 minutos
' }

' admin_setadmslotsize.asp
' Define tamanho do slot
' POST: { salonId, slotSize }
' Response: { success: true }
```

### APIs de Feriados (Atualização)
```asp
' admin_setadmmunicipalidays.asp
' ATUALIZAR para aceitar campo isRecurring
' POST: { salonId, name, date, isRecurring }
' Response: { success: true, data: { id: "uuid" } }

' admin_getadmmunicipalidays.asp
' ATUALIZAR para retornar campo isRecurring
' Response: {
'   success: true,
'   data: [
'     { id: "uuid", name: "Carnaval", date: "2025-02-25", isRecurring: true }
'   ]
' }
```

### APIs de Profissionais (Atualização)
```asp
' admin_setadmprofessionals.asp
' ATUALIZAR para sempre enviar slug no JSON
' POST: { salonId, slug, name, email, phone, photoUrl, workingDays, startTime, endTime, isActive }
' IMPORTANTE: Ao atualizar/ativar/inativar, NUNCA apagar photoUrl
```

### APIs de Serviços (Atualização)
```asp
' admin_setadmservices.asp
' GARANTIR que professionalIds seja sempre enviado (tanto em CREATE quanto UPDATE)
' POST: { salonId, slug, name, description, duration, price, professionalIds, isActive }
' Response: { success: true, data: { id: "uuid" } }
```

### APIs de Datas Bloqueadas (Atualização)
```asp
' admin_setadmblockeddates.asp
' ATUALIZAR para sempre enviar slug e professionalId
' POST: { salonId, slug, professionalId, name, date }
' Response: { success: true, data: { id: "uuid" } }
```

---

## 🗄️ Alterações no Banco de Dados

### Tabela: `time_blocks` (CRIAR)
```sql
CREATE TABLE time_blocks (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  salon_id UNIQUEIDENTIFIER NOT NULL,
  professional_id UNIQUEIDENTIFIER NOT NULL,
  block_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason NVARCHAR(255),
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (salon_id) REFERENCES salons(id),
  FOREIGN KEY (professional_id) REFERENCES professionals(id)
);
```

### Tabela: `financial_settings` (CRIAR)
```sql
CREATE TABLE financial_settings (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  salon_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
  enable_payment BIT DEFAULT 0,
  bank_name NVARCHAR(100),
  account_type NVARCHAR(20),
  agency_number NVARCHAR(20),
  account_number NVARCHAR(30),
  pix_key NVARCHAR(100),
  pix_key_type NVARCHAR(20),
  additional_info NVARCHAR(1000),
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (salon_id) REFERENCES salons(id)
);
```

### Tabela: `holidays` (ATUALIZAR)
```sql
ALTER TABLE holidays
ADD is_recurring BIT DEFAULT 0;
```

### Tabela: `salon_settings` (ATUALIZAR)
```sql
ALTER TABLE salon_settings
ADD slot_size INT DEFAULT 30; -- 30 ou 60 minutos
```

---

## 📝 Funcionalidades Pendentes (Próximas Implementações)

### 1. Sistema de Perfis de Usuário
**Status:** ⏳ Pendente (complexo, requer segunda fase)

**Descrição:**
- Três níveis de acesso: Admin, Manager, Staff
- Admin: acesso total + gerenciar perfis de outros usuários
- Manager: acesso a todos os menus (exceto gerenciar perfis)
- Staff: acesso apenas ao seu horário, agenda e dados pessoais

**Requisitos:**
- Nova tabela `user_roles` no banco de dados
- Tela "Alterar acessos de perfis de usuários" (apenas Admin)
- Middleware de autenticação para verificar permissões
- RLS (Row Level Security) no backend

### 2. Tamanho de Slot Configurável
**Status:** ⏳ Pendente (requer interface em Settings)

**Requisitos:**
- Adicionar campo em `src/pages/Settings.tsx`
- Radio buttons: 30 minutos ou 60 minutos
- Salvar via `settingsApi.setSlotSize()`
- Aplicar na geração de horários disponíveis

### 3. Funcionalidade de Lembretes por WhatsApp
**Status:** ⏳ Pendente (complexo)

**Descrição:**
- Na página de agendamentos, botão "Enviar Lembretes"
- Lista de agendamentos da data selecionada
- Para cada agendamento: botão "Enviar Lembrete"
- Ao clicar: abre WhatsApp do profissional com mensagem preenchida
- Após fechar WhatsApp: botão muda para "Lembrete Enviado" (desabilitado)

**Requisitos:**
- Controle de estado no frontend (localStorage ou backend)
- Integração com WhatsApp Web API
- Template de mensagem configurável

### 4. Botão "Alterar Agendamento"
**Status:** ⏳ Pendente

**Requisitos:**
- Novo modal/página para editar agendamento
- Permitir alterar data, hora, serviço, profissional
- Validação de disponibilidade
- Notificação ao cliente (opcional)

### 5. Exibir Nome do Tema (não ID)
**Status:** ⏳ Pendente

**Descrição:**
- No `Select` de temas, exibir `theme.name` ao invés de `theme.id`
- Adicionar campos `foreground` e `background` aos temas
- Permitir maior personalização de cores

**Requisitos:**
- Atualizar estrutura de dados de temas
- Adicionar campos de cor no formulário
- API deve retornar/salvar novos campos

---

## ✅ Checklist de Implementação do Backend

### Prioridade Alta (Funcionalidades Novas)
- [ ] Criar API `admin_getadmtimeblocks.asp`
- [ ] Criar API `admin_setadmtimeblock.asp`
- [ ] Criar API `admin_deleteadmtimeblock.asp`
- [ ] Criar API `admin_getadmfinancial.asp`
- [ ] Criar API `admin_setadmfinancial.asp`
- [ ] Criar tabela `time_blocks` no banco
- [ ] Criar tabela `financial_settings` no banco

### Prioridade Média (Melhorias)
- [ ] Atualizar `admin_setadmmunicipalidays.asp` (campo `isRecurring`)
- [ ] Atualizar `admin_getadmmunicipalidays.asp` (campo `isRecurring`)
- [ ] Adicionar coluna `is_recurring` na tabela `holidays`
- [ ] Criar API `admin_getadmslotsize.asp`
- [ ] Criar API `admin_setadmslotsize.asp`
- [ ] Adicionar coluna `slot_size` em `salon_settings`

### Prioridade Baixa (Ajustes)
- [ ] Garantir que todas as APIs sempre recebam e validem `salonId` e `slug`
- [ ] Garantir que `admin_setadmprofessionals.asp` nunca apague `photoUrl`
- [ ] Garantir que `admin_setadmservices.asp` sempre receba `professionalIds`
- [ ] Atualizar `admin_setadmblockeddates.asp` para receber `professionalId`

---

## 🚀 Como Testar

### Teste de Rotas
1. Acesse `http://seu-servidor/admin/`
2. Faça login
3. Navegue pelos menus e verifique se as URLs estão corretas
4. Recarregue a página em cada rota para validar o roteamento

### Teste de Bloqueios de Horários
1. Acesse "Bloqueios de Horários"
2. Adicione um bloqueio selecionando profissional, data e horários
3. Verifique se aparece na lista
4. Remova um bloqueio e valide a exclusão

### Teste de Configurações Financeiras
1. Acesse "Financeiro"
2. Preencha dados bancários e chave PIX
3. Habilite "Cobrança na plataforma"
4. Salve e recarregue para validar persistência

### Teste de Feriados Recorrentes
1. Acesse "Configurar Salão"
2. Na seção de feriados, marque "Feriado Recorrente"
3. Salve e valide que o campo foi persistido

---

## 📞 Suporte e Dúvidas

Para dúvidas sobre a implementação, consulte:
- `src/lib/api.ts` - Todas as chamadas de API
- `src/pages/*` - Componentes de cada página
- `src/components/DashboardLayout.tsx` - Menu e rotas

**Documentação Técnica:**
- React Router: https://reactrouter.com/
- Vite Base URL: https://vitejs.dev/config/shared-options.html#base
- Shadcn UI: https://ui.shadcn.com/

---

*Documento criado em: 25/10/2025*  
*Última atualização: 25/10/2025*
