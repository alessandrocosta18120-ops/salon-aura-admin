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

### Responsividade de Gerenciamento de Usuários
- [ ] Cards de níveis de acesso empilham em coluna no mobile
- [ ] Tabela de usuários substitui por cards no mobile
- [ ] Botões de ação acessíveis em telas pequenas

---

## 5. Melhorias de Responsividade e UX (12/01/2026)

### 5.1 Componente AppointmentDetails
Arquivo: `src/components/AppointmentDetails.tsx`

**Alterações:**
- Container principal com `w-full max-w-full overflow-x-hidden`
- Cabeçalho ajustado para `flex-col sm:flex-row`
- Botões de navegação de data com texto descritivo em mobile
- Calendário ocupa largura total em mobile (`w-full sm:w-[280px]`)
- Títulos com tamanho responsivo (`text-2xl sm:text-3xl`)

### 5.2 Página de Gerenciamento de Usuários
Arquivo: `src/pages/UsersManagement.tsx`

**Alterações:**
- Container principal com `w-full max-w-full overflow-x-hidden`
- Grid de níveis de acesso: `grid-cols-1 md:grid-cols-3`
- Tabela de usuários visível apenas em desktop (`hidden md:block`)
- Cards de usuários visíveis apenas em mobile (`md:hidden`)
- Cada card exibe nome, e-mail (com quebra de linha), status, permissão e ações
- Padding responsivo do CardContent (`p-4 sm:p-6`)

### 5.3 Aviso de Cadastro na Tela de Login
Arquivo: `src/pages/Login.tsx`

**Alteração:**
Adicionado aviso abaixo do formulário de login:

```jsx
<div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
  <p className="text-sm text-muted-foreground text-center">
    Não tem cadastro ainda no datebook?{" "}
    <span className="font-medium text-foreground">
      Cadastre-se para usar a plataforma.
    </span>{" "}
    Acesse{" "}
    <a 
      href="https://datebook.com.br" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-primary hover:text-primary-hover underline font-medium"
    >
      datebook.com.br
    </a>{" "}
    e organize a sua agenda!
  </p>
</div>
```

---

## 6. Novo Dashboard com Calendário e Slots de Agendamento

### Descrição
O Dashboard foi completamente redesenhado para exibir um calendário navegável com slots de horário, permitindo gestão visual de agendamentos diretamente na tela principal.

### Funcionalidades Implementadas

#### 6.1 Calendário Navegável
- Calendário exibido no topo com navegação por dia e mês
- Botões para avançar/retroceder dias
- Botões para avançar/retroceder meses
- Clique no dia seleciona e carrega os slots correspondentes

#### 6.2 Slots de Horários
- Slots gerados automaticamente com base no horário de funcionamento e tamanho do slot (30 ou 60 min)
- Slots vazios exibem botão para criar novo agendamento
- Slots ocupados exibem informações do cliente, serviço e profissional

#### 6.3 Cores por Profissional
- Quando há múltiplos profissionais, cada um recebe uma cor única
- Cor pode vir da API (campo `color` do profissional)
- Fallback para paleta de 8 cores HSL predefinidas
- Legenda exibida apenas quando há mais de um profissional ativo

#### 6.4 Menu de Ações do Agendamento
Ao clicar em um slot com agendamento, abre-se um dialog com:

| Botão | Cor | Ação |
|-------|-----|------|
| Ligar | Outline | Abre discador telefônico |
| WhatsApp | Outline | Envia mensagem padrão de confirmação |
| Confirmar via WhatsApp | Verde (success) | Envia texto de confirmação da API |
| Reagendar | Amarelo (warning) | Abre dialog para nova data/hora |
| Cancelar | Vermelho (destructive) | Cancela com confirmação |

#### 6.5 Cancelamento de Agendamento
- AlertDialog de confirmação antes de cancelar
- Mensagem clara: "Esta ação não poderá ser desfeita"
- Envia para API com `action: 'cancel'`

#### 6.6 Reagendamento
- Dialog com seletor de nova data (calendário)
- Select com horários disponíveis
- Envia para API com `action: 'reschedule'`, nova `date` e `time`

#### 6.7 Novo Agendamento em Slot Vazio
- Campos: Nome do Cliente, WhatsApp, Profissional, Serviço
- Validação de campos obrigatórios
- Envia para API com `action: 'create'`

#### 6.8 Resumo do Dia (Rodapé)
- Mantido o card de resumo com:
  - Total de agendamentos
  - Confirmados (verde)
  - Pendentes (amarelo)

#### 6.9 Remoções
- Removidos os cards de estatísticas antigos
- Removidos os botões de "Ações Rápidas" (links do menu lateral são suficientes)
- Removido o card "Clientes Cadastrados"

### Arquivo Alterado
- `src/pages/Dashboard.tsx` - Reescrito completamente

### APIs Utilizadas

| API | Método | Uso |
|-----|--------|-----|
| `getadmprofessionals` | GET | Lista profissionais ativos |
| `getadmservices` | GET | Lista serviços ativos |
| `getadmsalon` | GET | Horário de funcionamento e texto de confirmação |
| `getadmslotsize` | GET | Tamanho do slot (30/60 min) |
| `getadmappointmentsbydate` | GET | Agendamentos do dia selecionado |
| `setadmappointments` | POST | Criar/alterar/cancelar agendamentos |

### Payload para setadmappointments

**Cancelar:**
```json
{
  "id": "appointment_id",
  "status": "cancelled",
  "action": "cancel"
}
```

**Reagendar:**
```json
{
  "id": "appointment_id",
  "date": "2026-01-22",
  "time": "14:30",
  "action": "reschedule"
}
```

**Criar:**
```json
{
  "clientName": "Maria Silva",
  "clientPhone": "(11) 99999-9999",
  "professionalId": "prof_id",
  "serviceId": "service_id",
  "date": "2026-01-22",
  "time": "10:00",
  "action": "create"
}
```

### Campo Opcional na API de Profissionais
Para cores customizadas por profissional, a API `getadmprofessionals` pode retornar:
```json
{
  "id": "prof_id",
  "name": "João",
  "color": "hsl(200, 70%, 50%)",
  "isActive": true
}
```

Se `color` estiver ausente ou vazio, o sistema usa cores fallback.

---

## Resumo Atualizado das Alterações por Arquivo (22/01/2026)

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/pages/Dashboard.tsx` | **Reescrito** | Novo layout com calendário e slots de agendamento |
| `src/pages/TimeBlocks.tsx` | Modificado | Correção do parsing de data ISO |
| `src/pages/CredentialsRecovery.tsx` | Criado | Tela de recuperação de credenciais |
| `src/pages/PublicPasswordReset.tsx` | Criado | Tela pública de redefinição de senha |
| `src/pages/Login.tsx` | Modificado | Links de recuperação + aviso de cadastro |
| `src/App.tsx` | Modificado | Rotas públicas de credenciais |
| `src/lib/api.ts` | Modificado | Funções de recuperação de credenciais |
| `src/pages/Appointments.tsx` | Modificado | Estrutura simplificada e responsiva |
| `src/components/AppointmentDetails.tsx` | Modificado | Layout responsivo para mobile |
| `src/pages/UsersManagement.tsx` | Modificado | Cards para mobile, tabela para desktop |
| `2026-01-11_plano_implementacao_alteracoes.md` | Atualizado | Este documento |

---

## Checklist de Testes do Novo Dashboard

### Calendário e Navegação
- [ ] Calendário exibe mês/ano atual corretamente
- [ ] Botões de navegação de mês funcionam
- [ ] Botões de navegação de dia funcionam
- [ ] Clique no dia do calendário seleciona e carrega slots
- [ ] Data selecionada é destacada visualmente

### Slots de Horários
- [ ] Slots são gerados com base no horário de funcionamento
- [ ] Slots respeitam o tamanho configurado (30 ou 60 min)
- [ ] Slot vazio exibe botão "Horário disponível"
- [ ] Slot com agendamento exibe dados do cliente/serviço

### Cores de Profissionais
- [ ] Legenda só aparece quando há 2+ profissionais
- [ ] Cada profissional tem cor distinta
- [ ] Cor da API é usada quando disponível
- [ ] Fallback funciona quando cor não está na API

### Ações do Agendamento
- [ ] Clicar em slot ocupado abre menu de ações
- [ ] Botão Ligar abre discador
- [ ] Botão WhatsApp envia mensagem padrão
- [ ] Botão Confirmar envia texto customizado
- [ ] Botão Reagendar abre dialog com calendário e horários
- [ ] Botão Cancelar exibe confirmação antes de cancelar
- [ ] Após cancelar, slot é atualizado

### Novo Agendamento
- [ ] Clicar em slot vazio abre formulário
- [ ] Campos obrigatórios são validados
- [ ] Select de profissionais exibe apenas ativos
- [ ] Select de serviços exibe apenas ativos
- [ ] Após criar, slot é atualizado com novo agendamento

### Resumo do Dia
- [ ] Card de resumo exibe totais corretos
- [ ] Cores indicam status (confirmado/pendente)

---

## Observações Finais

1. As APIs de credenciais precisam ser implementadas no backend ASP
2. Recomenda-se implementar rate limiting para segurança
3. Tokens de recuperação devem ter expiração de 24 horas
4. Tokens devem ser invalidados após uso único
5. O campo `color` nos profissionais é opcional (fallback automático)
6. O campo `action` nos payloads de agendamento ajuda o backend a diferenciar operações
7. Todas as páginas são responsivas e funcionam em dispositivos móveis
