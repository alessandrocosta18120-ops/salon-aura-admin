# Documentação das APIs para o Perfil Webmaster

**Data:** 27/02/2026

## Visão Geral

O perfil **webmaster** é um superusuário que pode visualizar e acessar todos os salões e usuários do sistema. Ele pode "impersonar" qualquer salão ou usuário, acessando o painel como se fosse aquele usuário/admin.

---

## 1. Login - Retorno do role `webmaster`

**Endpoint existente:** `POST /admin/api/admin_authlogin.asp`

A API de login **já existente** deve retornar `"role": "webmaster"` para usuários com este perfil.

### Resposta esperada:
```json
{
  "success": true,
  "data": {
    "sessionId": "{GUID}",
    "slug": null,
    "userId": "99",
    "salonId": null,
    "userName": "webmaster_diego",
    "role": "webmaster",
    "requires2FA": false
  }
}
```

> **Nota:** Para webmaster, `salonId` e `slug` podem ser `null`, pois ele não pertence a um salão específico.

---

## 2. Listar Todos os Salões

**Endpoint:** `GET /admin/api/admin_wmgetallsalons.asp`

**Parâmetros (query string):**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| search | string | Não | Filtro por nome, slug ou email |
| page | int | Não | Página (default: 1) |
| limit | int | Não | Itens por página (default: 50) |

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Salão Moraes & Alves",
      "slug": "moraesealves",
      "phone": "(11) 99999-9999",
      "email": "contato@moraes.com",
      "address": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "active": true,
      "createdAt": "2025-01-15",
      "professionalsCount": 5,
      "appointmentsCount": 120
    }
  ]
}
```

---

## 3. Listar Todos os Usuários

**Endpoint:** `GET /admin/api/admin_wmgetallusers.asp`

**Parâmetros (query string):**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| search | string | Não | Filtro por nome, username ou email |
| salonId | string | Não | Filtrar por salão específico |
| role | string | Não | Filtrar por perfil (admin, manager, staff) |
| page | int | Não | Página (default: 1) |
| limit | int | Não | Itens por página (default: 50) |

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Diego Moraes",
      "username": "diego",
      "email": "diego@moraes.com",
      "phone": "(11) 98888-8888",
      "role": "admin",
      "salonId": "1",
      "salonName": "Salão Moraes & Alves",
      "active": true,
      "lastLogin": "2026-02-27 10:30:00"
    }
  ]
}
```

---

## 4. Impersonar Salão

**Endpoint:** `POST /admin/api/admin_wmimpersonatesalon.asp`

Gera uma sessão válida como **admin** do salão selecionado.

**Payload:**
```json
{
  "salonId": "1"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "sessionId": "{NOVO-GUID-SESSAO}",
    "salonId": "1",
    "userName": "Webmaster → Moraes",
    "userId": "1",
    "slug": "moraesealves",
    "role": "admin"
  }
}
```

> **Segurança:** Esta API deve validar que o chamador possui role `webmaster` na sessão atual.

---

## 5. Impersonar Usuário

**Endpoint:** `POST /admin/api/admin_wmimpersonateuser.asp`

Gera uma sessão válida como o **usuário específico** selecionado, com o role dele.

**Payload:**
```json
{
  "userId": "5"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "sessionId": "{NOVO-GUID-SESSAO}",
    "salonId": "1",
    "userName": "José da Silva",
    "userId": "5",
    "slug": "moraesealves",
    "role": "staff"
  }
}
```

---

## 6. Ativar/Desativar Salão

**Endpoint:** `POST /admin/api/admin_wmtogglesalonactive.asp`

**Payload:**
```json
{
  "salonId": "1",
  "active": false
}
```

**Resposta:**
```json
{
  "success": true
}
```

---

## 7. Ativar/Desativar Usuário

**Endpoint:** `POST /admin/api/admin_wmtoggleuseractive.asp`

**Payload:**
```json
{
  "userId": "5",
  "active": false
}
```

**Resposta:**
```json
{
  "success": true
}
```

---

## 8. Atualizar Dados de Salão (Webmaster)

**Endpoint:** `POST /admin/api/admin_wmupdatesalon.asp`

**Payload:** Campos parciais do salão (os que forem enviados serão atualizados).
```json
{
  "id": "1",
  "name": "Novo Nome do Salão",
  "email": "novo@email.com"
}
```

---

## 9. Atualizar Dados de Usuário (Webmaster)

**Endpoint:** `POST /admin/api/admin_wmupdateuser.asp`

**Payload:** Campos parciais do usuário.
```json
{
  "id": "5",
  "name": "Novo Nome",
  "role": "manager"
}
```

---

## Resumo de Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `admin_wmgetallsalons.asp` | Lista todos os salões |
| GET | `admin_wmgetallusers.asp` | Lista todos os usuários |
| POST | `admin_wmimpersonatesalon.asp` | Impersona salão (gera sessão) |
| POST | `admin_wmimpersonateuser.asp` | Impersona usuário (gera sessão) |
| POST | `admin_wmtogglesalonactive.asp` | Ativa/desativa salão |
| POST | `admin_wmtoggleuseractive.asp` | Ativa/desativa usuário |
| POST | `admin_wmupdatesalon.asp` | Atualiza dados do salão |
| POST | `admin_wmupdateuser.asp` | Atualiza dados do usuário |

## Segurança

- **Todas** as APIs `wm*` devem validar que a sessão possui `role = 'webmaster'`
- Retornar `{ "success": false, "error": "Acesso não autorizado" }` se o role não for webmaster
- Registrar logs de todas as ações de impersonação para auditoria
