# Plano de Implementação - 04/02/2026

## Resumo das Alterações

### 1. Checkbox "Exibir mapa na página" - Configuração do Salão

**Arquivo alterado:** `src/pages/SalonManagement.tsx`

**Descrição:** Adicionado checkbox abaixo do campo de endereço para controlar a exibição do mapa na página pública do salão.

**Alterações Frontend:**
- Adicionado campo `showMap: boolean` na interface `SalonData`
- Adicionado estado inicial `showMap: false` no useState
- Atualizado `handleInputChange` para aceitar valores `boolean`
- Adicionado componente Checkbox com label "Exibir mapa na página"

**Alterações Backend Necessárias:**

1. **API `admin_setsadmalon.asp`:**
   - Receber novo parâmetro: `showMap` (boolean)
   - Salvar valor no banco de dados

2. **API `admin_getsadmalon.asp`:**
   - Retornar campo `showMap` nos dados do salão

3. **Database:**
   - Adicionar coluna na tabela de salões:
   ```sql
   ALTER TABLE salons ADD COLUMN show_map BIT DEFAULT 0;
   ```

4. **Página Pública:**
   - Verificar valor de `showMap` antes de renderizar o mapa
   - Se `showMap = true`, exibir iframe do Google Maps com o endereço

---

### 2. Correção de Cores dos Profissionais no Dashboard

**Arquivo alterado:** `src/pages/Dashboard.tsx`

**Descrição:** Corrigido o estilo dos agendamentos para garantir que a cor do profissional (vinda da API) seja aplicada corretamente como fundo, com texto branco para melhor contraste.

**Problema identificado:**
- O texto estava configurado como preto (`text-black`), o que causava baixo contraste em cores HSL mais escuras ou saturadas

**Solução aplicada:**
- Alterado texto para branco (`text-white`) com sombra para garantir legibilidade
- Adicionado `textShadow` para melhorar contraste em qualquer cor de fundo
- A função `getProfessionalColor()` já busca corretamente a cor do profissional da API

**Nenhuma alteração backend necessária** - A API `admin_getadmprofessionals.asp` já retorna o campo `color` corretamente no formato HSL.

---

## Checklist de Implementação

### Frontend ✅
- [x] Adicionar campo `showMap` na interface SalonData
- [x] Adicionar checkbox na tela de configuração do salão
- [x] Incluir `showMap` no payload enviado à API
- [x] Corrigir contraste de texto nos agendamentos do Dashboard

### Backend (Pendente)
- [ ] Alterar API `admin_setsadmalon.asp` para receber `showMap`
- [ ] Alterar API `admin_getsadmalon.asp` para retornar `showMap`
- [ ] Adicionar coluna `show_map` na tabela de salões
- [ ] Implementar lógica de exibição do mapa na página pública

---

## Observações

1. **Cores dos Profissionais:** As cores são definidas individualmente para cada profissional através do formulário de profissionais. O formato esperado é HSL (ex: `hsl(200, 70%, 50%)`).

2. **Mapa na Página Pública:** Quando `showMap` for `true`, a página pública deve renderizar um iframe do Google Maps usando o endereço do salão como parâmetro de busca.

3. **Fallback de Cores:** Se um profissional não tiver cor definida, o sistema usa uma paleta de cores predefinida baseada no índice do profissional.
