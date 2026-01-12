# Plano de Implementação das Alterações - 11/01/2026

## Resumo Executivo

Este documento detalha as alterações implementadas no sistema de gestão de agendamentos na data de 11 de janeiro de 2026.

---

## 1. Correção da Exibição de Data no Bloqueio de Horários

### Problema Identificado
A API retorna a data no formato ISO completo (`"2026-01-09T00:00:00"`), porém o código adicionava novamente `'T00:00:00'` ao valor, resultando em uma string inválida como `"2026-01-09T00:00:00T00:00:00"`, que gerava "Data Inválida" na exibição.

### Solução Implementada
Modificado o arquivo `src/pages/TimeBlocks.tsx` para verificar se a data já contém o caractere `'T'` antes de concatenar:

```typescript
// Antes (problemático):
{new Date(block.date + 'T00:00:00').toLocaleDateString('pt-BR')}

// Depois (corrigido):
{new Date(block.date.includes('T') ? block.date : block.date + 'T00:00:00').toLocaleDateString('pt-BR')}
```

### Arquivos Alterados
- `src/pages/TimeBlocks.tsx` (linhas 395 e 508)

---

## 2. Tela de Recuperação de Credenciais

### Problema Identificado
Os links "Esqueci minha senha" e "Esqueci meu usuário" na tela de login não direcionavam para uma tela funcional de recuperação.

### Solução Implementada

#### 2.1 Nova Página Criada
Arquivo: `src/pages/CredentialsRecovery.tsx`

Funcionalidades:
- Campo para inserção do e-mail cadastrado
- Suporte para dois tipos de recuperação via query parameter (`?type=password` ou `?type=username`)
- Validação de e-mail obrigatório
- Feedback visual de loading e sucesso
- Tela de confirmação após envio bem-sucedido
- Botão para retornar ao login

#### 2.2 Alterações no Login
Arquivo: `src/pages/Login.tsx`

- Link "Esqueci minha senha" → direciona para `/credentials/recovery?type=password`
- Link "Esqueci meu usuário" → direciona para `/credentials/recovery?type=username`

#### 2.3 Nova Rota
Arquivo: `src/App.tsx`

```typescript
<Route path="/credentials/recovery" element={<CredentialsRecovery />} />
```

#### 2.4 Nova Função de API
Arquivo: `src/lib/api.ts`

```typescript
sendRecoveryEmail: (email: string, type: string) => 
  apiCall('sendrecoveryemail', { email, type }, 'POST', false),
```

### API Backend Necessária

**Endpoint:** `POST /admin/api/admin_sendrecoveryemail.asp`

**Request:**
```json
{
  "email": "profissional@email.com",
  "type": "password" | "username"
}
```

**Response (sucesso):**
```json
{
  "success": true,
  "message": "Link de recuperação enviado com sucesso"
}
```

**Response (erro):**
```json
{
  "success": false,
  "error": "E-mail não encontrado no sistema"
}
```

**Lógica Requerida no Backend:**
1. Buscar profissional pelo e-mail na tabela de profissionais
2. Se não encontrado, retornar erro
3. Gerar token de recuperação com expiração (recomendado: 24 horas)
4. Armazenar token no banco de dados
5. Enviar e-mail com link no formato: `/credentials/reset/{professionalId}?mode=reset&token={token}`

---

## 3. Responsividade da Tela de Agendamentos

### Problema Identificado
A página `Appointments.tsx` encapsulava o componente `AppointmentDetails` dentro de Cards adicionais, criando layout duplicado e problemas de largura que faziam o conteúdo ultrapassar a tela em dispositivos móveis.

### Solução Implementada
Simplificado o arquivo `src/pages/Appointments.tsx`:

```typescript
const Appointments = () => {
  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <PageHeader 
        title="Gestão de Agendamentos"
        description="Visualize e gerencie todos os agendamentos"
        showBack={false}
      />
      <AppointmentDetails onBack={() => {}} />
    </div>
  );
};
```

### Alterações:
- Removido Card wrapper duplicado
- Removido seletor de data redundante (já existe no AppointmentDetails)
- Adicionadas classes `w-full`, `max-w-full` e `overflow-x-hidden` ao container

---

## Resumo das Alterações por Arquivo

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/pages/TimeBlocks.tsx` | Modificado | Correção do parsing de data ISO |
| `src/pages/CredentialsRecovery.tsx` | **Criado** | Tela de recuperação de credenciais |
| `src/pages/Login.tsx` | Modificado | Links de recuperação atualizados |
| `src/App.tsx` | Modificado | Nova rota `/credentials/recovery` |
| `src/lib/api.ts` | Modificado | Função `sendRecoveryEmail` adicionada |
| `src/pages/Appointments.tsx` | Modificado | Estrutura simplificada e responsiva |
| `2026-01-11_plano_implementacao_alteracoes.md` | **Criado** | Este documento |

---

## APIs Backend Necessárias

### 1. API de Envio de E-mail de Recuperação (NOVA)

| Campo | Valor |
|-------|-------|
| **Endpoint** | `POST /admin/api/admin_sendrecoveryemail.asp` |
| **Autenticação** | Não requerida (público) |
| **Content-Type** | `application/json` |

### 2. APIs Existentes Utilizadas

- `admin_validateresettoken.asp` - Validação de token de reset
- `admin_checkusernamepublic.asp` - Verificação de username via token
- `admin_setprofessionalcredentialspublic.asp` - Persistência de credenciais via token

---

## Checklist de Testes

### Bloqueio de Horários
- [ ] Datas no formato `"2026-01-09T00:00:00"` exibem corretamente como "09/01/2026"
- [ ] Datas no formato `"2026-01-09"` continuam funcionando

### Recuperação de Credenciais
- [ ] Link "Esqueci minha senha" abre tela com título "Recuperar Senha"
- [ ] Link "Esqueci meu usuário" abre tela com título "Recuperar Usuário"
- [ ] Validação de e-mail obrigatório funciona
- [ ] Loading é exibido durante envio
- [ ] Tela de sucesso é exibida após envio bem-sucedido
- [ ] Botão "Voltar ao Login" funciona em ambas as telas

### Responsividade de Agendamentos
- [ ] Página de agendamentos não ultrapassa largura da tela em mobile
- [ ] Navegação de datas funciona corretamente
- [ ] Cards de agendamento empilham verticalmente em telas pequenas

---

## 4. Página Pública de Redefinição de Senha

### Descrição
Nova página pública acessada através de link enviado por e-mail para redefinição de senha. Permite que profissionais definam uma nova senha sem precisar do username.

### Solução Implementada

#### 4.1 Nova Página Criada
Arquivo: `src/pages/PublicPasswordReset.tsx`

Funcionalidades:
- Validação automática do token ao carregar a página
- Exibição do nome do profissional para confirmação visual
- Campo de nova senha com validação em tempo real
- Campo de confirmação de senha
- Indicadores visuais de requisitos da senha (6+ caracteres, letras e números)
- Feedback de sucesso/erro com toast notifications
- Tela de sucesso após redefinição bem-sucedida
- Tratamento de token inválido/expirado

#### 4.2 Rota Adicionada
Arquivo: `src/App.tsx`

```typescript
<Route path="/credentials/password-reset" element={<PublicPasswordReset />} />
```

#### 4.3 Funções de API Adicionadas
Arquivo: `src/lib/api.ts`

```typescript
// Valida token de redefinição de senha (público)
validatePasswordResetToken: (token: string) => 
  apiCall('validatepasswordresettoken', { token }, 'GET', false),

// Redefine a senha usando token (público)
resetPassword: (data: { token: string; password: string }) => 
  apiCall('resetpassword', data, 'POST', false),
```

### APIs Backend Necessárias

#### API de Validação de Token de Senha
**Endpoint:** `GET /admin/api/admin_validatepasswordresettoken.asp`

**Request:**
```
?token={token}
```

**Response (sucesso):**
```json
{
  "success": true,
  "data": {
    "professionalId": "123",
    "professionalName": "João Silva",
    "email": "joao@email.com"
  }
}
```

**Response (erro):**
```json
{
  "success": false,
  "error": "Token inválido ou expirado"
}
```

#### API de Redefinição de Senha
**Endpoint:** `POST /admin/api/admin_resetpassword.asp`

**Request:**
```json
{
  "token": "abc123...",
  "password": "novaSenha123"
}
```

**Response (sucesso):**
```json
{
  "success": true,
  "message": "Senha redefinida com sucesso"
}
```

**Response (erro):**
```json
{
  "success": false,
  "error": "Token inválido ou expirado"
}
```

**Lógica Requerida no Backend:**
1. Validar token e verificar expiração
2. Hash da nova senha com algoritmo seguro (ex: bcrypt)
3. Atualizar senha na tabela de profissionais
4. Invalidar o token após uso
5. Retornar sucesso ou erro

### Fluxo Completo de Recuperação de Senha

1. Usuário clica em "Esqueci minha senha" na tela de login
2. Sistema redireciona para `/credentials/recovery?type=password`
3. Usuário insere e-mail e clica em "Enviar Link"
4. Backend envia e-mail com link: `/credentials/password-reset?token={token}`
5. Usuário clica no link e acessa a página de redefinição
6. Página valida token automaticamente via `validatePasswordResetToken`
7. Usuário define nova senha e confirmação
8. Sistema envia nova senha via `resetPassword`
9. Backend valida, atualiza senha e invalida token
10. Usuário é redirecionado para login

---

## Resumo Atualizado das Alterações por Arquivo

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/pages/TimeBlocks.tsx` | Modificado | Correção do parsing de data ISO |
| `src/pages/CredentialsRecovery.tsx` | **Criado** | Tela de recuperação de credenciais |
| `src/pages/PublicPasswordReset.tsx` | **Criado** | Tela pública de redefinição de senha |
| `src/pages/Login.tsx` | Modificado | Links de recuperação atualizados |
| `src/App.tsx` | Modificado | Rotas `/credentials/recovery` e `/credentials/password-reset` |
| `src/lib/api.ts` | Modificado | Funções `sendRecoveryEmail`, `validatePasswordResetToken`, `resetPassword` |
| `src/pages/Appointments.tsx` | Modificado | Estrutura simplificada e responsiva |
| `2026-01-11_plano_implementacao_alteracoes.md` | **Criado** | Este documento |

---

## APIs Backend Necessárias (Resumo Completo)

| Endpoint | Método | Autenticação | Descrição |
|----------|--------|--------------|-----------|
| `admin_sendrecoveryemail.asp` | POST | Não | Envia e-mail de recuperação |
| `admin_validatepasswordresettoken.asp` | GET | Não | Valida token de redefinição de senha |
| `admin_resetpassword.asp` | POST | Não | Redefine senha usando token |

---

## Checklist de Testes Atualizado

### Bloqueio de Horários
- [ ] Datas no formato `"2026-01-09T00:00:00"` exibem corretamente como "09/01/2026"
- [ ] Datas no formato `"2026-01-09"` continuam funcionando

### Recuperação de Credenciais
- [ ] Link "Esqueci minha senha" abre tela com título "Recuperar Senha"
- [ ] Link "Esqueci meu usuário" abre tela com título "Recuperar Usuário"
- [ ] Validação de e-mail obrigatório funciona
- [ ] Loading é exibido durante envio
- [ ] Tela de sucesso é exibida após envio bem-sucedido
- [ ] Botão "Voltar ao Login" funciona em ambas as telas

### Página de Redefinição de Senha
- [ ] Página valida token automaticamente ao carregar
- [ ] Token inválido exibe mensagem de erro apropriada
- [ ] Nome do profissional é exibido corretamente
- [ ] Validação de senha em tempo real funciona
- [ ] Confirmação de senha deve coincidir
- [ ] Indicadores visuais de requisitos da senha funcionam
- [ ] Botão desabilitado quando validações não passam
- [ ] Após sucesso, exibe tela de confirmação
- [ ] Botão "Ir para Login" funciona

### Responsividade de Agendamentos
- [ ] Página de agendamentos não ultrapassa largura da tela em mobile
- [ ] Navegação de datas funciona corretamente
- [ ] Cards de agendamento empilham verticalmente em telas pequenas

---

## Observações Finais

1. As APIs `admin_sendrecoveryemail.asp`, `admin_validatepasswordresettoken.asp` e `admin_resetpassword.asp` precisam ser implementadas no backend ASP
2. Recomenda-se implementar rate limiting para evitar spam de e-mails e ataques de força bruta
3. Tokens de recuperação devem ter expiração de 24 horas por segurança
4. Tokens devem ser invalidados após uso único
5. Logs de tentativas de recuperação devem ser mantidos para auditoria
6. Senhas devem ser hasheadas com algoritmo seguro (bcrypt ou similar) no backend
