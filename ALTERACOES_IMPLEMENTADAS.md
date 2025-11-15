# Plano de Implementação - Alterações Realizadas

## Data: 2025-11-15

Este documento detalha todas as alterações implementadas no frontend e as mudanças necessárias no backend (APIs e banco de dados).

---

## 1. Alterações no Frontend

### 1.1 Session Manager - Campos Adicionados
**Arquivo:** `src/lib/session.ts`

**Alterações:**
- Adicionado campo `userId` na interface `SessionData`
- Adicionado campo `slug` na interface `SessionData`
- Criado método `getUserId()` para recuperar ID do usuário logado
- Criado método `getSlug()` para recuperar slug do banco

**Objetivo:** Permitir rastreamento do profissional logado e identificação do banco de dados.

---

### 1.2 APIs - Novos Endpoints de Delete
**Arquivo:** `src/lib/api.ts`

**Alterações:**
- Adicionado `deleteDate()` em `scheduleApi` - Delete de datas bloqueadas
- Adicionado `deleteMunicipal()` em `holidayApi` - Delete de feriados municipais
- Adicionado `deleteBlocked()` em `holidayApi` - Delete de dias bloqueados

**Objetivo:** Permitir remoção de feriados e datas bloqueadas.

---

### 1.3 Configurações do Salão - Delete de Feriados
**Arquivo:** `src/pages/SalonManagement.tsx`

**Alterações:**
- Implementada função `handleRemoveHoliday()` com confirmação em vermelho
- Adicionado envio de `userId`, `salonId` e `slug` ao criar feriados
- Integração com APIs de delete de feriados municipais e dias bloqueados

**Funcionalidade:** 
- Botão X ao lado de cada feriado/data bloqueada
- Confirmação: "TEM CERTEZA QUE DESEJA APAGAR O ITEM SELECIONADO?" (em vermelho)
- Chamada para API de delete correspondente

---

### 1.4 Cliente Fixo - Profissional e Serviço
**Arquivo:** `src/components/ClientsManagement.tsx`

**Alterações:**
- Adicionadas interfaces `Professional` e `Service`
- Carregamento de profissionais e serviços via API
- Adicionado campo Select para escolher Profissional
- Adicionado campo Select para escolher Serviço
- Envio de `userId`, `salonId` e `slug` ao cadastrar cliente fixo
- Envio de `professionalId` e `serviceId` no payload

**Objetivo:** Vincular cliente fixo a um profissional e serviço específico.

---

### 1.5 Bloqueio de Horários - UserID e Slug
**Arquivo:** `src/pages/TimeBlocks.tsx`

**Alterações:**
- Alterado envio de `userId` de `getSessionId()` para `getUserId()`
- Adicionado envio de `slug` ao criar bloqueio de horário

**Objetivo:** Garantir que o bloqueio seja associado ao profissional correto.

---

### 1.6 Verificação de Agendamentos ao Deletar Profissional
**Arquivo:** `src/pages/ProfessionalForm.tsx`

**Status:** PENDENTE DE IMPLEMENTAÇÃO

**Funcionalidade Necessária:**
1. Antes de deletar profissional, verificar se existem agendamentos futuros
2. Se existirem agendamentos:
   - Abrir modal/diálogo
   - Listar todos os agendamentos do profissional
   - Permitir selecionar novo profissional para cada agendamento
   - Confirmar reatribuição
3. Se não existirem agendamentos:
   - Proceder com delete normalmente

---

## 2. Alterações Necessárias no Backend (APIs ASP)

### 2.1 API de Deleção de Feriados Municipais
**Endpoint:** `admin_deleteadmmunicipalholiday.asp`

**Método:** POST

**Payload:**
```json
{
  "id": "ID_DO_FERIADO"
}
```

**Resposta:**
```json
{
  "success": true
}
```

**Ação:** Deletar registro da tabela de feriados municipais onde `id = ID_DO_FERIADO`

---

### 2.2 API de Deleção de Dias Bloqueados
**Endpoint:** `admin_deleteadmblockedday.asp`

**Método:** POST

**Payload:**
```json
{
  "id": "ID_DA_DATA_BLOQUEADA"
}
```

**Resposta:**
```json
{
  "success": true
}
```

**Ação:** Deletar registro da tabela de datas bloqueadas onde `id = ID_DA_DATA_BLOQUEADA`

---

### 2.3 API de Deleção de Datas
**Endpoint:** `admin_deleteadmdate.asp`

**Método:** POST

**Payload:**
```json
{
  "id": "ID_DA_DATA"
}
```

**Resposta:**
```json
{
  "success": true
}
```

**Ação:** Deletar registro da tabela de datas onde `id = ID_DA_DATA`

---

### 2.4 API de Cadastro de Feriados - Campos Adicionais
**Endpoints:** 
- `admin_setadmmunicipalidays.asp` (feriados municipais)
- `admin_setadmblockeddates.asp` (datas bloqueadas)

**Campos Adicionais no Payload:**
```json
{
  "name": "Nome do Feriado",
  "date": "2025-12-25",
  "userId": "ID_DO_USUARIO_LOGADO",
  "salonId": "ID_DO_SALAO",
  "slug": "SLUG_DO_BANCO",
  "isRecurring": true
}
```

**Ações:**
- Validar `userId` e `salonId`
- Gravar `slug` para identificação do banco
- Se `isRecurring = true`, marcar como feriado recorrente (se repete todo ano)

---

### 2.5 API de Bloqueio de Horários - Campos Adicionais
**Endpoint:** `admin_setadmtimeblock.asp`

**Campos Adicionais no Payload:**
```json
{
  "professionalId": "ID_DO_PROFISSIONAL",
  "date": "2025-01-15",
  "startTime": "12:00",
  "endTime": "13:00",
  "reason": "Almoço",
  "userId": "ID_DO_USUARIO_LOGADO",
  "salonId": "ID_DO_SALAO",
  "slug": "SLUG_DO_BANCO",
  "isRecurring": true,
  "recurrenceType": "weekdays"
}
```

**Campo `userId`:**
- Deve ser o ID do profissional logado (não sessionId)
- Usado para filtrar bloqueios por profissional

**Campo `slug`:**
- Identificador único do banco de dados
- Essencial para ambientes multi-tenant

---

### 2.6 API de Cliente Fixo - Campos Adicionais
**Endpoint:** `admin_setadmfixedclients.asp`

**Campos Adicionais no Payload:**
```json
{
  "name": "João Silva",
  "phone": "11999999999",
  "frequency": "semanal",
  "weekDay": "2",
  "time": "14:00",
  "professionalId": "ID_DO_PROFISSIONAL",
  "serviceId": "ID_DO_SERVICO",
  "userId": "ID_DO_USUARIO_LOGADO",
  "salonId": "ID_DO_SALAO",
  "slug": "SLUG_DO_BANCO"
}
```

**Novos Campos:**
- `professionalId`: Profissional responsável pelo atendimento
- `serviceId`: Serviço que será prestado
- `userId`: ID do usuário logado (profissional)
- `slug`: Identificador do banco

---

### 2.7 API de Verificação de Agendamentos do Profissional
**Endpoint:** `admin_checkprofessionalappointments.asp` (CRIAR)

**Método:** GET

**Query String:**
```
?professionalId=ID_DO_PROFISSIONAL&salonId=ID_DO_SALAO
```

**Resposta:**
```json
{
  "success": true,
  "hasAppointments": true,
  "appointments": [
    {
      "id": "appt1",
      "date": "2025-01-20",
      "time": "10:00",
      "clientName": "Maria Santos",
      "serviceName": "Corte"
    },
    {
      "id": "appt2",
      "date": "2025-01-22",
      "time": "15:00",
      "clientName": "João Silva",
      "serviceName": "Barba"
    }
  ]
}
```

**Objetivo:** Verificar se profissional tem agendamentos futuros antes de deletar.

---

### 2.8 API de Reatribuição de Agendamentos
**Endpoint:** `admin_reassignappointments.asp` (CRIAR)

**Método:** POST

**Payload:**
```json
{
  "appointments": [
    {
      "appointmentId": "appt1",
      "newProfessionalId": "prof2"
    },
    {
      "appointmentId": "appt2",
      "newProfessionalId": "prof3"
    }
  ],
  "salonId": "ID_DO_SALAO",
  "userId": "ID_DO_USUARIO_LOGADO"
}
```

**Resposta:**
```json
{
  "success": true,
  "reassignedCount": 2
}
```

**Ação:** Atualizar `professionalId` nos agendamentos especificados.

---

## 3. Alterações no Banco de Dados

### 3.1 Tabela de Feriados Municipais
**Tabela:** `municipal_holidays`

**Campos Adicionais:**
- `user_id` (VARCHAR/INT) - ID do usuário que cadastrou
- `slug` (VARCHAR) - Identificador do banco
- `is_recurring` (BIT/BOOLEAN) - Se repete anualmente

---

### 3.2 Tabela de Datas Bloqueadas
**Tabela:** `blocked_dates`

**Campos Adicionais:**
- `user_id` (VARCHAR/INT) - ID do usuário que cadastrou
- `slug` (VARCHAR) - Identificador do banco

---

### 3.3 Tabela de Bloqueios de Horário
**Tabela:** `time_blocks`

**Campos Adicionais:**
- `user_id` (VARCHAR/INT) - ID do profissional logado
- `slug` (VARCHAR) - Identificador do banco

**Observação:** O campo `user_id` deve representar o **profissional**, não a sessão.

---

### 3.4 Tabela de Clientes Fixos
**Tabela:** `fixed_clients`

**Campos Adicionais:**
- `professional_id` (VARCHAR/INT) - ID do profissional responsável
- `service_id` (VARCHAR/INT) - ID do serviço a ser prestado
- `user_id` (VARCHAR/INT) - ID do usuário que cadastrou
- `slug` (VARCHAR) - Identificador do banco

**Foreign Keys:**
- `professional_id` → `professionals(id)`
- `service_id` → `services(id)`

---

## 4. Funcionalidades Pendentes

### 4.1 Reatribuição de Agendamentos ao Deletar Profissional
**Status:** NÃO IMPLEMENTADO

**Requisitos:**
1. Criar API para verificar agendamentos do profissional
2. Criar API para reatribuir agendamentos
3. Implementar modal no frontend para seleção de novo profissional
4. Implementar lógica de reatribuição em lote

**Prioridade:** ALTA

---

### 4.2 Filtro por Profissional
**Status:** PARCIALMENTE IMPLEMENTADO

**APIs que devem filtrar por `professionalId`:**
- `admin_getadmtimeblocks.asp` - Bloqueios de horário
- `admin_getadmdates.asp` - Datas bloqueadas
- `admin_getadmappointments.asp` - Agendamentos

**Query String:**
```
?professionalId=ID_DO_PROFISSIONAL&salonId=ID_DO_SALAO
```

**Prioridade:** ALTA

---

## 5. Checklist de Implementação Backend

### Alta Prioridade
- [ ] Criar API `admin_deleteadmmunicipalholiday.asp`
- [ ] Criar API `admin_deleteadmblockedday.asp`
- [ ] Criar API `admin_deleteadmdate.asp`
- [ ] Adicionar campos `userId`, `slug` em todas as APIs de cadastro
- [ ] Criar API `admin_checkprofessionalappointments.asp`
- [ ] Criar API `admin_reassignappointments.asp`
- [ ] Adicionar colunas no banco: `user_id`, `slug`, `is_recurring`
- [ ] Adicionar colunas em `fixed_clients`: `professional_id`, `service_id`

### Média Prioridade
- [ ] Implementar filtros por `professionalId` nas APIs de listagem
- [ ] Validar `salonId` em todas as operações
- [ ] Implementar logs de auditoria para operações de delete
- [ ] Validar permissões de usuário antes de deletar

### Baixa Prioridade
- [ ] Otimizar queries do banco com índices
- [ ] Implementar cache para listagens frequentes
- [ ] Adicionar paginação nas listagens grandes

---

## 6. Testes Necessários

### 6.1 Testes de Delete
- [ ] Deletar feriado municipal
- [ ] Deletar data bloqueada
- [ ] Deletar bloqueio de horário
- [ ] Confirmar que delete solicita confirmação

### 6.2 Testes de Cadastro
- [ ] Cadastrar feriado com `userId` e `slug`
- [ ] Cadastrar data bloqueada com `userId` e `slug`
- [ ] Cadastrar bloqueio de horário com `userId` e `slug`
- [ ] Cadastrar cliente fixo com profissional e serviço

### 6.3 Testes de Reatribuição
- [ ] Verificar agendamentos antes de deletar profissional
- [ ] Reatribuir agendamentos para novo profissional
- [ ] Verificar que reatribuição preserva dados do agendamento

### 6.4 Testes de Filtro
- [ ] Filtrar bloqueios por profissional
- [ ] Filtrar agendamentos por profissional
- [ ] Filtrar datas bloqueadas por profissional

---

## 7. Observações Importantes

### 7.1 Diferença entre sessionId e userId
- **sessionId**: Identificador da sessão do usuário (usado para autenticação)
- **userId**: Identificador do profissional/usuário logado (usado para associar dados)

**Importante:** Ao enviar `userId`, usar `sessionManager.getUserId()` e não `sessionManager.getSessionId()`

---

### 7.2 Slug do Banco
O campo `slug` deve ser enviado em **todas as operações de gravação (INSERT)** para:
- Identificar qual banco de dados usar (multi-tenant)
- Garantir isolamento de dados entre salões
- Facilitar migrações e backups

---

### 7.3 Confirmação de Delete
Todos os botões de delete devem:
1. Exibir mensagem: "TEM CERTEZA QUE DESEJA APAGAR O ITEM SELECIONADO?"
2. Mensagem em **VERMELHO**
3. Aguardar confirmação antes de chamar API
4. Usar `window.confirm()` ou modal customizado

---

## 8. Endpoints ASP Criados/Modificados

### Endpoints Novos (CRIAR)
1. `admin_deleteadmmunicipalholiday.asp` - Delete de feriado municipal
2. `admin_deleteadmblockedday.asp` - Delete de data bloqueada
3. `admin_deleteadmdate.asp` - Delete de data
4. `admin_checkprofessionalappointments.asp` - Verificar agendamentos do profissional
5. `admin_reassignappointments.asp` - Reatribuir agendamentos

### Endpoints Modificados (ATUALIZAR)
1. `admin_setadmmunicipalidays.asp` - Adicionar `userId`, `slug`, `isRecurring`
2. `admin_setadmblockeddates.asp` - Adicionar `userId`, `slug`
3. `admin_setadmtimeblock.asp` - Adicionar `userId`, `slug`
4. `admin_setadmfixedclients.asp` - Adicionar `professionalId`, `serviceId`, `userId`, `slug`
5. `admin_getadmtimeblocks.asp` - Adicionar filtro por `professionalId`
6. `admin_getadmdates.asp` - Adicionar filtro por `professionalId`
7. `admin_getadmappointments.asp` - Adicionar filtro por `professionalId`

---

## 9. Resumo Executivo

**Total de Alterações Frontend:** 6 arquivos modificados
**Novas APIs Necessárias:** 5
**APIs a Modificar:** 7
**Tabelas do Banco a Alterar:** 4

**Estimativa de Esforço Backend:**
- APIs novas: 8-12 horas
- Modificação de APIs: 6-8 horas
- Alterações no banco: 2-4 horas
- Testes: 4-6 horas
- **Total:** 20-30 horas

**Prioridade de Implementação:**
1. APIs de delete (2-3 horas)
2. Campos adicionais (userId, slug) (3-4 horas)
3. API de verificação de agendamentos (2-3 horas)
4. API de reatribuição (2-3 horas)
5. Filtros por profissional (2-3 horas)

---

**Documento gerado em:** 15/11/2025
**Versão:** 1.0
