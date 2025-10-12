# Fluxo de Autenticação e Envio de Parâmetros

## 📋 Fluxo Completo do Sistema

### 1️⃣ TELA DE LOGIN (`/login`)

**Arquivo:** `src/pages/Login.tsx`

#### Requisição de Login:
```
POST /api/admin_authlogin.asp
Content-Type: application/json

Body:
{
  "username": "usuario_digitado",
  "password": "senha_digitada"
}
```

#### Resposta Esperada do Backend:
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123xyz789",
    "salonId": "1",           // ⚠️ CRÍTICO: Backend DEVE retornar este campo!
    "userName": "Nome do Usuário"
  }
}
```

**⚠️ ATENÇÃO:** O backend ASP **DEVE** retornar o campo `salonId` no objeto `data`. Este é o ID do salão que o usuário administra e será usado em TODAS as chamadas subsequentes.

#### O que acontece após login bem-sucedido:

1. O frontend armazena os dados no `sessionStorage`:
```javascript
sessionStorage.setItem('salon_admin_session', JSON.stringify({
  sessionId: "abc123xyz789",
  salonId: "1",              // Salvo aqui para uso posterior
  userName: "Nome do Usuário"
}));
```

2. Redireciona para `/dashboard`

---

### 2️⃣ APÓS O LOGIN - DASHBOARD (`/dashboard`)

**Arquivo:** `src/pages/Dashboard.tsx`

Quando a página Dashboard carrega, ela **automaticamente** faz 4 chamadas de API:

#### API 1: Buscar Profissionais
```
GET /api/admin_getadmprofessionals.asp?salonId=1
```

#### API 2: Buscar Serviços
```
GET /api/admin_getadmservices.asp?salonId=1
```

#### API 3: Buscar Agendamentos de Hoje
```
GET /api/admin_getadmappointmentstoday.asp?salonId=1
```

#### API 4: Buscar Clientes
```
GET /api/admin_getadmclients.asp?salonId=1
```

**🔑 O `salonId=1` é injetado AUTOMATICAMENTE** pelo sistema em `src/lib/api.ts`.

---

### 3️⃣ COMO FUNCIONA A INJEÇÃO AUTOMÁTICA DO `salonId`

**Arquivo:** `src/lib/api.ts`

```javascript
export const apiCall = async (endpoint, data, method, includeSalonId = true) => {
  // 1. Busca o salonId armazenado no sessionStorage
  const salonId = sessionManager.getSalonId(); // Retorna "1"
  
  // 2. Se includeSalonId = true, adiciona aos parâmetros
  if (includeSalonId && salonId) {
    finalData = { ...data, salonId }; // Adiciona salonId=1
  }
  
  // 3. Para GET: adiciona na URL como query string
  // /api/admin_getadmprofessionals.asp?salonId=1
  
  // 4. Para POST: adiciona no body JSON
  // Body: { "nome": "João", "salonId": "1" }
}
```

---

## 📊 Tabela de APIs e Parâmetros

### APIs de Autenticação (SEM salonId)

| API | Método | Parâmetros de Entrada | salonId? |
|-----|--------|----------------------|----------|
| `admin_authlogin.asp` | POST | `username`, `password` | ❌ NÃO |
| `admin_authforgotpassword.asp` | POST | `email` | ❌ NÃO |
| `admin_authverify2fa.asp` | POST | `code`, `sessionId` | ❌ NÃO |
| `admin_authlogout.asp` | POST | - | ❌ NÃO |

**Retorno esperado do login:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "salonId": "string",    // ⚠️ OBRIGATÓRIO
    "userName": "string"
  }
}
```

---

### APIs de Gestão (COM salonId automático)

| API | Método | Parâmetros Enviados | salonId Injetado? |
|-----|--------|---------------------|-------------------|
| `admin_getadmprofessionals.asp` | GET | - | ✅ SIM (query) |
| `admin_setadmprofessionals.asp` | POST | `id`, `name`, `email`, `phone`, `photo`, `services`, `workingHours`, `isActive` | ✅ SIM (body) |
| `admin_deleteadmprofessional.asp` | POST | `id` | ✅ SIM (body) |
| `admin_getadmservices.asp` | GET | - | ✅ SIM (query) |
| `admin_setadmservices.asp` | POST | `id`, `name`, `description`, `duration`, `price`, `isActive` | ✅ SIM (body) |
| `admin_deleteadmservice.asp` | POST | `id` | ✅ SIM (body) |
| `admin_getadmappointments.asp` | GET | - | ✅ SIM (query) |
| `admin_getadmappointmentstoday.asp` | GET | - | ✅ SIM (query) |
| `admin_getadmappointmentsbydate.asp` | GET | `date` | ✅ SIM (query) |
| `admin_setadmappointments.asp` | POST | `id`, `clientName`, `clientPhone`, `professionalId`, `serviceId`, `date`, `time`, `status` | ✅ SIM (body) |
| `admin_getadmclients.asp` | GET | - | ✅ SIM (query) |
| `admin_getadmfixedclients.asp` | GET | - | ✅ SIM (query) |
| `admin_setadmfixedclients.asp` | POST | `clientId`, `professionalId`, `serviceId`, `dayOfWeek`, `time` | ✅ SIM (body) |
| `admin_getadmchurnedclients.asp` | GET | - | ✅ SIM (query) |
| `admin_sendclientreminder.asp` | POST | `clientId`, `message` | ✅ SIM (body) |
| `admin_sendclientbroadcast.asp` | POST | `clientIds[]`, `message` | ✅ SIM (body) |
| `admin_getsadmalon.asp` | GET | - | ✅ SIM (query) |
| `admin_setsadmalon.asp` | POST | `name`, `address`, `phone`, `email`, `logo`, `theme` | ✅ SIM (body) |
| `admin_getadmthemes.asp` | GET | - | ❌ NÃO |
| `admin_getadmsettings.asp` | GET | - | ✅ SIM (query) |
| `admin_setadmsettings.asp` | POST | configurações diversas | ✅ SIM (body) |
| `admin_getadmconfirmation.asp` | GET | - | ✅ SIM (query) |
| `admin_setadmconfirmation.asp` | POST | `confirmationText`, `reminderText` | ✅ SIM (body) |
| `admin_getadmdates.asp` | GET | - | ✅ SIM (query) |
| `admin_setadmdates.asp` | POST | `blockedDates[]` | ✅ SIM (body) |
| `admin_getadmtimes.asp` | GET | `date`, `professionalId`, `serviceId` | ✅ SIM (query) |
| `admin_setadmtimes.asp` | POST | `professionalId`, `workingHours` | ✅ SIM (body) |
| `admin_getadmmunicipalidays.asp` | GET | - | ✅ SIM (query) |
| `admin_setadmmunicipalidays.asp` | POST | `date`, `name` | ✅ SIM (body) |
| `admin_getadmblockeddates.asp` | GET | - | ✅ SIM (query) |
| `admin_setadmblockeddates.asp` | POST | `date`, `reason` | ✅ SIM (body) |

---

## 🔍 Verificação do Problema

### Checklist para o Backend ASP:

- [ ] **1. API de Login retorna `salonId`?**
  
  No arquivo `admin_authlogin.asp`, verificar se o JSON de retorno inclui:
  ```asp
  Response.Write("{""success"":true,""data"":{""sessionId"":""" & sessionId & """,""salonId"":""" & salonId & """,""userName"":""" & userName & """}}")
  ```

- [ ] **2. O `salonId` está sendo buscado do banco?**
  
  A query SQL deve buscar o salon_id do usuário:
  ```sql
  SELECT u.id, u.username, u.salon_id, s.name as salon_name
  FROM users u
  INNER JOIN salon_info s ON u.salon_id = s.id
  WHERE u.username = ? AND u.password = ?
  ```

- [ ] **3. Todas as outras APIs recebem e usam o `salonId`?**
  
  Exemplo em `admin_getadmprofessionals.asp`:
  ```asp
  ' Receber o parâmetro salonId da query string
  Dim salonId
  salonId = Request.QueryString("salonId")
  
  ' Validar
  If salonId = "" Then
    Response.Write("{""success"":false,""error"":""salonId obrigatório""}")
    Response.End
  End If
  
  ' Usar na query SQL
  sql = "SELECT * FROM professionals WHERE salon_id = ? AND is_active = 1"
  ```

---

## 🎯 Resumo do Fluxo

```
1. Usuário faz LOGIN
   ↓
2. Backend retorna: sessionId + salonId + userName
   ↓
3. Frontend armazena no sessionStorage
   ↓
4. Usuário navega para DASHBOARD
   ↓
5. Dashboard faz 4 chamadas de API
   ↓
6. api.ts automaticamente injeta salonId em cada chamada
   ↓
7. Backend recebe salonId e filtra dados pelo salão correto
```

---

## ⚠️ PROBLEMAS COMUNS

### Problema 1: "salonId não está sendo enviado"
**Causa:** Backend não retornou salonId no login
**Solução:** Verificar response de `admin_authlogin.asp`

### Problema 2: "APIs retornam dados de todos os salões"
**Causa:** Backend não está filtrando por salonId
**Solução:** Adicionar `WHERE salon_id = ?` em todas as queries

### Problema 3: "salonId é null ou undefined"
**Causa:** sessionStorage foi limpo ou não foi salvo
**Solução:** Verificar se login está salvando corretamente

---

## 🛠️ Como Testar

### 1. Teste o Login no Console do Navegador:

Após fazer login, abra o Console (F12) e digite:
```javascript
JSON.parse(sessionStorage.getItem('salon_admin_session'))
```

**Resultado esperado:**
```javascript
{
  sessionId: "abc123xyz789",
  salonId: "1",           // ⚠️ Deve estar presente!
  userName: "Nome do Usuário"
}
```

### 2. Monitore as requisições de API:

Na aba Network (Rede) do navegador, veja as requisições GET:
```
/api/admin_getadmprofessionals.asp?salonId=1
```

Se aparecer apenas:
```
/api/admin_getadmprofessionals.asp
```

O problema está em: **salonId não foi salvo na sessão** (problema no login).

---

## 📝 Exemplo de Implementação ASP para Login

```asp
<%@ Language=VBScript %>
<%
Response.ContentType = "application/json"
Response.AddHeader "Access-Control-Allow-Origin", "*"
Response.AddHeader "Access-Control-Allow-Methods", "GET, POST, OPTIONS"
Response.AddHeader "Access-Control-Allow-Headers", "Content-Type"

If Request.ServerVariables("REQUEST_METHOD") = "OPTIONS" Then
    Response.End
End If

' Ler JSON do body
Dim jsonBody, username, password
Set jsonBody = JSON.Parse(Request.Form)
username = jsonBody("username")
password = jsonBody("password")

' Conectar ao banco
Set conn = Server.CreateObject("ADODB.Connection")
conn.Open "CONNECTION_STRING_HERE"

' Query parametrizada
Set cmd = Server.CreateObject("ADODB.Command")
cmd.ActiveConnection = conn
cmd.CommandText = "SELECT u.id, u.username, u.salon_id, s.name as salon_name FROM users u INNER JOIN salon_info s ON u.salon_id = s.id WHERE u.username = ? AND u.password_hash = ?"
cmd.CommandType = 1

cmd.Parameters.Append cmd.CreateParameter("username", 200, 1, 255, username)
cmd.Parameters.Append cmd.CreateParameter("password", 200, 1, 255, HashPassword(password))

Set rs = cmd.Execute

If Not rs.EOF Then
    Dim sessionId, salonId, userName
    sessionId = GenerateSessionId()
    salonId = rs("salon_id")
    userName = rs("salon_name")
    
    ' Salvar sessão no banco
    SaveSession sessionId, rs("id"), salonId
    
    ' ⚠️ RETORNAR O salonId NO JSON
    Response.Write "{""success"":true,""data"":{""sessionId"":""" & sessionId & """,""salonId"":""" & salonId & """,""userName"":""" & userName & """}}"
Else
    Response.Write "{""success"":false,""error"":""Usuário ou senha inválidos""}"
End If

rs.Close
conn.Close
%>
```

---

## 📞 Suporte

Se após implementar o retorno do `salonId` no login o problema persistir:
1. Verifique o Console do navegador (F12 → Console)
2. Verifique a aba Network (F12 → Network)
3. Confirme que sessionStorage tem o salonId
4. Teste uma API específica com o salonId manualmente
