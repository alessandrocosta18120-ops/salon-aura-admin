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

## Observações Finais

1. A API `admin_sendrecoveryemail.asp` precisa ser implementada no backend ASP
2. Recomenda-se implementar rate limiting para evitar spam de e-mails
3. Tokens de recuperação devem ter expiração de 24 horas por segurança
4. Logs de tentativas de recuperação devem ser mantidos para auditoria
