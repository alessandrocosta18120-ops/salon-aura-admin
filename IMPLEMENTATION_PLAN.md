# Plano de Implementação - Painel Administrativo para Salões de Beleza

## Visão Geral
Este documento detalha a implementação completa do sistema de gestão para salões de beleza e barbearias, incluindo as APIs em ASP Classic, estrutura de banco MySQL e medidas de segurança.

## Estrutura de Diretórios

```
├── admin/
│   └── api/
│       ├── login.asp
│       ├── getsadmalon.asp
│       ├── setsadmalon.asp
│       ├── getadmprofessionals.asp
│       ├── setadmprofessional.asp
│       ├── updateadmprofessional.asp
│       ├── getadmservices.asp
│       ├── setadmservice.asp
│       ├── updateadmservice.asp
│       ├── getadmsettings.asp
│       ├── setadmsettings.asp
│       ├── getadmthemes.asp
│       ├── getadmdates.asp
│       ├── getadmtimes.asp
│       ├── getadmappointments.asp
│       ├── sendtwofactor.asp
│       ├── validatetwofactor.asp
│       └── resetpassword.asp
```

## Estrutura do Banco de Dados MySQL

### 1. Tabela: users
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    two_factor_enabled BOOLEAN DEFAULT TRUE,
    two_factor_code VARCHAR(6),
    two_factor_expires DATETIME,
    failed_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Tabela: salon_info
```sql
CREATE TABLE salon_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    working_days VARCHAR(7) DEFAULT '1234567',
    open_time TIME DEFAULT '08:00:00',
    close_time TIME DEFAULT '18:00:00',
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
    instagram VARCHAR(100),
    facebook VARCHAR(100),
    youtube VARCHAR(100),
    tiktok VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    main_logo VARCHAR(255),
    secondary_logo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Tabela: professionals
```sql
CREATE TABLE professionals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    working_days VARCHAR(7) DEFAULT '12345',
    start_time TIME DEFAULT '08:00:00',
    end_time TIME DEFAULT '18:00:00',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4. Tabela: services
```sql
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    professional_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration INT NOT NULL, -- em minutos
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
);
```

### 5. Tabela: blocked_times
```sql
CREATE TABLE blocked_times (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    professional_id INT NOT NULL,
    blocked_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_type ENUM('weekly', 'monthly', 'yearly') NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
);
```

### 6. Tabela: system_settings
```sql
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    send_social_links BOOLEAN DEFAULT TRUE,
    confirmation_message TEXT DEFAULT 'Seu agendamento foi confirmado! Aguardamos você no salão.',
    two_factor_auth BOOLEAN DEFAULT TRUE,
    notification_method ENUM('email', 'whatsapp', 'both') DEFAULT 'both',
    min_cancel_days INT DEFAULT 1,
    allow_same_day_cancel BOOLEAN DEFAULT FALSE,
    cancel_message TEXT DEFAULT 'Agendamento cancelado. Entre em contato para reagendar.',
    whatsapp_api VARCHAR(255),
    email_provider VARCHAR(50) DEFAULT 'smtp',
    session_timeout INT DEFAULT 60,
    max_login_attempts INT DEFAULT 3,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    date_format VARCHAR(20) DEFAULT 'dd/MM/yyyy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Exemplos de APIs em ASP Classic

### 1. login.asp
```asp
<%
Option Explicit
Response.ContentType = "application/json; charset=utf-8"
Response.AddHeader "Access-Control-Allow-Origin", "*"
Response.AddHeader "Access-Control-Allow-Methods", "POST, GET, OPTIONS"
Response.AddHeader "Access-Control-Allow-Headers", "Content-Type"

Dim conn, sql, rs, username, password, hashedPassword
Dim userId, isLocked, failedAttempts, lockUntil
Dim jsonResponse

' Configuração da conexão MySQL
Set conn = Server.CreateObject("ADODB.Connection")
conn.Open "DRIVER={MySQL ODBC 8.0 Driver};SERVER=localhost;DATABASE=salon_db;UID=username;PWD=password;"

' Receber dados JSON
Function ReadPostData()
    Dim postData, objStream
    Set objStream = Server.CreateObject("ADODB.Stream")
    objStream.Mode = 3
    objStream.Type = 1
    objStream.Open
    objStream.Write Request.BinaryRead(Request.TotalBytes)
    objStream.Position = 0
    objStream.Type = 2
    objStream.Charset = "utf-8"
    ReadPostData = objStream.ReadText
    objStream.Close
    Set objStream = Nothing
End Function

' Parse básico de JSON (simplificado)
Function ParseJSON(jsonText)
    Set ParseJSON = Server.CreateObject("Scripting.Dictionary")
    ' Implementar parser JSON ou usar biblioteca externa
End Function

If Request.ServerVariables("REQUEST_METHOD") = "POST" Then
    Dim postData, jsonData
    postData = ReadPostData()
    Set jsonData = ParseJSON(postData)
    
    username = jsonData("username")
    password = jsonData("password")
    
    ' Verificar tentativas de login
    sql = "SELECT id, password_hash, failed_attempts, locked_until FROM users WHERE username = ?"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 1, 3
    
    If Not rs.EOF Then
        userId = rs("id")
        hashedPassword = rs("password_hash")
        failedAttempts = rs("failed_attempts")
        lockUntil = rs("locked_until")
        
        ' Verificar se conta está bloqueada
        If Not IsNull(lockUntil) And lockUntil > Now() Then
            jsonResponse = "{""success"": false, ""message"": ""Conta temporariamente bloqueada""}"
        Else
            ' Verificar senha (implementar hash seguro)
            If VerifyPassword(password, hashedPassword) Then
                ' Login bem-sucedido
                sql = "UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = " & userId
                conn.Execute sql
                
                ' Gerar token de 2FA se habilitado
                Dim twoFactorCode
                twoFactorCode = GenerateRandomCode(6)
                sql = "UPDATE users SET two_factor_code = '" & twoFactorCode & "', two_factor_expires = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = " & userId
                conn.Execute sql
                
                ' Enviar código por email/WhatsApp
                SendTwoFactorCode userId, twoFactorCode
                
                jsonResponse = "{""success"": true, ""requires_2fa"": true, ""user_id"": " & userId & "}"
            Else
                ' Incrementar tentativas
                failedAttempts = failedAttempts + 1
                If failedAttempts >= 3 Then
                    sql = "UPDATE users SET failed_attempts = " & failedAttempts & ", locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = " & userId
                Else
                    sql = "UPDATE users SET failed_attempts = " & failedAttempts & " WHERE id = " & userId
                End If
                conn.Execute sql
                
                jsonResponse = "{""success"": false, ""message"": ""Credenciais inválidas""}"
            End If
        End If
    Else
        jsonResponse = "{""success"": false, ""message"": ""Usuário não encontrado""}"
    End If
    
    rs.Close
    Set rs = Nothing
Else
    jsonResponse = "{""success"": false, ""message"": ""Método não permitido""}"
End If

conn.Close
Set conn = Nothing

Response.Write jsonResponse

Function VerifyPassword(plainPassword, hashedPassword)
    ' Implementar verificação de hash segura (bcrypt, scrypt, etc.)
    ' Por enquanto, comparação simples (NÃO usar em produção)
    VerifyPassword = (plainPassword = hashedPassword)
End Function

Function GenerateRandomCode(length)
    Dim chars, result, i
    chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    result = ""
    Randomize
    For i = 1 To length
        result = result + Mid(chars, Int(Rnd() * Len(chars)) + 1, 1)
    Next
    GenerateRandomCode = result
End Function

Sub SendTwoFactorCode(userId, code)
    ' Implementar envio de código via email/WhatsApp
    ' Integrar com APIs de terceiros (SendGrid, Twilio, etc.)
End Sub
%>
```

### 2. getsadmalon.asp
```asp
<%
Option Explicit
Response.ContentType = "application/json; charset=utf-8"
Response.AddHeader "Access-Control-Allow-Origin", "*"

Dim conn, sql, rs, userId, jsonResponse

' Verificar autenticação
userId = ValidateUser()
If userId = 0 Then
    Response.Write "{""success"": false, ""message"": ""Não autorizado""}"
    Response.End
End If

Set conn = Server.CreateObject("ADODB.Connection")
conn.Open "DRIVER={MySQL ODBC 8.0 Driver};SERVER=localhost;DATABASE=salon_db;UID=username;PWD=password;"

sql = "SELECT * FROM salon_info WHERE user_id = " & userId
Set rs = Server.CreateObject("ADODB.Recordset")
rs.Open sql, conn

If Not rs.EOF Then
    jsonResponse = "{"
    jsonResponse = jsonResponse & """success"": true,"
    jsonResponse = jsonResponse & """data"": {"
    jsonResponse = jsonResponse & """name"": """ & EscapeJSON(rs("name")) & ""","
    jsonResponse = jsonResponse & """description"": """ & EscapeJSON(rs("description")) & ""","
    jsonResponse = jsonResponse & """address"": """ & EscapeJSON(rs("address")) & ""","
    jsonResponse = jsonResponse & """phone"": """ & EscapeJSON(rs("phone")) & ""","
    jsonResponse = jsonResponse & """working_days"": """ & rs("working_days") & ""","
    jsonResponse = jsonResponse & """open_time"": """ & rs("open_time") & ""","
    jsonResponse = jsonResponse & """close_time"": """ & rs("close_time") & ""","
    jsonResponse = jsonResponse & """primary_color"": """ & rs("primary_color") & ""","
    jsonResponse = jsonResponse & """secondary_color"": """ & rs("secondary_color") & ""","
    jsonResponse = jsonResponse & """instagram"": """ & EscapeJSON(rs("instagram")) & ""","
    jsonResponse = jsonResponse & """facebook"": """ & EscapeJSON(rs("facebook")) & ""","
    jsonResponse = jsonResponse & """youtube"": """ & EscapeJSON(rs("youtube")) & ""","
    jsonResponse = jsonResponse & """tiktok"": """ & EscapeJSON(rs("tiktok")) & ""","
    jsonResponse = jsonResponse & """latitude"": " & rs("latitude") & ","
    jsonResponse = jsonResponse & """longitude"": " & rs("longitude")
    jsonResponse = jsonResponse & "}}"
Else
    jsonResponse = "{""success"": false, ""message"": ""Dados não encontrados""}"
End If

rs.Close
Set rs = Nothing
conn.Close
Set conn = Nothing

Response.Write jsonResponse

Function ValidateUser()
    ' Implementar validação de token/sessão
    ' Por enquanto, retornar ID fixo para teste
    ValidateUser = 1
End Function

Function EscapeJSON(str)
    If IsNull(str) Then
        EscapeJSON = ""
    Else
        EscapeJSON = Replace(Replace(str, "\", "\\"), """", "\""")
    End If
End Function
%>
```

### 3. setsadmalon.asp
```asp
<%
Option Explicit
Response.ContentType = "application/json; charset=utf-8"
Response.AddHeader "Access-Control-Allow-Origin", "*"
Response.AddHeader "Access-Control-Allow-Methods", "POST, OPTIONS"

Dim conn, sql, userId, jsonResponse

userId = ValidateUser()
If userId = 0 Then
    Response.Write "{""success"": false, ""message"": ""Não autorizado""}"
    Response.End
End If

If Request.ServerVariables("REQUEST_METHOD") = "POST" Then
    Dim postData, jsonData
    postData = ReadPostData()
    Set jsonData = ParseJSON(postData)
    
    Set conn = Server.CreateObject("ADODB.Connection")
    conn.Open "DRIVER={MySQL ODBC 8.0 Driver};SERVER=localhost;DATABASE=salon_db;UID=username;PWD=password;"
    
    ' Verificar se já existe registro
    sql = "SELECT id FROM salon_info WHERE user_id = " & userId
    Dim rs
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn
    
    If rs.EOF Then
        ' Inserir novo registro
        sql = "INSERT INTO salon_info (user_id, name, description, address, phone, working_days, " & _
              "open_time, close_time, primary_color, secondary_color, instagram, facebook, " & _
              "youtube, tiktok, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    Else
        ' Atualizar registro existente
        sql = "UPDATE salon_info SET name=?, description=?, address=?, phone=?, working_days=?, " & _
              "open_time=?, close_time=?, primary_color=?, secondary_color=?, instagram=?, " & _
              "facebook=?, youtube=?, tiktok=?, latitude=?, longitude=?, updated_at=NOW() WHERE user_id=?"
    End If
    
    rs.Close
    Set rs = Nothing
    
    ' Executar comando com parâmetros preparados (proteção contra SQL Injection)
    Dim cmd
    Set cmd = Server.CreateObject("ADODB.Command")
    cmd.ActiveConnection = conn
    cmd.CommandText = sql
    cmd.CommandType = 1
    
    ' Adicionar parâmetros
    AddParameter cmd, jsonData("name"), 200
    AddParameter cmd, jsonData("description"), 201
    AddParameter cmd, jsonData("address"), 201
    AddParameter cmd, jsonData("phone"), 200
    AddParameter cmd, jsonData("working_days"), 200
    AddParameter cmd, jsonData("open_time"), 200
    AddParameter cmd, jsonData("close_time"), 200
    AddParameter cmd, jsonData("primary_color"), 200
    AddParameter cmd, jsonData("secondary_color"), 200
    AddParameter cmd, jsonData("instagram"), 200
    AddParameter cmd, jsonData("facebook"), 200
    AddParameter cmd, jsonData("youtube"), 200
    AddParameter cmd, jsonData("tiktok"), 200
    AddParameter cmd, jsonData("latitude"), 5
    AddParameter cmd, jsonData("longitude"), 5
    AddParameter cmd, userId, 3
    
    cmd.Execute
    
    jsonResponse = "{""success"": true, ""message"": ""Dados salvos com sucesso""}"
    
    conn.Close
    Set conn = Nothing
Else
    jsonResponse = "{""success"": false, ""message"": ""Método não permitido""}"
End If

Response.Write jsonResponse

Sub AddParameter(cmd, value, dataType)
    Dim param
    Set param = cmd.CreateParameter("", dataType, 1, 255, value)
    cmd.Parameters.Append param
End Sub

' Funções auxiliares (mesmo das anteriores)
Function ReadPostData()
    ' Implementação anterior
End Function

Function ParseJSON(jsonText)
    ' Implementação anterior
End Function

Function ValidateUser()
    ' Implementação anterior
End Function
%>
```

## Medidas de Segurança Implementadas

### 1. Prevenção contra SQL Injection
- **Prepared Statements**: Todas as queries devem usar parâmetros preparados
- **Validação de entrada**: Sanitizar todos os dados de entrada
- **Escape de caracteres**: Escapar caracteres especiais em strings

### 2. Autenticação Segura
- **Hash de senhas**: Usar algoritmos seguros (bcrypt, scrypt)
- **Autenticação 2FA**: Código de 6 dígitos via email/WhatsApp
- **Bloqueio por tentativas**: Bloquear conta após 3 tentativas inválidas
- **Timeout de sessão**: Expirar sessões após período de inatividade

### 3. Controle de Acesso
- **Validação de sessão**: Verificar token/sessão em todas as APIs
- **CORS configurado**: Controlar origins permitidas
- **Rate limiting**: Limitar número de requests por IP

### 4. Validação de Dados
```asp
Function ValidateInput(data, fieldType)
    Select Case fieldType
        Case "email"
            ' Validar formato de email
            ValidateInput = IsValidEmail(data)
        Case "phone"
            ' Validar formato de telefone
            ValidateInput = IsValidPhone(data)
        Case "color"
            ' Validar formato de cor hexadecimal
            ValidateInput = IsValidHexColor(data)
        Case "time"
            ' Validar formato de hora
            ValidateInput = IsValidTime(data)
        Case Else
            ' Validação genérica
            ValidateInput = (Len(data) > 0 And Len(data) <= 255)
    End Select
End Function
```

### 5. Logs de Segurança
```sql
CREATE TABLE security_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    ip_address VARCHAR(45),
    action VARCHAR(100),
    details TEXT,
    success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Lista Completa de APIs Necessárias

### Autenticação
- **login.asp**: Login com validação de credenciais
- **sendtwofactor.asp**: Enviar código 2FA
- **validatetwofactor.asp**: Validar código 2FA
- **resetpassword.asp**: Reset de senha via email

### Gestão do Salão
- **getsadmalon.asp**: Buscar informações do salão
- **setsadmalon.asp**: Salvar/atualizar informações do salão
- **getadmthemes.asp**: Buscar temas/cores personalizadas

### Gestão de Profissionais
- **getadmprofessionals.asp**: Listar profissionais
- **setadmprofessional.asp**: Cadastrar novo profissional
- **updateadmprofessional.asp**: Atualizar profissional existente
- **deleteadmprofessional.asp**: Desativar profissional

### Gestão de Serviços
- **getadmservices.asp**: Listar serviços
- **setadmservice.asp**: Cadastrar novo serviço
- **updateadmservice.asp**: Atualizar serviço existente
- **deleteadmservice.asp**: Desativar serviço

### Gestão de Horários
- **getadmdates.asp**: Buscar datas bloqueadas
- **getadmtimes.asp**: Buscar horários disponíveis
- **setblockedtime.asp**: Bloquear horários específicos
- **deleteblockedtime.asp**: Remover bloqueio de horário

### Configurações
- **getadmsettings.asp**: Buscar configurações do sistema
- **setadmsettings.asp**: Salvar configurações do sistema

### Relatórios e Agendamentos
- **getadmappointments.asp**: Listar agendamentos
- **getadmreports.asp**: Relatórios de performance

## Configuração do Servidor

### Requisitos Mínimos
- **Windows Server** 2016 ou superior
- **IIS** 10 ou superior com ASP Classic habilitado
- **MySQL** 8.0 ou superior
- **MySQL ODBC Driver** 8.0

### Configuração de Segurança IIS
```xml
<system.web>
    <httpCookies requireSSL="true" sameSite="Strict" />
    <customErrors mode="On" defaultRedirect="error.html" />
    <compilation debug="false" />
    <sessionState cookieless="false" regenerateExpiredSessionId="true" 
                  cookieTimeout="60" cookieSameSite="Strict" />
</system.web>
```

## Integração com Frontend

### Estrutura de Resposta Padrão
```json
{
    "success": true|false,
    "message": "Mensagem descritiva",
    "data": {
        // Dados específicos da API
    },
    "error_code": "codigo_erro" // Opcional, apenas em caso de erro
}
```

### Headers de Segurança
```asp
Response.AddHeader "X-Content-Type-Options", "nosniff"
Response.AddHeader "X-Frame-Options", "DENY"
Response.AddHeader "X-XSS-Protection", "1; mode=block"
Response.AddHeader "Referrer-Policy", "strict-origin-when-cross-origin"
```

Este plano fornece uma base sólida para implementação completa do sistema. Cada API deve ser desenvolvida seguindo os padrões de segurança estabelecidos, com validação rigorosa de dados e logs de auditoria.