# Plano de Implementação - 17/11/2024

## Alterações Implementadas no Frontend

### 1. Envio de Cores no Payload do Salão
**Arquivo:** `src/pages/SalonManagement.tsx`

**Mudança:** O payload agora envia explicitamente todas as 5 cores para a API `admin_setsadmalon.asp`:
- `primaryColor`
- `secondaryColor`
- `accentColor` (anteriormente chamado de `foregroundColor`)
- `successColor`
- `warningColor`

**Impacto Backend:** A API `admin_setsadmalon.asp` precisa ser atualizada para receber e armazenar esses 5 campos de cor.

**Database:**
```sql
-- Verificar se as colunas existem na tabela de salões
ALTER TABLE salons ADD COLUMN primaryColor VARCHAR(7);
ALTER TABLE salons ADD COLUMN secondaryColor VARCHAR(7);
ALTER TABLE salons ADD COLUMN accentColor VARCHAR(7);
ALTER TABLE salons ADD COLUMN successColor VARCHAR(7);
ALTER TABLE salons ADD COLUMN warningColor VARCHAR(7);
```

**API Backend (admin_setsadmalon.asp):**
```asp
' Receber as cores do payload
Dim primaryColor, secondaryColor, accentColor, successColor, warningColor

primaryColor = Request("primaryColor")
secondaryColor = Request("secondaryColor")
accentColor = Request("accentColor")
successColor = Request("successColor")
warningColor = Request("warningColor")

' Atualizar no banco de dados
SQL = "UPDATE salons SET " & _
      "primaryColor = '" & primaryColor & "', " & _
      "secondaryColor = '" & secondaryColor & "', " & _
      "accentColor = '" & accentColor & "', " & _
      "successColor = '" & successColor & "', " & _
      "warningColor = '" & warningColor & "', " & _
      "... outros campos ... " & _
      "WHERE id = " & salonId
```

---

### 2. Renomeação de "Feriados Municipais" para "Feriados"
**Arquivo:** `src/pages/SalonManagement.tsx`

**Mudança:** Alterado o título e descrição do card de "Feriados Municipais" para apenas "Feriados".

**Impacto Backend:** Nenhum impacto direto nas APIs.

---

### 3. Filtro por Profissional em Feriados e Datas Bloqueadas
**Arquivos:** 
- `src/pages/SalonManagement.tsx`
- `src/pages/TimeBlocks.tsx`

**Mudança:** O payload agora inclui o campo `professionalId` ao cadastrar feriados, datas bloqueadas e bloqueios de horário. Isso permite que cada registro seja associado a um profissional específico.

**Impacto Backend:** As APIs precisam aceitar e armazenar o `professionalId`:
- `admin_setadmmunicipalidays.asp`
- `admin_setadmblockeddates.asp`
- `admin_setadmtimeblock.asp`

**Database:**
```sql
-- Adicionar coluna professionalId nas tabelas relevantes
ALTER TABLE municipal_holidays ADD COLUMN professionalId INT NULL;
ALTER TABLE blocked_dates ADD COLUMN professionalId INT NULL;
ALTER TABLE time_blocks ADD COLUMN professionalId INT NOT NULL;

-- Criar índice para melhorar performance nas consultas
CREATE INDEX idx_municipal_holidays_professional ON municipal_holidays(professionalId);
CREATE INDEX idx_blocked_dates_professional ON blocked_dates(professionalId);
CREATE INDEX idx_time_blocks_professional ON time_blocks(professionalId);
```

**API Backend (exemplo para admin_setadmmunicipalidays.asp):**
```asp
' Receber professionalId do payload
Dim professionalId
professionalId = Request("professionalId")

' Se professionalId for null, aplicar a todos
If IsNull(professionalId) Or professionalId = "" Then
    professionalId = NULL
End If

' Inserir no banco
SQL = "INSERT INTO municipal_holidays (name, date, professionalId, userId, salonId, slug) " & _
      "VALUES ('" & name & "', '" & date & "', " & professionalId & ", " & userId & ", " & salonId & ", '" & slug & "')"
```

**API de Consulta (admin_getadmmunicipalidays.asp):**
```asp
' Filtrar por profissional se especificado
Dim professionalId
professionalId = Request("professionalId")

If professionalId <> "" Then
    SQL = "SELECT * FROM municipal_holidays WHERE salonId = " & salonId & " AND (professionalId = " & professionalId & " OR professionalId IS NULL)"
Else
    SQL = "SELECT * FROM municipal_holidays WHERE salonId = " & salonId
End If
```

---

### 4. Verificação de Agendamentos ao Excluir Profissional
**Arquivos:**
- `src/pages/ProfessionalsManagement.tsx`
- `src/components/ReassignAppointmentsDialog.tsx` (novo arquivo)

**Mudança:** Antes de excluir um profissional, o sistema verifica se existem agendamentos futuros. Se existirem, abre um diálogo para que o usuário reatribua cada agendamento a outro profissional.

**Fluxo:**
1. Usuário clica em "Excluir Profissional"
2. Sistema busca agendamentos futuros do profissional
3. Se houver agendamentos:
   - Abre diálogo de reatribuição
   - Usuário seleciona novo profissional para cada agendamento
   - Sistema atualiza os agendamentos
   - Sistema exclui o profissional
4. Se não houver agendamentos:
   - Abre diálogo de confirmação simples
   - Sistema exclui o profissional

**Impacto Backend:** A API `admin_setadmappointments.asp` precisa aceitar atualizações parciais de agendamentos (apenas o campo `professionalId`).

**API Backend (admin_setadmappointments.asp):**
```asp
' Permitir atualização apenas do professionalId
Dim appointmentId, newProfessionalId

appointmentId = Request("id")
newProfessionalId = Request("professionalId")

If appointmentId <> "" And newProfessionalId <> "" Then
    SQL = "UPDATE appointments SET professionalId = " & newProfessionalId & " WHERE id = " & appointmentId
    ' Executar query
End If
```

---

### 5. Envio de Slug em Todas as Gravações
**Arquivos:**
- `src/pages/ProfessionalForm.tsx`
- `src/pages/ServiceForm.tsx`
- `src/pages/Settings.tsx`
- `src/pages/TimeBlocks.tsx`
- `src/pages/SalonManagement.tsx`

**Mudança:** Todos os formulários de cadastro/edição agora enviam os parâmetros `userId` e `slug` no payload.

**Impacto Backend:** Todas as APIs de gravação (`set*`) devem aceitar e armazenar esses campos:
- `admin_setadmprofessionals.asp`
- `admin_setadmservices.asp`
- `admin_setadmsettings.asp`
- `admin_setadmtimeblock.asp`
- `admin_setsadmalon.asp`

**Database:**
```sql
-- Adicionar colunas userId e slug em todas as tabelas principais
ALTER TABLE professionals ADD COLUMN userId INT;
ALTER TABLE professionals ADD COLUMN slug VARCHAR(255);

ALTER TABLE services ADD COLUMN userId INT;
ALTER TABLE services ADD COLUMN slug VARCHAR(255);

ALTER TABLE settings ADD COLUMN userId INT;
ALTER TABLE settings ADD COLUMN slug VARCHAR(255);

-- Criar índices para otimização
CREATE INDEX idx_professionals_user ON professionals(userId);
CREATE INDEX idx_professionals_slug ON professionals(slug);
CREATE INDEX idx_services_user ON services(userId);
CREATE INDEX idx_services_slug ON services(slug);
```

**API Backend (padrão para todos os endpoints):**
```asp
' Receber userId e slug
Dim userId, slug
userId = Request("userId")
slug = Request("slug")

' Incluir nas queries de INSERT/UPDATE
SQL = "INSERT INTO table_name (..., userId, slug) VALUES (..., " & userId & ", '" & slug & "')"
' OU
SQL = "UPDATE table_name SET ..., userId = " & userId & ", slug = '" & slug & "' WHERE id = " & id
```

---

### 6. Melhorias nos Toasts (Notificações)
**Arquivos:** Múltiplos arquivos de páginas

**Mudança:** Toasts de sucesso agora têm um fundo azul claro (`bg-blue-50 border-blue-200`) para melhor contraste. Toasts de erro mantêm o estilo vermelho (`variant="destructive"`).

**Impacto Backend:** Nenhum.

**CSS Adicional (se necessário em `src/index.css`):**
```css
/* Estilo personalizado para toasts de sucesso */
.toast.bg-blue-50 {
  background-color: hsl(210 100% 97%);
  border-color: hsl(210 100% 90%);
  color: hsl(215 25% 27%);
}
```

---

## Checklist de Implementação Backend

### APIs que Precisam de Atualização:

#### Alta Prioridade:
- [ ] `admin_setsadmalon.asp` - Aceitar 5 cores (primaryColor, secondaryColor, accentColor, successColor, warningColor)
- [ ] `admin_setadmprofessionals.asp` - Aceitar userId e slug
- [ ] `admin_setadmservices.asp` - Aceitar userId e slug
- [ ] `admin_setadmsettings.asp` - Aceitar userId e slug
- [ ] `admin_setadmtimeblock.asp` - Aceitar userId, slug e professionalId
- [ ] `admin_setadmmunicipalidays.asp` - Aceitar professionalId, userId e slug
- [ ] `admin_setadmblockeddates.asp` - Aceitar professionalId, userId e slug
- [ ] `admin_setadmappointments.asp` - Permitir atualização parcial (apenas professionalId)

#### Média Prioridade:
- [ ] `admin_getsadmalon.asp` - Retornar as 5 cores
- [ ] `admin_getadmmunicipalidays.asp` - Filtrar por professionalId
- [ ] `admin_getadmblockeddates.asp` - Filtrar por professionalId
- [ ] `admin_getadmtimeblocks.asp` - Filtrar por professionalId

### Database:

- [ ] Criar migrations para adicionar colunas de cores na tabela `salons`
- [ ] Criar migrations para adicionar `professionalId` em `municipal_holidays`, `blocked_dates`, `time_blocks`
- [ ] Criar migrations para adicionar `userId` e `slug` em todas as tabelas principais
- [ ] Criar índices para otimização de consultas

---

## Testes Recomendados

### Frontend:
1. Testar envio de cores ao salvar salão
2. Testar cadastro de feriados com profissional específico
3. Testar exclusão de profissional sem agendamentos
4. Testar exclusão de profissional com agendamentos (reatribuição)
5. Verificar toasts de sucesso com fundo azul claro
6. Verificar envio de userId e slug em todos os formulários

### Backend:
1. Verificar se as 5 cores são salvas corretamente
2. Verificar se professionalId é salvo em feriados e bloqueios
3. Verificar se userId e slug são salvos em todas as tabelas
4. Testar filtragem de feriados por profissional
5. Testar atualização parcial de agendamentos

---

## Notas Importantes

- **Compatibilidade:** Todas as mudanças são retrocompatíveis. Campos novos como `professionalId` aceitam `NULL`.
- **Validação:** Backend deve validar que `professionalId` existe na tabela de profissionais quando fornecido.
- **Segurança:** Validar que `userId` e `salonId` pertencem ao usuário autenticado.
- **Performance:** Índices criados nas colunas frequentemente consultadas.

---

## Data de Implementação
**Data:** 17/11/2024
**Responsável Frontend:** Concluído
**Responsável Backend:** Pendente
**Database:** Pendente
