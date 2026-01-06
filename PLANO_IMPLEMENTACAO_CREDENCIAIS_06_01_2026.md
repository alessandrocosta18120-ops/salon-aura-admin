# Plano de Implementação - Tela de Credenciais do Profissional
**Data:** 06/01/2026

---

## 1. Resumo da Funcionalidade

Implementação de tela para criação/alteração de username e senha de profissionais, vinculada ao cadastro de profissionais no painel administrativo.

### Fluxo Principal
1. Admin cadastra um novo profissional
2. Após salvar, é redirecionado automaticamente para a tela de credenciais
3. Sistema sugere username baseado no nome do profissional
4. Admin define username (validado em tempo real) e senha
5. Ao salvar, sistema envia e-mail automático com instruções de acesso

### Modos de Operação
- **Criação inicial**: Após cadastrar novo profissional
- **Alteração**: Acessando via botão "Acesso" na lista de profissionais
- **Redefinição**: Via link enviado por e-mail (parâmetro `?mode=reset`)

---

## 2. Implementação Frontend (CONCLUÍDA)

### Arquivos Criados/Modificados

#### `src/pages/ProfessionalCredentials.tsx` (NOVO)
Tela completa com:
- Campo username (máx. 10 caracteres)
- Sugestão automática baseada no nome
- Validação em tempo real (unicidade)
- Feedback visual de disponibilidade (✓/✗)
- Campo senha com toggle de visibilidade
- Campo confirmar senha
- Validação de força da senha (mín. 6 chars, letras + números)
- Alertas informativos sobre envio de e-mail

#### `src/lib/api.ts`
Adicionado `credentialsApi`:
```typescript
export const credentialsApi = {
  checkUsername: (username: string) => apiCall('checkusername', { username }, 'GET'),
  setCredentials: (data: { professionalId: string; username: string; password: string }) => 
    apiCall('setprofessionalcredentials', data, 'POST'),
  getCredentialsStatus: (professionalId: string) => 
    apiCall('getprofessionalcredentialsstatus', { professionalId }),
  sendResetEmail: (professionalId: string) => 
    apiCall('sendcredentialsresetemail', { professionalId }, 'POST'),
};
```

#### `src/pages/ProfessionalForm.tsx`
Modificado para redirecionar para tela de credenciais após criar novo profissional:
```typescript
if (isNewProfessional && newProfessionalId) {
  navigate(`/dashboard/professionals/credentials/${newProfessionalId}`);
}
```

#### `src/pages/ProfessionalsManagement.tsx`
Adicionado botão "Acesso" (ícone de chave) na lista de profissionais.

#### `src/App.tsx`
Adicionada rota:
```typescript
<Route path="professionals/credentials/:professionalId" 
       element={<RequireRole allowedRoles={['admin', 'manager']}><ProfessionalCredentials /></RequireRole>} />
```

---

## 3. APIs Backend Necessárias

### 3.1 `admin_checkusername.asp` (GET)

**Propósito:** Verificar se username já existe (validação em tempo real)

**Request:**
```
GET /admin/api/admin_checkusername.asp?username=joaosilva&salonId=123
```

**Response (username disponível):**
```json
{
  "success": true,
  "data": {
    "available": true
  }
}
```

**Response (username em uso):**
```json
{
  "success": true,
  "data": {
    "available": false,
    "usedBy": "João da Silva" // Opcional, para feedback
  }
}
```

**Lógica:**
```sql
SELECT COUNT(*) FROM profissionais 
WHERE username = @username 
  AND salonId = @salonId
```

---

### 3.2 `admin_setprofessionalcredentials.asp` (POST)

**Propósito:** Criar ou atualizar username e senha do profissional

**Request:**
```json
{
  "professionalId": "uuid-do-profissional",
  "username": "joaosilva",
  "password": "Senha123",
  "salonId": "123",
  "userId": "admin-user-id",
  "slug": "meu-salao"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-profissional",
    "username": "joaosilva",
    "credentialsCreatedAt": "2026-01-06T10:30:00Z"
  }
}
```

**Lógica:**
1. Validar se username não está em uso por outro profissional
2. Hash da senha (bcrypt ou similar)
3. Atualizar campos `username`, `password_hash`, `credentials_updated_at`
4. Se for primeira vez, definir `credentials_created_at`

**IMPORTANTE - Segurança:**
- **NUNCA** armazenar senha em texto plano
- Usar bcrypt/argon2 para hash
- Validar tamanho do username (3-10 chars)
- Sanitizar input contra SQL injection

---

### 3.3 `admin_getprofessionalcredentialsstatus.asp` (GET)

**Propósito:** Verificar se profissional já tem credenciais e status

**Request:**
```
GET /admin/api/admin_getprofessionalcredentialsstatus.asp?professionalId=uuid&salonId=123
```

**Response (sem credenciais):**
```json
{
  "success": true,
  "data": {
    "hasCredentials": false,
    "isReset": false
  }
}
```

**Response (com credenciais):**
```json
{
  "success": true,
  "data": {
    "hasCredentials": true,
    "isReset": false,
    "username": "joaosilva",
    "credentialsCreatedAt": "2026-01-06T10:30:00Z",
    "lastLogin": "2026-01-06T15:45:00Z"
  }
}
```

**Response (aguardando reset):**
```json
{
  "success": true,
  "data": {
    "hasCredentials": true,
    "isReset": true,
    "username": "joaosilva",
    "resetRequestedAt": "2026-01-06T09:00:00Z"
  }
}
```

---

### 3.4 `admin_sendcredentialsresetemail.asp` (POST)

**Propósito:** Enviar e-mail com link para redefinição de credenciais

**Request:**
```json
{
  "professionalId": "uuid-do-profissional",
  "salonId": "123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emailSent": true,
    "sentTo": "joao@email.com"
  }
}
```

**Lógica:**
1. Buscar e-mail do profissional
2. Gerar token de reset (UUID + timestamp)
3. Salvar token no banco com expiração (24h)
4. Montar URL: `https://dominio.com/admin/#/dashboard/professionals/credentials/{id}?mode=reset&token={token}`
5. Enviar e-mail via serviço de e-mail

**Template do E-mail:**
```
Assunto: Suas credenciais de acesso - [Nome do Salão]

Olá [Nome do Profissional],

Suas credenciais de acesso ao sistema foram criadas/atualizadas.

Para acessar o sistema ou redefinir sua senha, clique no link abaixo:
[LINK]

Este link expira em 24 horas.

Atenciosamente,
[Nome do Salão]
```

---

### 3.5 Modificação em `admin_setadmprofessionals.asp`

**Propósito:** Retornar o ID do profissional criado para redirecionamento

**Response atual:**
```json
{
  "success": true
}
```

**Response necessária:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-novo-profissional",
    "name": "João da Silva"
  }
}
```

---

## 4. Alterações no Banco de Dados

### Tabela: `profissionais`

Adicionar/verificar colunas:
```sql
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS username VARCHAR(10) UNIQUE;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS credentials_created_at TIMESTAMP;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS credentials_updated_at TIMESTAMP;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100);
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS is_password_reset_required BOOLEAN DEFAULT FALSE;

-- Índice para busca rápida de username
CREATE INDEX IF NOT EXISTS idx_profissionais_username ON profissionais(username, salonId);
```

### Campos:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `username` | VARCHAR(10) | Username único por salão |
| `password_hash` | VARCHAR(255) | Hash da senha (bcrypt) |
| `credentials_created_at` | TIMESTAMP | Data de criação das credenciais |
| `credentials_updated_at` | TIMESTAMP | Última atualização |
| `last_login` | TIMESTAMP | Último acesso |
| `reset_token` | VARCHAR(100) | Token para reset de senha |
| `reset_token_expires_at` | TIMESTAMP | Expiração do token |
| `is_password_reset_required` | BOOLEAN | Se precisa redefinir senha |

---

## 5. Considerações de Segurança

### Frontend
- ✅ Validação de tamanho do username (3-10 chars)
- ✅ Sanitização de caracteres especiais
- ✅ Validação de força da senha
- ✅ Não expor senha em texto plano
- ✅ Debounce na verificação de username

### Backend (A IMPLEMENTAR)
- ⚠️ Hash de senha com bcrypt/argon2
- ⚠️ Rate limiting na verificação de username
- ⚠️ Queries parametrizadas (SQL injection)
- ⚠️ Token de reset com expiração
- ⚠️ Logs de auditoria para alterações de credenciais
- ⚠️ HTTPS obrigatório para todas as rotas

---

## 6. Checklist de Implementação Backend

- [ ] Criar `admin_checkusername.asp`
- [ ] Criar `admin_setprofessionalcredentials.asp`
- [ ] Criar `admin_getprofessionalcredentialsstatus.asp`
- [ ] Criar `admin_sendcredentialsresetemail.asp`
- [ ] Modificar `admin_setadmprofessionals.asp` para retornar ID
- [ ] Alterar tabela `profissionais` no banco
- [ ] Configurar serviço de envio de e-mail
- [ ] Implementar hash de senhas
- [ ] Testar fluxo completo

---

## 7. Testes Recomendados

### Cenário 1: Criação de novo profissional
1. Cadastrar profissional novo
2. Verificar redirecionamento para tela de credenciais
3. Verificar sugestão de username
4. Criar credenciais
5. Verificar e-mail recebido

### Cenário 2: Username duplicado
1. Criar credenciais para profissional A
2. Tentar usar mesmo username para profissional B
3. Verificar mensagem de erro

### Cenário 3: Alteração de credenciais
1. Acessar tela via botão "Acesso"
2. Alterar username e/ou senha
3. Verificar persistência

### Cenário 4: Redefinição via link
1. Clicar em "Reenviar E-mail"
2. Acessar link recebido
3. Redefinir credenciais
4. Verificar se token expira após uso

---

## 8. Rotas do Frontend

| Rota | Propósito | Roles |
|------|-----------|-------|
| `/dashboard/professionals/credentials/:professionalId` | Criar/alterar credenciais | admin, manager |
| `/dashboard/professionals/credentials/:professionalId?mode=reset&token=xxx` | Redefinir via link | admin, manager |

---

## 9. Próximos Passos

1. **Backend**: Implementar as 4 APIs listadas
2. **Backend**: Configurar envio de e-mail
3. **Backend**: Modificar API de profissionais para retornar ID
4. **Testes**: Validar fluxo completo end-to-end
5. **Opcional**: Adicionar autenticação 2FA para profissionais
