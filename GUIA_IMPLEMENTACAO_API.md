# Guia de Implementação das APIs ASP Classic
## Sistema Administrativo de Salões de Beleza e Barbearias

---

## 📋 INFORMAÇÕES GERAIS

### Padrão de Nomenclatura
- **Prefixo:** `admin_`
- **Extensão:** `.asp`
- **Localização:** `/api/`
- **Exemplo:** `/api/admin_authlogin.asp`

### Estrutura de Resposta JSON (Padrão)
```json
{
  "success": true|false,
  "data": { ... },
  "error": "mensagem de erro se houver"
}
```

### Headers Obrigatórios
```asp
Response.ContentType = "application/json"
Response.AddHeader "Access-Control-Allow-Origin", "*"
Response.AddHeader "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"
Response.AddHeader "Access-Control-Allow-Headers", "Content-Type, Authorization"
```

---

## 🔐 1. AUTENTICAÇÃO

### 1.1. Login
**Arquivo:** `admin_authlogin.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Lógica:**
1. Validar campos obrigatórios
2. Buscar usuário no banco: `SELECT * FROM users WHERE username = ?`
3. Verificar senha hasheada (SHA256 ou MD5)
4. Verificar se 2FA está habilitado
5. Se 2FA habilitado, enviar código e retornar `requires2FA: true`
6. Se não, criar sessão e retornar sessionId
7. Registrar log de login

**Resposta de Sucesso (sem 2FA):**
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123...",
    "userId": "1",
    "username": "admin",
    "requires2FA": false
  }
}
```

**Resposta de Sucesso (com 2FA):**
```json
{
  "success": true,
  "data": {
    "requires2FA": true,
    "tempToken": "xyz789..."
  }
}
```

### 1.2. Verificação 2FA
**Arquivo:** `admin_authverify2fa.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "tempToken": "string",
  "code": "string"
}
```

**Lógica:**
1. Validar token temporário
2. Verificar código 2FA
3. Criar sessão se válido
4. Retornar sessionId

**Resposta:**
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123...",
    "userId": "1",
    "username": "admin"
  }
}
```

### 1.3. Esqueci Senha
**Arquivo:** `admin_authforgotpassword.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "username": "string",
  "email": "string"
}
```

**Lógica:**
1. Buscar usuário por username e email
2. Gerar token de recuperação (UUID ou GUID)
3. Salvar token na tabela `password_reset_tokens` com expiração
4. Enviar link por email/SMS
5. Retornar sucesso (não expor se usuário existe)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "message": "Se o usuário existir, um link de recuperação será enviado."
  }
}
```

### 1.4. Logout
**Arquivo:** `admin_authlogout.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "sessionId": "string"
}
```

**Lógica:**
1. Invalidar sessão no banco
2. Registrar log de logout

---

## 🏢 2. GERENCIAMENTO DE SALÃO

### 2.1. Obter Informações do Salão
**Arquivo:** `admin_getsadmalon.asp`  
**Método:** GET  
**Parâmetros:** Nenhum (ou salonId se múltiplos salões)

**Query SQL:**
```sql
SELECT 
  id, name, description, address, phone, 
  working_days, open_time, close_time,
  primary_color, secondary_color, accent_color, selected_theme,
  instagram, facebook, youtube, tiktok,
  main_logo_url, secondary_logo_url,
  whatsapp_custom_text, evaded_clients_reminder_text
FROM salon_info
WHERE id = ?
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Salão Beleza Total",
    "description": "O melhor salão da cidade",
    "address": "Rua das Flores, 123",
    "phone": "(11) 99999-9999",
    "workingDays": ["1", "2", "3", "4", "5", "6"],
    "openTime": "09:00",
    "closeTime": "18:00",
    "selectedTheme": "azul",
    "primaryColor": "#3b82f6",
    "secondaryColor": "#8b5cf6",
    "accentColor": "#10b981",
    "instagram": "@salaobeleza",
    "facebook": "/salaobeleza",
    "youtube": "/salaobeleza",
    "tiktok": "@salaobeleza",
    "mainLogoUrl": "/uploads/logo.png",
    "secondaryLogoUrl": "/uploads/logo2.png",
    "whatsappCustomText": "Obrigado por agendar!",
    "evadedClientsReminderText": "Sentimos sua falta!"
  }
}
```

### 2.2. Atualizar Informações do Salão
**Arquivo:** `admin_setsadmalon.asp`  
**Método:** POST  
**Parâmetros:** Todos os campos do salão

**Lógica:**
1. Validar campos obrigatórios (name, phone, address)
2. Se houver upload de logo, processar arquivo (usar FormData em vez de JSON)
3. Atualizar registro no banco
4. Retornar dados atualizados

**Query SQL:**
```sql
UPDATE salon_info SET
  name = ?,
  description = ?,
  address = ?,
  phone = ?,
  working_days = ?,
  open_time = ?,
  close_time = ?,
  primary_color = ?,
  secondary_color = ?,
  accent_color = ?,
  selected_theme = ?,
  instagram = ?,
  facebook = ?,
  youtube = ?,
  tiktok = ?,
  whatsapp_custom_text = ?,
  evaded_clients_reminder_text = ?,
  updated_at = NOW()
WHERE id = ?
```

### 2.3. Obter Temas Disponíveis
**Arquivo:** `admin_getadmthemes.asp`  
**Método:** GET

**Resposta:**
```json
{
  "success": true,
  "data": [
    { "id": "azul", "name": "Azul", "primaryColor": "#3b82f6", "secondaryColor": "#1e40af", "accentColor": "#06b6d4" },
    { "id": "rosa", "name": "Rosa", "primaryColor": "#ec4899", "secondaryColor": "#be185d", "accentColor": "#f97316" },
    { "id": "preto", "name": "Preto", "primaryColor": "#1f2937", "secondaryColor": "#374151", "accentColor": "#6b7280" },
    { "id": "cinza", "name": "Cinza", "primaryColor": "#6b7280", "secondaryColor": "#4b5563", "accentColor": "#9ca3af" },
    { "id": "verde", "name": "Verde", "primaryColor": "#10b981", "secondaryColor": "#059669", "accentColor": "#34d399" }
  ]
}
```

---

## 👥 3. GERENCIAMENTO DE PROFISSIONAIS

### 3.1. Listar Profissionais
**Arquivo:** `admin_getadmprofessionals.asp`  
**Método:** GET

**Query SQL:**
```sql
SELECT 
  id, name, specialty, photo_url, phone, email,
  working_days, working_start, working_end, is_active,
  created_at, updated_at
FROM professionals
WHERE salon_id = ?
ORDER BY name ASC
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Maria Silva",
      "specialty": "Cabeleireira",
      "photoUrl": "/uploads/maria.jpg",
      "phone": "(11) 98888-8888",
      "email": "maria@salao.com",
      "workingDays": ["1", "2", "3", "4", "5"],
      "workingStart": "09:00",
      "workingEnd": "18:00",
      "isActive": true
    }
  ]
}
```

### 3.2. Criar/Atualizar Profissional
**Arquivo:** `admin_setadmprofessionals.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "id": "string (opcional, se update)",
  "name": "string",
  "specialty": "string",
  "phone": "string",
  "email": "string",
  "workingDays": ["string"],
  "workingStart": "HH:mm",
  "workingEnd": "HH:mm",
  "isActive": boolean
}
```

**Lógica:**
1. Se `id` existe, fazer UPDATE; senão INSERT
2. Validar campos obrigatórios
3. Processar upload de foto se houver
4. Salvar no banco

**Query INSERT:**
```sql
INSERT INTO professionals (
  id, salon_id, name, specialty, photo_url, phone, email,
  working_days, working_start, working_end, is_active, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
```

**Query UPDATE:**
```sql
UPDATE professionals SET
  name = ?, specialty = ?, phone = ?, email = ?,
  working_days = ?, working_start = ?, working_end = ?,
  is_active = ?, updated_at = NOW()
WHERE id = ? AND salon_id = ?
```

### 3.3. Deletar Profissional
**Arquivo:** `admin_deleteadmprofessional.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "id": "string"
}
```

**Lógica:**
1. Verificar se profissional tem agendamentos futuros
2. Se sim, desativar (soft delete); se não, deletar (hard delete)
3. Retornar sucesso

**Query:**
```sql
-- Soft delete (recomendado)
UPDATE professionals SET is_active = 0, deleted_at = NOW()
WHERE id = ? AND salon_id = ?

-- Ou hard delete (cuidado com integridade referencial)
DELETE FROM professionals WHERE id = ? AND salon_id = ?
```

---

## ✂️ 4. GERENCIAMENTO DE SERVIÇOS

### 4.1. Listar Serviços
**Arquivo:** `admin_getadmservices.asp`  
**Método:** GET

**Query SQL:**
```sql
SELECT 
  id, name, description, duration, price, category, is_active,
  created_at, updated_at
FROM services
WHERE salon_id = ?
ORDER BY category, name ASC
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Corte Feminino",
      "description": "Corte de cabelo feminino",
      "duration": 60,
      "price": 80.00,
      "category": "Cabelo",
      "isActive": true
    }
  ]
}
```

### 4.2. Criar/Atualizar Serviço
**Arquivo:** `admin_setadmservices.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "id": "string (opcional)",
  "name": "string",
  "description": "string",
  "duration": number,
  "price": number,
  "category": "string",
  "isActive": boolean
}
```

**Query INSERT:**
```sql
INSERT INTO services (
  id, salon_id, name, description, duration, price, category, is_active, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
```

**Query UPDATE:**
```sql
UPDATE services SET
  name = ?, description = ?, duration = ?, price = ?,
  category = ?, is_active = ?, updated_at = NOW()
WHERE id = ? AND salon_id = ?
```

### 4.3. Deletar Serviço
**Arquivo:** `admin_deleteadmservice.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "id": "string"
}
```

**Lógica:** Similar ao delete de profissional (soft delete recomendado)

---

## 📅 5. GERENCIAMENTO DE HORÁRIOS

### 5.1. Obter Datas Disponíveis
**Arquivo:** `admin_getadmdates.asp`  
**Método:** GET

**Lógica:**
1. Gerar próximos 30-60 dias a partir de hoje
2. Excluir datas da tabela `blocked_dates`
3. Excluir feriados municipais
4. Filtrar por dias de funcionamento do salão
5. Retornar lista de datas

**Resposta:**
```json
{
  "success": true,
  "data": {
    "availableDates": ["2025-10-11", "2025-10-12", "2025-10-13"]
  }
}
```

### 5.2. Configurar Datas Bloqueadas
**Arquivo:** `admin_setadmdates.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "blockedDates": ["2025-12-25", "2025-12-31"]
}
```

### 5.3. Obter Horários Disponíveis
**Arquivo:** `admin_getadmtimes.asp`  
**Método:** GET  
**Parâmetros Query String:** `?date=YYYY-MM-DD&professionalId=X&serviceId=Y`

**Lógica:**
1. Buscar horário de trabalho do profissional naquele dia
2. Buscar duração do serviço
3. Gerar slots de horário (ex: a cada 30 min)
4. Excluir horários já agendados para aquele profissional
5. Excluir horários bloqueados
6. Retornar lista de horários

**Query:**
```sql
-- Buscar agendamentos existentes
SELECT appointment_time, duration 
FROM appointments 
WHERE professional_id = ? 
  AND appointment_date = ?
  AND status != 'cancelled'

-- Buscar bloqueios
SELECT start_time, end_time
FROM blocked_times
WHERE professional_id = ?
  AND blocked_date = ?
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "availableTimes": ["09:00", "09:30", "10:00", "10:30"]
  }
}
```

### 5.4. Configurar Horários de Funcionamento
**Arquivo:** `admin_setadmtimes.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "professionalId": "string",
  "workingStart": "09:00",
  "workingEnd": "18:00",
  "workingDays": ["1", "2", "3", "4", "5"]
}
```

---

## 📆 6. GERENCIAMENTO DE AGENDAMENTOS

### 6.1. Listar Todos os Agendamentos
**Arquivo:** `admin_getadmappointments.asp`  
**Método:** GET

**Query SQL:**
```sql
SELECT 
  a.id, a.appointment_date, a.appointment_time,
  a.customer_name, a.customer_phone, a.status,
  p.name as professional_name,
  s.name as service_name, s.duration, s.price
FROM appointments a
INNER JOIN professionals p ON a.professional_id = p.id
INNER JOIN services s ON a.service_id = s.id
WHERE a.salon_id = ?
ORDER BY a.appointment_date DESC, a.appointment_time DESC
LIMIT 100
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "date": "2025-10-15",
      "time": "10:00",
      "customerName": "João Silva",
      "customerPhone": "(11) 99999-9999",
      "professionalName": "Maria Silva",
      "serviceName": "Corte Masculino",
      "duration": 30,
      "price": 50.00,
      "status": "confirmed"
    }
  ]
}
```

### 6.2. Agendamentos de Hoje
**Arquivo:** `admin_getadmappointmentstoday.asp`  
**Método:** GET

**Query SQL:**
```sql
SELECT ... (mesma do acima)
WHERE a.salon_id = ? AND a.appointment_date = CURDATE()
ORDER BY a.appointment_time ASC
```

### 6.3. Agendamentos por Data
**Arquivo:** `admin_getadmappointmentsbydate.asp`  
**Método:** GET  
**Parâmetros Query String:** `?date=YYYY-MM-DD`

**Query SQL:**
```sql
SELECT ... (mesma do acima)
WHERE a.salon_id = ? AND a.appointment_date = ?
ORDER BY a.appointment_time ASC
```

### 6.4. Criar/Atualizar Agendamento
**Arquivo:** `admin_setadmappointments.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "id": "string (opcional)",
  "professionalId": "string",
  "serviceId": "string",
  "appointmentDate": "YYYY-MM-DD",
  "appointmentTime": "HH:mm",
  "customerName": "string",
  "customerPhone": "string",
  "status": "pending|confirmed|cancelled"
}
```

**Lógica:**
1. Validar disponibilidade do horário
2. Validar campos obrigatórios
3. Inserir ou atualizar no banco
4. Enviar confirmação via WhatsApp/SMS (opcional)
5. Retornar dados do agendamento

**Query INSERT:**
```sql
INSERT INTO appointments (
  id, salon_id, professional_id, service_id,
  appointment_date, appointment_time,
  customer_name, customer_phone, status, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
```

---

## 👤 7. GERENCIAMENTO DE CLIENTES

### 7.1. Listar Clientes Cadastrados
**Arquivo:** `admin_getadmclients.asp`  
**Método:** GET

**Query SQL:**
```sql
SELECT DISTINCT
  customer_name as name,
  customer_phone as phone,
  customer_email as email,
  MAX(appointment_date) as lastVisit,
  COUNT(*) as totalAppointments
FROM appointments
WHERE salon_id = ?
GROUP BY customer_phone
ORDER BY customer_name ASC
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "João Silva",
      "phone": "(11) 99999-9999",
      "email": "joao@email.com",
      "lastVisit": "2025-09-15",
      "totalAppointments": 5
    }
  ]
}
```

### 7.2. Listar Clientes Fixos
**Arquivo:** `admin_getadmfixedclients.asp`  
**Método:** GET

**Query SQL:**
```sql
SELECT 
  id, client_id, name, phone, frequency, week_day, time,
  professional_id, service_id, is_active, created_at
FROM fixed_clients
WHERE salon_id = ? AND is_active = 1
ORDER BY week_day, time
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "clientId": "123",
      "name": "Maria Santos",
      "phone": "(11) 98888-8888",
      "frequency": "semanal",
      "weekDay": "1",
      "time": "10:00",
      "professionalId": "prof1",
      "serviceId": "serv1",
      "active": true
    }
  ]
}
```

### 7.3. Cadastrar Cliente Fixo
**Arquivo:** `admin_setadmfixedclients.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "name": "string",
  "phone": "string",
  "frequency": "semanal|quinzenal|mensal",
  "weekDay": "string",
  "time": "HH:mm",
  "professionalId": "string",
  "serviceId": "string"
}
```

### 7.4. Listar Clientes Evadidos
**Arquivo:** `admin_getadmchurnedclients.asp`  
**Método:** GET  
**Parâmetros Query String:** `?months=3` (padrão 3 meses)

**Query SQL:**
```sql
SELECT DISTINCT
  customer_name as name,
  customer_phone as phone,
  customer_email as email,
  MAX(appointment_date) as lastVisit,
  DATEDIFF(CURDATE(), MAX(appointment_date)) as daysSinceLastVisit
FROM appointments
WHERE salon_id = ?
GROUP BY customer_phone
HAVING daysSinceLastVisit > (? * 30)
ORDER BY lastVisit DESC
```

### 7.5. Enviar Lembrete para Clientes Evadidos
**Arquivo:** `admin_sendclientreminder.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "clientIds": ["string"],
  "message": "string",
  "method": "sms|whatsapp|both"
}
```

**Lógica:**
1. Validar clientes
2. Enviar mensagem via gateway SMS/WhatsApp
3. Registrar envio em log
4. Retornar resultado

### 7.6. Enviar Mensagem em Massa
**Arquivo:** `admin_sendclientbroadcast.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "clientIds": ["string"],
  "message": "string",
  "method": "sms|whatsapp|both"
}
```

---

## ⚙️ 8. CONFIGURAÇÕES DO SISTEMA

### 8.1. Obter Configurações
**Arquivo:** `admin_getadmsettings.asp`  
**Método:** GET

**Query SQL:**
```sql
SELECT 
  id, salon_id, setting_key, setting_value, updated_at
FROM system_settings
WHERE salon_id = ?
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "twoFactorEnabled": true,
    "smsGateway": "provider_name",
    "smsApiKey": "encrypted_key",
    "whatsappEnabled": true,
    "emailNotifications": true,
    "reminderDaysBefore": 1,
    "autoConfirmAppointments": false
  }
}
```

### 8.2. Atualizar Configurações
**Arquivo:** `admin_setadmsettings.asp`  
**Método:** POST  
**Parâmetros:** Objeto com todas as configurações

**Query:**
```sql
-- Usar UPSERT ou múltiplos INSERT...ON DUPLICATE KEY UPDATE
INSERT INTO system_settings (salon_id, setting_key, setting_value, updated_at)
VALUES (?, ?, ?, NOW())
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
```

### 8.3. Obter Texto de Confirmação
**Arquivo:** `admin_getadmconfirmation.asp`  
**Método:** GET

**Resposta:**
```json
{
  "success": true,
  "data": {
    "confirmationText": "Seu agendamento foi confirmado! Aguardamos você.",
    "reminderText": "Lembrete: Você tem agendamento amanhã às {time} com {professional}."
  }
}
```

### 8.4. Atualizar Texto de Confirmação
**Arquivo:** `admin_setadmconfirmation.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "confirmationText": "string",
  "reminderText": "string"
}
```

---

## 📅 9. FERIADOS E BLOQUEIOS

### 9.1. Obter Feriados Municipais
**Arquivo:** `admin_getadmmunicipalidays.asp`  
**Método:** GET

**Query SQL:**
```sql
SELECT id, name, date, type
FROM holidays
WHERE salon_id = ? AND type = 'municipal'
ORDER BY date ASC
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Carnaval",
      "date": "2025-03-04",
      "type": "municipal"
    }
  ]
}
```

### 9.2. Cadastrar Feriado Municipal
**Arquivo:** `admin_setadmmunicipalidays.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "name": "string",
  "date": "YYYY-MM-DD"
}
```

### 9.3. Obter Datas Bloqueadas
**Arquivo:** `admin_getadmblockeddates.asp`  
**Método:** GET

**Query SQL:**
```sql
SELECT id, name, date, type
FROM holidays
WHERE salon_id = ? AND type = 'blocked'
ORDER BY date ASC
```

### 9.4. Cadastrar Data Bloqueada
**Arquivo:** `admin_setadmblockeddates.asp`  
**Método:** POST  
**Parâmetros:**
```json
{
  "name": "string",
  "date": "YYYY-MM-DD"
}
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `users`
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  two_factor_enabled BOOLEAN DEFAULT 0,
  two_factor_secret VARCHAR(255),
  role ENUM('admin', 'manager', 'staff') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);
```

### Tabela: `salon_info`
```sql
CREATE TABLE salon_info (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  working_days VARCHAR(50),
  open_time TIME,
  close_time TIME,
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  accent_color VARCHAR(20),
  selected_theme VARCHAR(50),
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  youtube VARCHAR(255),
  tiktok VARCHAR(255),
  main_logo_url VARCHAR(500),
  secondary_logo_url VARCHAR(500),
  whatsapp_custom_text TEXT,
  evaded_clients_reminder_text TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

### Tabela: `professionals`
```sql
CREATE TABLE professionals (
  id VARCHAR(50) PRIMARY KEY,
  salon_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  photo_url VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  working_days VARCHAR(50),
  working_start TIME,
  working_end TIME,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME,
  deleted_at DATETIME,
  FOREIGN KEY (salon_id) REFERENCES salon_info(id)
);
```

### Tabela: `services`
```sql
CREATE TABLE services (
  id VARCHAR(50) PRIMARY KEY,
  salon_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME,
  deleted_at DATETIME,
  FOREIGN KEY (salon_id) REFERENCES salon_info(id)
);
```

### Tabela: `appointments`
```sql
CREATE TABLE appointments (
  id VARCHAR(50) PRIMARY KEY,
  salon_id VARCHAR(50) NOT NULL,
  professional_id VARCHAR(50) NOT NULL,
  service_id VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (salon_id) REFERENCES salon_info(id),
  FOREIGN KEY (professional_id) REFERENCES professionals(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);
```

### Tabela: `fixed_clients`
```sql
CREATE TABLE fixed_clients (
  id VARCHAR(50) PRIMARY KEY,
  salon_id VARCHAR(50) NOT NULL,
  client_id VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  frequency ENUM('semanal', 'quinzenal', 'mensal') NOT NULL,
  week_day VARCHAR(10),
  time TIME,
  professional_id VARCHAR(50),
  service_id VARCHAR(50),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (salon_id) REFERENCES salon_info(id),
  FOREIGN KEY (professional_id) REFERENCES professionals(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);
```

### Tabela: `holidays`
```sql
CREATE TABLE holidays (
  id VARCHAR(50) PRIMARY KEY,
  salon_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  type ENUM('municipal', 'blocked') NOT NULL,
  created_at DATETIME,
  FOREIGN KEY (salon_id) REFERENCES salon_info(id)
);
```

### Tabela: `blocked_times`
```sql
CREATE TABLE blocked_times (
  id VARCHAR(50) PRIMARY KEY,
  salon_id VARCHAR(50) NOT NULL,
  professional_id VARCHAR(50),
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason VARCHAR(255),
  created_at DATETIME,
  FOREIGN KEY (salon_id) REFERENCES salon_info(id),
  FOREIGN KEY (professional_id) REFERENCES professionals(id)
);
```

### Tabela: `system_settings`
```sql
CREATE TABLE system_settings (
  id VARCHAR(50) PRIMARY KEY,
  salon_id VARCHAR(50) NOT NULL,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  updated_at DATETIME,
  UNIQUE KEY (salon_id, setting_key),
  FOREIGN KEY (salon_id) REFERENCES salon_info(id)
);
```

### Tabela: `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT 0,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔒 SEGURANÇA - CHECKLIST

### ✅ Autenticação e Autorização
- [ ] Implementar hash de senha (SHA256 ou bcrypt)
- [ ] Validar sessão em todas as requisições
- [ ] Implementar rate limiting para login
- [ ] Implementar bloqueio após X tentativas falhas
- [ ] Suportar 2FA (Two-Factor Authentication)
- [ ] Validar tokens de recuperação de senha

### ✅ Validação de Dados
- [ ] Sanitizar TODOS os inputs do usuário
- [ ] Usar prepared statements (parametrized queries)
- [ ] Validar tipos de dados no backend
- [ ] Validar tamanhos máximos de campos
- [ ] Validar formatos (email, telefone, datas)

### ✅ SQL Injection Prevention
```asp
' ❌ NUNCA FAZER ISSO:
sql = "SELECT * FROM users WHERE username = '" & username & "'"

' ✅ SEMPRE USAR PARAMETRIZED QUERIES:
Set cmd = Server.CreateObject("ADODB.Command")
cmd.CommandText = "SELECT * FROM users WHERE username = ?"
cmd.Parameters.Append cmd.CreateParameter("username", adVarChar, adParamInput, 100, username)
```

### ✅ Headers de Segurança
```asp
Response.AddHeader "X-Content-Type-Options", "nosniff"
Response.AddHeader "X-Frame-Options", "DENY"
Response.AddHeader "X-XSS-Protection", "1; mode=block"
Response.AddHeader "Strict-Transport-Security", "max-age=31536000"
```

### ✅ Logs de Auditoria
- [ ] Registrar todos os logins (sucesso e falha)
- [ ] Registrar criação/edição/exclusão de dados
- [ ] Registrar envio de mensagens
- [ ] Registrar acesso a dados sensíveis

---

## 📝 EXEMPLO DE IMPLEMENTAÇÃO ASP

### Exemplo: admin_getadmprofessionals.asp
```asp
<%@ Language=VBScript %>
<%
' Headers de segurança e CORS
Response.ContentType = "application/json"
Response.AddHeader "Access-Control-Allow-Origin", "*"
Response.AddHeader "Access-Control-Allow-Methods", "GET, POST, OPTIONS"
Response.AddHeader "Access-Control-Allow-Headers", "Content-Type"

' Constantes
Const DB_CONNECTION = "Driver={MySQL ODBC 8.0 Driver};Server=localhost;Database=salon_db;UID=user;PWD=pass;"

' Função para retornar JSON
Function ReturnJSON(success, data, errorMsg)
    Dim json
    json = "{""success"":" & LCase(CStr(success))
    
    If Not IsNull(data) And data <> "" Then
        json = json & ",""data"":" & data
    End If
    
    If errorMsg <> "" Then
        json = json & ",""error"":" & Chr(34) & errorMsg & Chr(34)
    End If
    
    json = json & "}"
    Response.Write json
    Response.End
End Function

' Validar sessão (exemplo simples)
Dim sessionId
sessionId = Request.QueryString("sessionId")
If sessionId = "" Then
    ReturnJSON False, "", "Sessão inválida"
End If

' Conectar ao banco
Dim conn, rs, cmd
Set conn = Server.CreateObject("ADODB.Connection")
conn.Open DB_CONNECTION

' Query parametrizada
Set cmd = Server.CreateObject("ADODB.Command")
cmd.ActiveConnection = conn
cmd.CommandText = "SELECT id, name, specialty, photo_url, phone, email, " & _
                  "working_days, working_start, working_end, is_active " & _
                  "FROM professionals WHERE salon_id = ? AND deleted_at IS NULL " & _
                  "ORDER BY name ASC"
cmd.Parameters.Append cmd.CreateParameter("salonId", 200, 1, 50, "1") ' adVarChar = 200

On Error Resume Next
Set rs = cmd.Execute
If Err.Number <> 0 Then
    conn.Close
    ReturnJSON False, "", "Erro ao buscar profissionais: " & Err.Description
End If
On Error Goto 0

' Construir JSON
Dim jsonArray, first
jsonArray = "["
first = True

Do While Not rs.EOF
    If Not first Then jsonArray = jsonArray & ","
    first = False
    
    jsonArray = jsonArray & "{" & _
        """id"":""" & rs("id") & """," & _
        """name"":""" & rs("name") & """," & _
        """specialty"":""" & rs("specialty") & """," & _
        """photoUrl"":""" & rs("photo_url") & """," & _
        """phone"":""" & rs("phone") & """," & _
        """email"":""" & rs("email") & """," & _
        """workingDays"":" & rs("working_days") & "," & _
        """workingStart"":""" & rs("working_start") & """," & _
        """workingEnd"":""" & rs("working_end") & """," & _
        """isActive"":" & LCase(CStr(rs("is_active"))) & _
        "}"
    
    rs.MoveNext
Loop

jsonArray = jsonArray & "]"

rs.Close
conn.Close
Set rs = Nothing
Set cmd = Nothing
Set conn = Nothing

' Retornar resposta
ReturnJSON True, jsonArray, ""
%>
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Criar banco de dados MySQL** com as tabelas especificadas
2. **Implementar APIs de autenticação** primeiro (login, logout)
3. **Implementar APIs de leitura** (GET) para cada módulo
4. **Implementar APIs de escrita** (POST) para cada módulo
5. **Testar cada endpoint** individualmente usando Postman ou similar
6. **Implementar logs de auditoria**
7. **Implementar envio de SMS/WhatsApp**
8. **Configurar backups automáticos**
9. **Implementar monitoramento de erros**
10. **Realizar testes de segurança**

---

## 📞 SUPORTE TÉCNICO

Em caso de dúvidas sobre a implementação, consulte:
- Documentação do ASP Classic
- Documentação do MySQL ODBC Driver
- Guia de segurança OWASP

**Desenvolvido para:** Sistema de Agendamento Multi-Salão  
**Versão do Documento:** 1.0  
**Data:** Outubro 2025
