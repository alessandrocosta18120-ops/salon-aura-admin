# 🔐 Guia de Segurança para Backend ASP Classic

## ⚠️ ATENÇÃO: IMPLEMENTAÇÃO OBRIGATÓRIA

Este guia contém as implementações **OBRIGATÓRIAS** de segurança no backend ASP Classic para prevenir ataques de **SQL Injection**, **XSS**, e outras vulnerabilidades críticas.

---

## 1. 🛡️ PROTEÇÃO CONTRA SQL INJECTION (CRÍTICO)

### ❌ CÓDIGO VULNERÁVEL (NUNCA USAR):
```asp
<%
' VULNERÁVEL A SQL INJECTION - NÃO USAR!
Dim nome
nome = Request.Form("nome")
sql = "SELECT * FROM usuarios WHERE nome = '" & nome & "'"
Set rs = conn.Execute(sql)
%>
```

**Por que é perigoso?**
Se o usuário enviar: `'; DROP TABLE usuarios; --`
A query executada será: `SELECT * FROM usuarios WHERE nome = ''; DROP TABLE usuarios; --'`

### ✅ CÓDIGO SEGURO (USAR SEMPRE):

#### Opção 1: Command Object com Parâmetros (RECOMENDADO)
```asp
<%
Function ExecuteSecureQuery(conn, sql, params)
    Set cmd = Server.CreateObject("ADODB.Command")
    Set cmd.ActiveConnection = conn
    cmd.CommandText = sql
    cmd.Prepared = True
    
    ' Adicionar parâmetros
    If IsArray(params) Then
        For i = 0 To UBound(params)
            cmd.Parameters.Append params(i)
        Next
    End If
    
    Set ExecuteSecureQuery = cmd.Execute
End Function

' Helper para criar parâmetros
Function CreateParam(name, dataType, size, value)
    Set param = Server.CreateObject("ADODB.Parameter")
    param.Name = name
    param.Type = dataType
    param.Size = size
    param.Value = value
    param.Direction = 1 ' adParamInput
    Set CreateParam = param
End Function

' Uso seguro:
Dim nome, params(0)
nome = Request.Form("nome")

Set params(0) = CreateParam("@nome", 200, 100, nome) ' 200 = adVarWChar
Set rs = ExecuteSecureQuery(conn, "SELECT * FROM usuarios WHERE nome = ?", params)
%>
```

#### Opção 2: Stored Procedures
```asp
<%
Set cmd = Server.CreateObject("ADODB.Command")
cmd.ActiveConnection = conn
cmd.CommandType = 4 ' adCmdStoredProc
cmd.CommandText = "sp_GetUsuario"

cmd.Parameters.Append cmd.CreateParameter("@nome", 200, 1, 100, Request.Form("nome"))
Set rs = cmd.Execute
%>
```

---

## 2. 🧹 SANITIZAÇÃO E VALIDAÇÃO DE ENTRADA

### Função de Sanitização Universal
```asp
<%
' Sanitizar entrada removendo caracteres perigosos
Function SanitizeInput(input, inputType)
    If IsNull(input) Or input = "" Then
        SanitizeInput = ""
        Exit Function
    End If
    
    Dim cleaned
    cleaned = Trim(input)
    
    Select Case inputType
        Case "text"
            ' Remove caracteres especiais SQL
            cleaned = Replace(cleaned, "'", "''") ' Escape aspas simples
            cleaned = Replace(cleaned, ";", "") ' Remove ponto e vírgula
            cleaned = Replace(cleaned, "--", "") ' Remove comentários SQL
            cleaned = Replace(cleaned, "/*", "")
            cleaned = Replace(cleaned, "*/", "")
            
        Case "html"
            ' Escape HTML para prevenir XSS
            cleaned = Server.HTMLEncode(cleaned)
            
        Case "number"
            ' Validar que é número
            If Not IsNumeric(cleaned) Then
                cleaned = "0"
            End If
            
        Case "email"
            ' Validação básica de email
            If Not InStr(cleaned, "@") > 0 Or Not InStr(cleaned, ".") > 0 Then
                cleaned = ""
            End If
            
        Case "phone"
            ' Apenas números, parênteses e traços
            Dim regex
            Set regex = New RegExp
            regex.Pattern = "[^0-9()\-\s]"
            regex.Global = True
            cleaned = regex.Replace(cleaned, "")
    End Select
    
    SanitizeInput = cleaned
End Function

' Uso:
nome = SanitizeInput(Request.Form("nome"), "text")
email = SanitizeInput(Request.Form("email"), "email")
preco = SanitizeInput(Request.Form("preco"), "number")
%>
```

### Validação de Tamanho e Formato
```asp
<%
Function ValidateInput(value, fieldName, rules)
    Dim errors
    errors = ""
    
    ' Verificar obrigatoriedade
    If rules.required And (IsNull(value) Or value = "") Then
        errors = errors & fieldName & " é obrigatório. "
    End If
    
    ' Verificar tamanho mínimo
    If Not IsNull(value) And value <> "" Then
        If rules.minLength > 0 And Len(value) < rules.minLength Then
            errors = errors & fieldName & " deve ter no mínimo " & rules.minLength & " caracteres. "
        End If
        
        ' Verificar tamanho máximo
        If rules.maxLength > 0 And Len(value) > rules.maxLength Then
            errors = errors & fieldName & " deve ter no máximo " & rules.maxLength & " caracteres. "
        End If
        
        ' Verificar padrão regex (se suportado)
        If rules.pattern <> "" Then
            Set regex = New RegExp
            regex.Pattern = rules.pattern
            If Not regex.Test(value) Then
                errors = errors & fieldName & " está em formato inválido. "
            End If
        End If
    End If
    
    ValidateInput = errors
End Function

' Uso:
Set rules = Server.CreateObject("Scripting.Dictionary")
rules("required") = True
rules("minLength") = 3
rules("maxLength") = 100
rules("pattern") = "^[a-zA-Z0-9\s]+$"

errors = ValidateInput(Request.Form("nome"), "Nome", rules)
If errors <> "" Then
    Response.Write "{""success"": false, ""error"": """ & errors & """}"
    Response.End
End If
%>
```

---

## 3. 🔒 SANITIZAÇÃO DE HTML (Anti-XSS)

```asp
<%
Function SanitizeHTML(htmlString)
    If IsNull(htmlString) Or htmlString = "" Then
        SanitizeHTML = ""
        Exit Function
    End If
    
    Dim cleaned
    cleaned = htmlString
    
    ' Lista de tags perigosas
    Dim dangerousTags
    dangerousTags = Array("script", "iframe", "object", "embed", "applet", "meta", "link", "style")
    
    ' Remover tags perigosas
    Dim i, tag
    For i = 0 To UBound(dangerousTags)
        tag = dangerousTags(i)
        
        ' Remover tag de abertura
        Set regex = New RegExp
        regex.Pattern = "<" & tag & "(\s[^>]*)?>"
        regex.IgnoreCase = True
        regex.Global = True
        cleaned = regex.Replace(cleaned, "")
        
        ' Remover tag de fechamento
        regex.Pattern = "</" & tag & ">"
        cleaned = regex.Replace(cleaned, "")
    Next
    
    ' Remover atributos perigosos
    Set regex = New RegExp
    regex.Pattern = "on\w+\s*=\s*[""'][^""']*[""']"
    regex.IgnoreCase = True
    regex.Global = True
    cleaned = regex.Replace(cleaned, "")
    
    ' Remover javascript: protocol
    regex.Pattern = "javascript:"
    regex.IgnoreCase = True
    regex.Global = True
    cleaned = regex.Replace(cleaned, "")
    
    SanitizeHTML = cleaned
End Function

' Uso:
descricao = SanitizeHTML(Request.Form("descricao"))
%>
```

---

## 4. 🚦 RATE LIMITING (Proteção contra Força Bruta)

```asp
<%
Function CheckRateLimit(identifier, action, maxAttempts, windowMinutes)
    Dim cacheKey, attempts, firstAttempt, now
    now = Now()
    cacheKey = "rate_" & action & "_" & identifier
    
    ' Recuperar tentativas do Application cache
    attempts = Application(cacheKey & "_count")
    firstAttempt = Application(cacheKey & "_time")
    
    ' Inicializar se não existir
    If IsNull(attempts) Or attempts = "" Then
        attempts = 0
        firstAttempt = now
    End If
    
    ' Verificar se a janela expirou
    If DateDiff("n", CDate(firstAttempt), now) > windowMinutes Then
        ' Resetar contador
        Application(cacheKey & "_count") = 1
        Application(cacheKey & "_time") = now
        CheckRateLimit = True
        Exit Function
    End If
    
    ' Verificar se excedeu limite
    If CInt(attempts) >= maxAttempts Then
        CheckRateLimit = False
        Exit Function
    End If
    
    ' Incrementar contador
    Application.Lock
    Application(cacheKey & "_count") = CInt(attempts) + 1
    Application.Unlock
    
    CheckRateLimit = True
End Function

' Uso no login:
Dim userIP, isAllowed
userIP = Request.ServerVariables("REMOTE_ADDR")
isAllowed = CheckRateLimit(userIP, "login", 5, 15) ' 5 tentativas em 15 minutos

If Not isAllowed Then
    Response.Write "{""success"": false, ""error"": ""Muitas tentativas. Tente novamente em 15 minutos.""}"
    Response.End
End If
%>
```

---

## 5. 🔑 AUTENTICAÇÃO SEGURA

### Hash de Senha (Conceitual - Requer biblioteca externa)
```asp
<%
' NOTA: ASP Classic não tem bcrypt nativo
' Opções:
' 1. Usar componente COM (ex: AspEncrypt, chilkat)
' 2. Usar Web Service externo para hash
' 3. Usar SHA256 + salt (mínimo aceitável)

Function HashPassword(password, salt)
    ' Exemplo usando SHA256 (requer componente)
    Set hasher = Server.CreateObject("Your.HashComponent")
    hasher.Algorithm = "SHA256"
    hasher.Hash = password & salt
    HashPassword = hasher.GetHash()
End Function

Function GenerateSalt()
    ' Gerar salt aleatório
    Dim i, chars, salt
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    salt = ""
    For i = 1 To 32
        Randomize
        salt = salt & Mid(chars, Int((Len(chars) * Rnd) + 1), 1)
    Next
    GenerateSalt = salt
End Function

' Cadastro de usuário:
Dim password, salt, hashedPassword
password = Request.Form("password")
salt = GenerateSalt()
hashedPassword = HashPassword(password, salt)

' Salvar hashedPassword e salt no banco
' NUNCA salvar senha em texto plano
%>
```

### Validação de Sessão
```asp
<%
Function ValidateSession()
    If Session("IsAuthenticated") <> True Then
        ValidateSession = False
        Exit Function
    End If
    
    ' Verificar timeout de inatividade (30 minutos)
    If IsNull(Session("LastActivity")) Or Session("LastActivity") = "" Then
        Session.Abandon
        ValidateSession = False
        Exit Function
    End If
    
    If DateDiff("n", CDate(Session("LastActivity")), Now()) > 30 Then
        Session.Abandon
        ValidateSession = False
        Exit Function
    End If
    
    ' Atualizar última atividade
    Session("LastActivity") = Now()
    ValidateSession = True
End Function

' Uso em cada página protegida:
If Not ValidateSession() Then
    Response.Write "{""success"": false, ""error"": ""Sessão expirada""}"
    Response.End
End If
%>
```

---

## 6. 📤 VALIDAÇÃO DE UPLOAD DE ARQUIVOS

```asp
<%
Function ValidateFileUpload(fileField)
    Dim file, errors
    Set errors = Server.CreateObject("Scripting.Dictionary")
    
    If Request.TotalBytes = 0 Then
        errors("error") = "Nenhum arquivo enviado"
        Set ValidateFileUpload = errors
        Exit Function
    End If
    
    ' Obter arquivo do upload (exemplo usando componente)
    Set file = fileField
    
    ' Validar tamanho (5MB = 5242880 bytes)
    If file.Length > 5242880 Then
        errors("error") = "Arquivo muito grande. Máximo: 5MB"
        Set ValidateFileUpload = errors
        Exit Function
    End If
    
    ' Validar extensão
    Dim fileName, ext, allowedExts
    fileName = LCase(file.FileName)
    ext = Right(fileName, 4)
    allowedExts = Array(".jpg", ".jpeg", ".png", ".gif")
    
    Dim isValid, i
    isValid = False
    For i = 0 To UBound(allowedExts)
        If ext = allowedExts(i) Or Right(ext, 5) = ".jpeg" Then
            isValid = True
            Exit For
        End If
    Next
    
    If Not isValid Then
        errors("error") = "Tipo de arquivo não permitido. Use JPG, PNG ou GIF"
        Set ValidateFileUpload = errors
        Exit Function
    End If
    
    ' Validar tipo MIME
    Dim mimeType
    mimeType = LCase(file.ContentType)
    If InStr(mimeType, "image/") <> 1 Then
        errors("error") = "Arquivo não é uma imagem válida"
        Set ValidateFileUpload = errors
        Exit Function
    End If
    
    errors("valid") = True
    Set ValidateFileUpload = errors
End Function
%>
```

---

## 7. 🛡️ HEADERS DE SEGURANÇA

### Arquivo de Configuração Global (include.asp)
```asp
<%
' Headers de segurança - incluir em todas as páginas
Sub SetSecurityHeaders()
    Response.AddHeader "X-Frame-Options", "DENY"
    Response.AddHeader "X-Content-Type-Options", "nosniff"
    Response.AddHeader "X-XSS-Protection", "1; mode=block"
    Response.AddHeader "Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    Response.AddHeader "Referrer-Policy", "strict-origin-when-cross-origin"
    
    ' HTTPS obrigatório (Strict-Transport-Security)
    If Request.ServerVariables("HTTPS") = "on" Then
        Response.AddHeader "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
    End If
End Sub

' CORS seguro - permitir apenas seu domínio
Sub SetCORSHeaders(allowedOrigin)
    Dim origin
    origin = Request.ServerVariables("HTTP_ORIGIN")
    
    If origin = allowedOrigin Then
        Response.AddHeader "Access-Control-Allow-Origin", origin
        Response.AddHeader "Access-Control-Allow-Credentials", "true"
        Response.AddHeader "Access-Control-Allow-Methods", "GET, POST, OPTIONS"
        Response.AddHeader "Access-Control-Allow-Headers", "Content-Type, Authorization"
        Response.AddHeader "Access-Control-Max-Age", "86400" ' 24 horas
    End If
    
    ' Responder a preflight requests
    If Request.ServerVariables("REQUEST_METHOD") = "OPTIONS" Then
        Response.Status = "204 No Content"
        Response.End
    End If
End Sub

' Uso em cada API:
Call SetSecurityHeaders()
Call SetCORSHeaders("https://seudominio.com")
Response.ContentType = "application/json"
Response.Charset = "utf-8"
%>
```

---

## 8. 📝 LOG DE AUDITORIA

```asp
<%
Sub LogActivity(userId, action, details)
    Dim sql, params(3)
    
    sql = "INSERT INTO audit_log (user_id, action, details, ip_address, user_agent, created_at) " & _
          "VALUES (?, ?, ?, ?, ?, ?)"
    
    Set params(0) = CreateParam("@userId", 200, 50, userId)
    Set params(1) = CreateParam("@action", 200, 100, action)
    Set params(2) = CreateParam("@details", 201, 1000, details) ' 201 = adLongVarWChar
    Set params(3) = CreateParam("@ipAddress", 200, 50, Request.ServerVariables("REMOTE_ADDR"))
    Set params(4) = CreateParam("@userAgent", 200, 255, Request.ServerVariables("HTTP_USER_AGENT"))
    Set params(5) = CreateParam("@createdAt", 135, 8, Now()) ' 135 = adDBTimeStamp
    
    Call ExecuteSecureQuery(conn, sql, params)
End Sub

' Uso:
Call LogActivity(Session("UserId"), "LOGIN", "Usuário fez login com sucesso")
Call LogActivity(Session("UserId"), "UPDATE_SERVICE", "Atualizou serviço ID: " & serviceId)
Call LogActivity(Session("UserId"), "DELETE_PROFESSIONAL", "Removeu profissional ID: " & profId)
%>
```

---

## 9. ✅ EXEMPLO COMPLETO DE API SEGURA

```asp
<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!-- #include file="includes/security.asp" -->
<!-- #include file="includes/database.asp" -->
<%
' ========================================
' API: admin_setadmservices.asp
' Descrição: Criar/Atualizar serviço
' ========================================

' Headers de segurança
Call SetSecurityHeaders()
Call SetCORSHeaders("https://seudominio.com")
Response.ContentType = "application/json"
Response.Charset = "utf-8"

' Validar sessão
If Not ValidateSession() Then
    Response.Write "{""success"": false, ""error"": ""Não autorizado""}"
    Response.End
End If

' Verificar método HTTP
If Request.ServerVariables("REQUEST_METHOD") <> "POST" Then
    Response.Status = "405 Method Not Allowed"
    Response.Write "{""success"": false, ""error"": ""Método não permitido""}"
    Response.End
End If

' Ler e parsear JSON
Dim jsonString, jsonObj
jsonString = Request.BinaryRead(Request.TotalBytes)
jsonString = BytesToStr(jsonString) ' Função helper para converter bytes

' Parse JSON (requer componente JSON ou implementação manual)
Set jsonObj = ParseJSON(jsonString)

' Validar e sanitizar entradas
Dim serviceName, description, duration, price, professionalIds, errors
serviceName = SanitizeInput(jsonObj("name"), "text")
description = SanitizeHTML(jsonObj("description"))
duration = SanitizeInput(jsonObj("duration"), "number")
price = SanitizeInput(jsonObj("price"), "number")
professionalIds = jsonObj("professionalIds") ' Array

' Validações
errors = ""
errors = errors & ValidateInput(serviceName, "Nome", CreateRules(True, 3, 100, "^[a-zA-Z0-9\s]+$"))
If CInt(duration) < 15 Or CInt(duration) > 480 Then
    errors = errors & "Duração inválida (15-480 min). "
End If
If CDbl(price) < 0 Or CDbl(price) > 100000 Then
    errors = errors & "Preço inválido (0-100000). "
End If

If errors <> "" Then
    Response.Write "{""success"": false, ""error"": """ & errors & """}"
    Response.End
End If

' Abrir conexão
Set conn = OpenDatabaseConnection()

' Preparar query com parâmetros
Dim sql, params
If jsonObj("id") <> "" Then
    ' UPDATE
    sql = "UPDATE services SET name = ?, description = ?, duration = ?, price = ?, updated_at = ? WHERE id = ?"
    ReDim params(5)
    Set params(0) = CreateParam("@name", 200, 100, serviceName)
    Set params(1) = CreateParam("@description", 201, 500, description)
    Set params(2) = CreateParam("@duration", 3, 4, CInt(duration)) ' 3 = adInteger
    Set params(3) = CreateParam("@price", 5, 8, CDbl(price)) ' 5 = adDouble
    Set params(4) = CreateParam("@updatedAt", 135, 8, Now())
    Set params(5) = CreateParam("@id", 200, 50, jsonObj("id"))
Else
    ' INSERT
    sql = "INSERT INTO services (id, name, description, duration, price, created_at) " & _
          "VALUES (?, ?, ?, ?, ?, ?)"
    ReDim params(5)
    Set params(0) = CreateParam("@id", 200, 50, GenerateUUID())
    Set params(1) = CreateParam("@name", 200, 100, serviceName)
    Set params(2) = CreateParam("@description", 201, 500, description)
    Set params(3) = CreateParam("@duration", 3, 4, CInt(duration))
    Set params(4) = CreateParam("@price", 5, 8, CDbl(price))
    Set params(5) = CreateParam("@createdAt", 135, 8, Now())
End If

' Executar query segura
On Error Resume Next
Call ExecuteSecureQuery(conn, sql, params)

If Err.Number <> 0 Then
    Response.Write "{""success"": false, ""error"": ""Erro ao salvar serviço""}"
    Call LogActivity(Session("UserId"), "ERROR", "Erro ao salvar serviço: " & Err.Description)
    Err.Clear
Else
    Response.Write "{""success"": true, ""message"": ""Serviço salvo com sucesso""}"
    Call LogActivity(Session("UserId"), "SAVE_SERVICE", "Serviço " & serviceName & " salvo")
End If

conn.Close
Set conn = Nothing
%>
```

---

## 10. 📋 CHECKLIST FINAL DE IMPLEMENTAÇÃO

### Para CADA endpoint de API:
- [ ] Usar parametrized queries (Command Object)
- [ ] Validar e sanitizar TODAS as entradas
- [ ] Verificar autenticação/sessão
- [ ] Aplicar rate limiting (especialmente login)
- [ ] Definir headers de segurança
- [ ] Configurar CORS corretamente
- [ ] Implementar log de auditoria
- [ ] Tratar erros adequadamente (sem expor detalhes)
- [ ] Validar tipo e tamanho de arquivos upload
- [ ] Usar HTTPS (certificado SSL válido)

### Banco de Dados:
- [ ] Usuário do banco com permissões mínimas
- [ ] Backup automático diário
- [ ] Banco em rede privada (não exposto)
- [ ] Senhas com hash (NUNCA em texto plano)

### Servidor:
- [ ] Firewall configurado
- [ ] IIS com configurações seguras
- [ ] Logs centralizados
- [ ] Monitoramento de segurança
- [ ] Atualizações de segurança aplicadas

---

## 🚨 AVISOS FINAIS

1. **NUNCA** concatenar strings para criar queries SQL
2. **SEMPRE** usar parâmetros em queries
3. **SEMPRE** validar e sanitizar entrada do usuário
4. **NUNCA** confiar em dados vindos do cliente
5. **SEMPRE** usar HTTPS em produção
6. **NUNCA** expor mensagens de erro detalhadas ao usuário
7. **SEMPRE** fazer log de ações sensíveis
8. **NUNCA** armazenar senhas em texto plano
9. **SEMPRE** implementar rate limiting no login
10. **NUNCA** desabilitar validação "porque está atrasado"

---

## 📚 RECURSOS ADICIONAIS

- [OWASP ASP Classic Security](https://owasp.org/www-community/vulnerabilities/SQL_Injection)
- [Microsoft Security Best Practices](https://docs.microsoft.com/en-us/previous-versions/iis/6.0-sdk/ms525396(v=vs.90))
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

---

**Desenvolvido para proteção máxima do sistema**
**Siga este guia rigorosamente para garantir a segurança dos dados**
