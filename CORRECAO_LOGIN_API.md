# 🔧 Correção Urgente - API de Login

## ⚠️ Problema Identificado

No cadastro de feriados e datas bloqueadas, os campos `userId` e `slug` estão sendo enviados como `null` no payload porque **a API de login não está retornando esses dados** na resposta.

**Payload atual (INCORRETO):**
```json
{
  "name": "Viagem",
  "date": "2025-11-28",
  "userId": null,      // ❌ NULL
  "salonId": "1",
  "slug": null         // ❌ NULL
}
```

---

## ✅ Solução Necessária

### API de Login: `admin_authlogin.asp`

**Endpoint:** `POST /admin/api/admin_authlogin.asp`

**Payload Recebido:**
```json
{
  "username": "usuario",
  "password": "senha"
}
```

### 📝 Resposta ATUAL (incorreta):
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123...",
    "salonId": "1",
    "userName": "João Silva"
  }
}
```

### ✅ Resposta NECESSÁRIA (corrigida):
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123...",
    "salonId": "1",
    "userName": "João Silva",
    "userId": "456",                    // ⚠️ ADICIONAR
    "slug": "joao-silva-cabeleireiro"   // ⚠️ ADICIONAR
  }
}
```

---

## 📊 Estrutura de Dados Necessária

| Campo | Tipo | Descrição | Origem |
|-------|------|-----------|--------|
| `sessionId` | string | ID da sessão | Gerado no login |
| `salonId` | string | ID do salão | Tabela `users` ou `professionals` |
| `userName` | string | Nome do usuário | Tabela `users` ou `professionals` |
| **`userId`** | string | **ID do profissional logado** | Tabela `users` ou `professionals` |
| **`slug`** | string | **Slug do salão** | Tabela `salons` |

---

## 💻 Implementação no Backend (ASP Classic)

### Query SQL Recomendada

```sql
SELECT 
  u.id as userId,
  u.name as userName,
  u.salonId,
  s.slug
FROM users u
INNER JOIN salons s ON s.id = u.salonId
WHERE u.username = ? AND u.password = ?
```

### Código ASP de Exemplo

```vbscript
' admin_authlogin.asp
Dim username, password, conn, rs, response

' Receber dados do POST
username = Request.Form("username")
password = Request.Form("password")

' Conectar ao banco
Set conn = Server.CreateObject("ADODB.Connection")
conn.Open "sua_string_de_conexao"

' Query com JOIN para obter todos os dados necessários
sql = "SELECT u.id as userId, u.name as userName, u.salonId, s.slug " & _
      "FROM users u " & _
      "INNER JOIN salons s ON s.id = u.salonId " & _
      "WHERE u.username = '" & username & "' AND u.password = '" & password & "'"

Set rs = conn.Execute(sql)

If Not rs.EOF Then
  ' Gerar sessionId (exemplo simplificado)
  sessionId = CreateGUID()
  
  ' Salvar sessão no banco...
  
  ' ✅ MONTAR RESPOSTA COM TODOS OS CAMPOS
  response = "{" & _
    """success"": true," & _
    """data"": {" & _
      """sessionId"": """ & sessionId & """," & _
      """salonId"": """ & rs("salonId") & """," & _
      """userName"": """ & rs("userName") & """," & _
      """userId"": """ & rs("userId") & """," & _
      """slug"": """ & rs("slug") & """" & _
    "}" & _
  "}"
Else
  ' Login falhou
  response = "{""success"": false, ""error"": ""Credenciais inválidas""}"
End If

' Retornar JSON
Response.ContentType = "application/json"
Response.Write response

rs.Close
conn.Close
Set rs = Nothing
Set conn = Nothing
```

---

## 🗄️ Estrutura do Banco de Dados

Certifique-se de que as tabelas possuem essa estrutura:

### Tabela `users` (ou `professionals`)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  salonId INT,
  name VARCHAR(255),
  username VARCHAR(100),
  password VARCHAR(255),
  ...
)
```

### Tabela `salons`
```sql
CREATE TABLE salons (
  id INT PRIMARY KEY,
  slug VARCHAR(100) UNIQUE,  -- ⚠️ Campo essencial
  name VARCHAR(255),
  ...
)
```

---

## 🧪 Como Testar

### 1. Teste de Login
1. Fazer login no sistema
2. Abrir **DevTools** do navegador (F12)
3. Verificar **sessionStorage**:
   - Ir em **Application** → **Session Storage**
   - Procurar chave: `salon_admin_session`
   - Verificar conteúdo:
   ```json
   {
     "sessionId": "...",
     "salonId": "...",
     "userName": "...",
     "userId": "...",  // ⚠️ Deve ter valor
     "slug": "..."     // ⚠️ Deve ter valor
   }
   ```

### 2. Teste de Cadastro de Feriado
1. Após login, ir em **Configurações do Salão**
2. Adicionar um feriado municipal
3. Abrir **DevTools** → **Network**
4. Verificar requisição `admin_setadmmunicipalidays.asp`
5. Ver **Payload** enviado:
   ```json
   {
     "name": "Natal",
     "date": "2025-12-25",
     "userId": "456",                    // ⚠️ Deve ter valor
     "salonId": "1",
     "slug": "joao-silva-cabeleireiro"   // ⚠️ Deve ter valor
   }
   ```

---

## ✅ Checklist de Implementação

- [ ] Adicionar campo `userId` na query SQL do login
- [ ] Adicionar campo `slug` na query SQL (fazer JOIN com tabela `salons`)
- [ ] Atualizar resposta JSON do `admin_authlogin.asp`
- [ ] Testar login e verificar `sessionStorage`
- [ ] Testar cadastro de feriado e verificar payload
- [ ] Testar cadastro de data bloqueada e verificar payload
- [ ] Verificar se dados estão sendo salvos corretamente no banco

---

## 📌 Impacto

### Funcionalidades Afetadas
✅ **Frontend** (já corrigido):
- `Login.tsx` - atualizado para receber `userId` e `slug`
- `sessionManager` - métodos `getUserId()` e `getSlug()` prontos
- Todas as telas de cadastro preparadas

⚠️ **Backend** (PENDENTE):
- `admin_authlogin.asp` - precisa retornar `userId` e `slug`

### Por que é importante?
1. **Filtro por profissional**: Permite que cada profissional veja apenas seus dados
2. **URLs amigáveis**: O slug é usado para gerar URLs personalizadas do salão
3. **Auditoria**: Registra quem criou cada registro
4. **Segurança**: Impede que um profissional acesse dados de outro

---

## 📞 Dúvidas?

Consulte os arquivos do projeto:
- `src/lib/session.ts` - Gerenciamento de sessão
- `src/pages/Login.tsx` - Implementação do login no frontend
- `src/pages/SalonManagement.tsx` - Exemplo de uso dos dados

---

**Última atualização:** 16/11/2025
