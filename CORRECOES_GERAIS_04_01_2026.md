# Correções Gerais - 04/01/2026

## Resumo das Correções Implementadas

### 1. Dias da Semana (workingDays)

**Problema:** O mapeamento dos dias da semana estava incorreto em algumas telas. A API usa: 1=Domingo, 2=Segunda, ..., 7=Sábado.

**Arquivos corrigidos:**
- `src/pages/SalonManagement.tsx` - Corrigido mapeamento
- `src/pages/ProfessionalsManagement.tsx` - Corrigido mapeamento + ordenação na exibição

**Mapeamento oficial:**
| ID | Dia |
|----|-----|
| 1 | Domingo |
| 2 | Segunda-feira |
| 3 | Terça-feira |
| 4 | Quarta-feira |
| 5 | Quinta-feira |
| 6 | Sexta-feira |
| 7 | Sábado |

### 2. Dashboard - Filtro por Perfil de Usuário

**Problema:** Todos os links e atalhos eram visíveis para todos os usuários, independente do role.

**Correção aplicada em `src/pages/Dashboard.tsx`:**
- Ações rápidas filtradas por role
- Card "Clientes Cadastrados" oculto para staff
- Importação do sessionManager para ler o role

**Permissões:**
| Elemento | Admin | Manager | Staff |
|----------|-------|---------|-------|
| Ações Rápidas | ✅ | ✅ | ❌ |
| Card Clientes | ✅ | ✅ | ❌ |
| Stats cards | ✅ | ✅ | ✅ |

### 3. Proteção de Rotas

**Novo componente:** `src/components/auth/RequireRole.tsx`

**Funcionalidade:**
- Verifica autenticação (redireciona para /login se não autenticado)
- Verifica role do usuário
- Exibe toast "Acesso negado" e redireciona para /dashboard se não autorizado

**Rotas protegidas em `src/App.tsx`:**
| Rota | Roles Permitidos |
|------|------------------|
| /dashboard/salon | admin, manager |
| /dashboard/professionals | admin, manager |
| /dashboard/services | admin, manager |
| /dashboard/clients | admin, manager |
| /dashboard/financial | admin, manager |
| /dashboard/settings | admin, manager |
| /dashboard/users | admin |
| /dashboard/time-blocks | todos |
| /dashboard/appointments | todos |

### 4. Máscara de Preço (currencyMask)

**Problema:** Ao digitar "35", o campo exibia "R$ 0,35" em vez de "R$ 35,00".

**Correção em `src/lib/masks.ts`:**
- Se a string contém vírgula/ponto, interpreta como decimal
- Se contém apenas dígitos, interpreta como reais inteiros

**Comportamento:**
- `35` → `R$ 35,00`
- `35,50` → `R$ 35,50`
- `35.50` → `R$ 35,50`

### 5. Edição de Cliente Fixo

**Problema:** Campos Select não preenchiam corretamente ao editar.

**Correções em `src/components/ClientsManagement.tsx`:**
- Normalização de dados da API (weekDay, professionalId, serviceId para string)
- handleEditFixedClient converte valores para string
- Payload usa getUserId() e inclui slug

### 6. Recorrência em Bloqueios de Horário

**Problema:** Campo recurrenceType da API não era exibido na listagem.

**Correção em `src/pages/TimeBlocks.tsx`:**
- Nova função `getRecurrenceLabel()` para traduzir tipos
- Exibição do tipo de recorrência na listagem

**Traduções:**
| Valor API | Exibição |
|-----------|----------|
| all_days | Todos os Dias |
| weekdays | Dias Úteis |
| day_of_week | Mesmo Dia da Semana |

---

## Checklist de Testes

### Dias da Semana
- [ ] Abrir "Configurar Salão" → marcar Domingo e Sábado → salvar → reabrir → verificar se estão marcados corretamente
- [ ] Abrir "Gerenciar Profissionais" → verificar coluna "Dias de Trabalho" exibe corretamente

### Dashboard por Perfil
- [ ] Login como Admin → ver todos os atalhos e card de clientes
- [ ] Login como Staff → não ver atalhos nem card de clientes

### Proteção de Rotas
- [ ] Login como Staff → tentar acessar `#/dashboard/clients` diretamente → deve redirecionar
- [ ] Login como Manager → tentar acessar `#/dashboard/users` → deve redirecionar

### Preço do Serviço
- [ ] Criar novo serviço → digitar 35 → campo deve exibir "R$ 35,00"
- [ ] Editar serviço existente → preço deve exibir corretamente

### Cliente Fixo
- [ ] Clicar "Alterar" em cliente fixo → todos os Selects devem vir preenchidos
- [ ] Salvar alteração → verificar se atualizou corretamente

### Bloqueios de Horário
- [ ] Criar bloqueio recorrente "Todos os dias"
- [ ] Verificar listagem exibe "🔄 Todos os Dias"
