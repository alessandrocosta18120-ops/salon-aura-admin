# Atualização: Suporte a 5 Cores nos Temas

## Resumo das Alterações Frontend

O frontend foi atualizado para suportar 5 cores em vez de 3 cores nos temas do salão:

### Cores Suportadas
1. **primaryColor** - Cor Primária
2. **secondaryColor** - Cor Secundária  
3. **accentColor** - Cor de Destaque
4. **successColor** - Cor de Sucesso (NOVO)
5. **warningColor** - Cor de Aviso (NOVO)

### Alterações Realizadas

1. **Interfaces TypeScript**
   - Atualizada `SalonData` para incluir `successColor` e `warningColor`
   - Atualizada `Theme` para incluir `successColor` e `warningColor`

2. **Estado Inicial**
   - Adicionadas cores padrão: `successColor: "#10b981"` e `warningColor: "#f59e0b"`

3. **Temas Pré-configurados**
   - Todos os 5 temas agora incluem as 5 cores
   - Azul, Rosa, Preto, Cinza, Verde

4. **Interface do Usuário**
   - Adicionados 2 novos campos de input para `successColor` e `warningColor`
   - Grid atualizado para exibir todas as 5 cores

5. **Função de Mudança de Tema**
   - `handleThemeChange` agora aplica todas as 5 cores ao selecionar um tema

## Alterações Necessárias no Backend (ASP)

### 1. API: admin_getsadmalon.asp (GET - Obter dados do salão)

**Resposta atual:**
```json
{
  "success": true,
  "data": {
    "name": "...",
    "primaryColor": "#3b82f6",
    "secondaryColor": "#8b5cf6",
    "accentColor": "#10b981",
    ...
  }
}
```

**Resposta atualizada (adicionar):**
```json
{
  "success": true,
  "data": {
    "name": "...",
    "primaryColor": "#3b82f6",
    "secondaryColor": "#8b5cf6",
    "accentColor": "#10b981",
    "successColor": "#10b981",
    "warningColor": "#f59e0b",
    ...
  }
}
```

### 2. API: admin_setsadmalon.asp (POST - Salvar dados do salão)

**Payload recebido (adicionar ao existente):**
```json
{
  "primaryColor": "#3b82f6",
  "secondaryColor": "#8b5cf6",
  "accentColor": "#10b981",
  "successColor": "#10b981",
  "warningColor": "#f59e0b",
  ...
}
```

**Ação necessária:**
- Adicionar campos `successColor` e `warningColor` no processamento
- Salvar os novos campos na tabela de salões

### 3. API: admin_getthemes.asp (GET - Obter temas disponíveis)

**Resposta atual:**
```json
{
  "success": true,
  "data": [
    {
      "id": "azul",
      "name": "Azul",
      "primaryColor": "#3b82f6",
      "secondaryColor": "#1e40af",
      "accentColor": "#06b6d4"
    }
  ]
}
```

**Resposta atualizada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "azul",
      "name": "Azul",
      "primaryColor": "#3b82f6",
      "secondaryColor": "#1e40af",
      "accentColor": "#06b6d4",
      "successColor": "#10b981",
      "warningColor": "#f59e0b"
    }
  ]
}
```

### 4. Estrutura da Tabela no Banco de Dados

**Adicionar campos na tabela de salões:**
```sql
ALTER TABLE tbl_saloes 
ADD successColor VARCHAR(7) DEFAULT '#10b981',
ADD warningColor VARCHAR(7) DEFAULT '#f59e0b';
```

**Adicionar campos na tabela de temas (se existir):**
```sql
ALTER TABLE tbl_temas 
ADD successColor VARCHAR(7) DEFAULT '#10b981',
ADD warningColor VARCHAR(7) DEFAULT '#f59e0b';
```

### 5. Exemplo de Código ASP para admin_setsadmalon.asp

```asp
' Receber os novos campos
Dim successColor, warningColor
successColor = Request.Form("successColor")
warningColor = Request.Form("warningColor")

' Validar formato hex
If Len(successColor) <> 7 Or Left(successColor, 1) <> "#" Then
  successColor = "#10b981" ' Valor padrão
End If

If Len(warningColor) <> 7 Or Left(warningColor, 1) <> "#" Then
  warningColor = "#f59e0b" ' Valor padrão
End If

' Incluir na query UPDATE
strSQL = "UPDATE tbl_saloes SET " & _
         "primaryColor = '" & Replace(primaryColor, "'", "''") & "', " & _
         "secondaryColor = '" & Replace(secondaryColor, "'", "''") & "', " & _
         "accentColor = '" & Replace(accentColor, "'", "''") & "', " & _
         "successColor = '" & Replace(successColor, "'", "''") & "', " & _
         "warningColor = '" & Replace(warningColor, "'", "''") & "' " & _
         "WHERE id = " & salonId
```

### 6. Exemplo de Código ASP para admin_getsadmalon.asp

```asp
' Adicionar os novos campos no SELECT
strSQL = "SELECT name, primaryColor, secondaryColor, accentColor, " & _
         "successColor, warningColor, ... " & _
         "FROM tbl_saloes WHERE id = " & salonId

' Incluir na resposta JSON
Response.Write "{'primaryColor':'" & rs("primaryColor") & "',"
Response.Write "'secondaryColor':'" & rs("secondaryColor") & "',"
Response.Write "'accentColor':'" & rs("accentColor") & "',"
Response.Write "'successColor':'" & rs("successColor") & "',"
Response.Write "'warningColor':'" & rs("warningColor") & "'}"
```

## Testes Recomendados

1. ✅ Verificar que os novos campos são salvos corretamente
2. ✅ Verificar que os novos campos são retornados nas APIs GET
3. ✅ Testar a seleção de temas pré-configurados com 5 cores
4. ✅ Testar a personalização individual de cada uma das 5 cores
5. ✅ Verificar retrocompatibilidade com registros antigos (usar valores padrão se os campos não existirem)

## Valores Padrão Recomendados

- **successColor**: `#10b981` (verde)
- **warningColor**: `#f59e0b` (âmbar/laranja)

Estes valores estão alinhados com o design system do index.css.
