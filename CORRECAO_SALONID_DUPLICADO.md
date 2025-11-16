# 🔧 Correção - salonId Duplicado e userId Ausente

## ⚠️ Problema Identificado

Na API `admin_setsadmalon.asp`, o payload estava sendo enviado com:
- `salonId` duplicado (uma vez como `salonId` e outra como `salonid` em lowercase)
- `userId` ausente
- `slug` ausente

**Payload incorreto:**
```json
{
  "name": "Meu Salão",
  "salonId": "1",      // ✅ Adicionado automaticamente pelo apiCall
  "salonid": "1",      // ❌ Duplicado (vinha do salonData)
  "description": "...",
  // ❌ userId e slug ausentes
}
```

---

## ✅ Correção Implementada

### Frontend: `src/pages/SalonManagement.tsx`

**Alteração na função `handleSubmit`:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const userId = sessionManager.getUserId();
    const slug = sessionManager.getSlug();
    
    // Remove salonid duplicado e adiciona userId e slug
    const { salonid, ...cleanData } = salonData as any;
    const payload = {
      ...cleanData,
      userId,
      slug
    };

    const response = await salonApi.set(payload);
    // ...
  }
}
```

**O que foi feito:**
1. ✅ Removido o campo `salonid` (lowercase) duplicado do payload
2. ✅ Adicionado `userId` do profissional logado
3. ✅ Adicionado `slug` do salão
4. ✅ Mantido o `salonId` que é injetado automaticamente pelo `apiCall`

---

## 📊 Estrutura do Payload Corrigido

### Payload enviado agora:

```json
{
  "name": "Meu Salão",
  "description": "Descrição do salão",
  "address": "Rua X, 123",
  "phone": "(11) 98765-4321",
  "workingDays": ["1", "2", "3", "4", "5"],
  "openTime": "09:00",
  "closeTime": "18:00",
  "selectedTheme": "azul",
  "primaryColor": "#3b82f6",
  "secondaryColor": "#8b5cf6",
  "accentColor": "#10b981",
  "instagram": "@meusalao",
  "facebook": "meusalao",
  "youtube": "meusalao",
  "tiktok": "@meusalao",
  "whatsappCustomText": "Olá! Gostaria de agendar um horário.",
  "evadedClientsReminderText": "Sentimos sua falta!",
  "userId": "456",           // ✅ Adicionado
  "slug": "meu-salao",       // ✅ Adicionado
  "salonId": "1"             // ✅ Único (injetado automaticamente)
}
```

---

## 🔧 Alterações Necessárias no Backend

### API: `admin_setsadmalon.asp`

**Endpoint:** `POST /admin/api/admin_setsadmalon.asp`

**Payload Recebido:** (veja estrutura acima)

### Campos que devem ser gravados no banco:

| Campo | Origem | Descrição |
|-------|--------|-----------|
| `salonId` | Automático | ID do salão (chave) |
| `userId` | Frontend | ID do profissional que fez a alteração |
| `slug` | Frontend | Slug do salão para URLs amigáveis |
| Demais campos | Frontend | Dados do salão (name, address, etc.) |

### Implementação no ASP:

```vbscript
' admin_setsadmalon.asp
Dim salonData, salonId, userId, slug

' Receber JSON do POST
salonData = Request.Form

salonId = salonData("salonId")
userId = salonData("userId")
slug = salonData("slug")

' Validar campos obrigatórios
If IsEmpty(salonId) Or IsEmpty(userId) Then
  Response.Write "{""success"": false, ""error"": ""Campos obrigatórios ausentes""}"
  Response.End
End If

' Atualizar dados no banco
sql = "UPDATE salons SET " & _
      "name = ?, " & _
      "description = ?, " & _
      "address = ?, " & _
      "phone = ?, " & _
      "working_days = ?, " & _
      "open_time = ?, " & _
      "close_time = ?, " & _
      "theme = ?, " & _
      "primary_color = ?, " & _
      "secondary_color = ?, " & _
      "accent_color = ?, " & _
      "instagram = ?, " & _
      "facebook = ?, " & _
      "youtube = ?, " & _
      "tiktok = ?, " & _
      "whatsapp_text = ?, " & _
      "evaded_reminder_text = ?, " & _
      "updated_by = ?, " & _        // ✅ Registrar quem atualizou
      "updated_at = GETDATE() " & _
      "WHERE id = ?"

' Executar query com parâmetros...

Response.Write "{""success"": true}"
```

---

## 📝 Observações Importantes

### 1. Duplicação do salonId
- O campo `salonid` (lowercase) estava vindo do backend na carga inicial dos dados
- Isso causava duplicação quando o frontend reenviava os dados
- **Solução:** O frontend agora remove qualquer `salonid` antes de enviar

### 2. Auditoria
- Com o `userId` sendo enviado, é possível registrar **quem** fez alterações
- Recomendado adicionar campos `updated_by` e `updated_at` na tabela `salons`

### 3. Slug
- O `slug` pode ser usado para validar se o usuário está atualizando o salão correto
- Também é útil para gerar URLs amigáveis (ex: `/salao/meu-salao`)

---

## 🧪 Como Testar

### 1. Verificar payload enviado
1. Abrir **DevTools** (F12)
2. Ir na aba **Network**
3. Filtrar por `admin_setsadmalon.asp`
4. Editar informações do salão e salvar
5. Verificar o **Payload** enviado:
   - ✅ Deve ter apenas 1 campo `salonId` (sem duplicação)
   - ✅ Deve ter `userId` com valor
   - ✅ Deve ter `slug` com valor

### 2. Verificar dados no banco
```sql
SELECT * FROM salons WHERE id = 1;
```
- Verificar se os dados foram atualizados corretamente
- Verificar se o campo `updated_by` foi preenchido (se implementado)

---

## ✅ Checklist de Implementação

- [x] **Frontend:** Remover duplicação do `salonId`
- [x] **Frontend:** Adicionar `userId` ao payload
- [x] **Frontend:** Adicionar `slug` ao payload
- [ ] **Backend:** Atualizar `admin_setsadmalon.asp` para processar `userId` e `slug`
- [ ] **Banco de Dados:** Adicionar campos `updated_by` e `updated_at` (opcional, mas recomendado)

---

## 📌 Arquivos Modificados

### Frontend
- ✅ `src/pages/SalonManagement.tsx` - Função `handleSubmit` corrigida

### Backend (Pendente)
- ⚠️ `admin_setsadmalon.asp` - Precisa processar os novos campos

---

**Última atualização:** 16/11/2025
