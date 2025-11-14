# Alterações Necessárias nas APIs

Este documento lista todas as alterações necessárias nas APIs do backend ASP Classic para suportar as novas funcionalidades implementadas no frontend.

## 1. API de Horários Bloqueados (setadmtimeblock)

### Campos Adicionais Necessários:
- `userId` - ID do usuário logado (profissional)
- `salonId` - ID do salão
- `isRecurring` - Boolean indicando se o bloqueio é recorrente
- `recurrenceType` - Tipo de recorrência: "weekdays", "all_days" ou "day_of_week"

### Exemplo de Payload:
```json
{
  "professionalId": "123",
  "date": "2025-01-15",
  "startTime": "12:00",
  "endTime": "13:00",
  "reason": "Almoço",
  "userId": "456",
  "salonId": "789",
  "isRecurring": true,
  "recurrenceType": "weekdays"
}
```

### Lógica de Recorrência:
- **all_days**: Bloquear o horário especificado em todos os dias
- **weekdays**: Bloquear apenas em dias úteis (segunda a sexta)
- **day_of_week**: Bloquear apenas no dia da semana correspondente (ex: todas as segundas)

## 2. API de Feriados (setadmdates)

### Campos Adicionais Necessários:
- `userId` - ID do usuário logado
- `salonId` - ID do salão
- `isRecurring` - Boolean indicando se o feriado se repete anualmente

### Exemplo de Payload:
```json
{
  "date": "2025-12-25",
  "name": "Natal",
  "userId": "456",
  "salonId": "789",
  "isRecurring": true
}
```

### Lógica de Recorrência:
- Se `isRecurring` = true, o feriado deve ser aplicado automaticamente todos os anos na mesma data (dia/mês)

## 3. API de Clientes Fixos (setadmfixedclient)

### Campos Adicionais Necessários:
- `userId` - ID do usuário logado (profissional)
- `salonId` - ID do salão

### Exemplo de Payload:
```json
{
  "clientName": "João Silva",
  "clientPhone": "11999999999",
  "clientEmail": "joao@email.com",
  "userId": "456",
  "salonId": "789"
}
```

## 4. API de Configurações Gerais (setadmsettings)

### Campos Consolidados:
Todas as configurações agora devem ser salvas em uma única API:
- Configurações de notificação
- **Mensagem de confirmação de agendamento** (antes em API separada)
- Configurações de cancelamento
- Tamanho do slot (30 ou 60 minutos)
- Configurações de segurança

### Exemplo de Payload:
```json
{
  "salonId": "789",
  "sendSocialLinks": true,
  "confirmationMessage": "Seu agendamento foi confirmado!",
  "confirmationEnabled": true,
  "confirmationTiming": "previous_day",
  "confirmationSendTime": "18:00",
  "slotSize": 30,
  "minCancelDays": 1,
  "allowSameDayCancel": false,
  "twoFactorAuth": true,
  "notificationMethod": "both"
}
```

## 5. API de Temas (getadmthemes e setadmtheme)

### Estrutura de Tema Atualizada:
Os temas agora devem retornar e aceitar os seguintes campos:

#### GET (getadmthemes):
```json
[
  {
    "id": "1",
    "name": "Azul Profissional",
    "primary": "215 84% 45%",
    "primaryForeground": "0 0% 10%",
    "secondary": "265 25% 55%",
    "background": "0 0% 100%",
    "foreground": "215 25% 27%"
  }
]
```

#### SET (setadmtheme):
```json
{
  "salonId": "789",
  "themeId": "1",
  "customizations": {
    "primary": "215 84% 45%",
    "primaryForeground": "0 0% 10%",
    "secondary": "265 25% 55%",
    "background": "0 0% 100%",
    "foreground": "215 25% 27%"
  }
}
```

### Campos do Tema:
- `name` - Nome descritivo do tema
- `primary` - Cor primária (HSL)
- `primaryForeground` - Cor do texto sobre o primário (HSL)
- `secondary` - Cor secundária (HSL)
- `background` - Cor de fundo (HSL)
- `foreground` - Cor do texto principal (HSL)

**IMPORTANTE**: Todas as cores devem estar no formato HSL (Hue Saturation Lightness), por exemplo: "215 84% 45%"

## 6. API de Serviços (setadmservices)

### Confirmação de Envio:
Certificar que a API está recebendo e salvando corretamente o array `professionalIds` tanto na **criação** quanto na **atualização** de serviços.

### Exemplo de Payload:
```json
{
  "id": "123",
  "name": "Corte de Cabelo",
  "description": "Corte masculino completo",
  "duration": 60,
  "price": 50.00,
  "professionalIds": ["prof1", "prof2", "prof3"],
  "isActive": true,
  "salonId": "789"
}
```

## 7. APIs de Deleção

### Novas APIs Necessárias:
As seguintes APIs de deleção devem aceitar apenas o ID do item a ser deletado:

#### deleteadmprofessional
```json
{
  "id": "123"
}
```

#### deleteadmservice
```json
{
  "id": "456"
}
```

#### deleteadmtimeblock
```json
{
  "id": "789"
}
```

### Comportamento Esperado:
- Todas as APIs de delete devem retornar `{"success": true}` em caso de sucesso
- Em caso de erro, retornar `{"success": false, "error": "Mensagem de erro"}`
- **AVISO**: O frontend exibe um alerta de confirmação em **VERMELHO** antes de deletar, com a mensagem: "TEM CERTEZA QUE DESEJA APAGAR O ITEM SELECIONADO?"

## 8. API de Agendamentos (getadmappointments)

### Campos Adicionais Necessários no Retorno:
Para suportar a funcionalidade de envio de lembretes, a API deve retornar:

```json
[
  {
    "id": "appt1",
    "time": "10:00",
    "clientName": "Maria Santos",
    "clientPhone": "11988887777",
    "professionalName": "João Silva",
    "professionalPhone": "11999998888",
    "serviceName": "Corte",
    "duration": 60,
    "status": "confirmed"
  }
]
```

**Campo Novo**: `professionalPhone` - Necessário para envio de lembretes via WhatsApp

## 9. Filtros por Profissional

As seguintes APIs devem aceitar e filtrar por `professionalId` quando fornecido:

- `getadmtimeblocks` - Listar apenas bloqueios do profissional
- `getadmdates` - Listar apenas feriados/datas bloqueadas do profissional
- `getadmappointments` - Listar apenas agendamentos do profissional

### Exemplo de Query:
```
GET /admin/api/getadmtimeblocks?professionalId=123&salonId=789
```

## Resumo de Prioridades

### Alta Prioridade (Funcionalidades Críticas):
1. ✅ Bloqueios recorrentes (isRecurring + recurrenceType)
2. ✅ Feriados recorrentes (isRecurring)
3. ✅ Envio de userId e salonId em todas as operações
4. ✅ APIs de deleção
5. ✅ Campo professionalPhone nos agendamentos

### Média Prioridade (Melhorias):
6. ✅ Campos de tema (name, primaryForeground, background)
7. ✅ Consolidação de configurações
8. ✅ Filtros por profissional

### Notas Adicionais:
- Todas as cores devem estar no formato HSL
- O `salonId` deve ser validado em todas as operações
- O `userId` identifica o profissional logado
- Implementar validação de dados em todas as APIs
- Logs de auditoria são recomendados para operações de delete
