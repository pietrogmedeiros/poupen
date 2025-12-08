# 🎬 Fluxo Visual: Sistema de Notificações Recorrentes

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        APLICAÇÃO                              │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ Entradas/      │  │   Recorridos     │  │  Notificações│ │
│  │ Despesas Page  │  │   Page (CRUD)    │  │   Page       │ │
│  └────────┬────────┘  └──────────────────┘  └──────────────┘ │
│           │                                         ▲          │
│           │ criar recorrência                       │          │
│           └────────────┬────────────────────────────┘          │
│                        │                                       │
│                  ┌─────▼──────┐                                │
│                  │ WebSocket  │  (Supabase Realtime)          │
│                  │ Connection │  - Escuta mudanças            │
│                  └─────┬──────┘  - Toast automático           │
│                        │                                       │
└────────────────────────┼───────────────────────────────────────┘
                         │
                         │ INSERT notifications
                         │
                    ┌────▼─────────────────────┐
                    │   SUPABASE DATABASE      │
                    │                          │
                    │ ┌──────────────────────┐ │
                    │ │ transactions         │ │
                    │ │ ├─ id                │ │
                    │ │ ├─ user_id           │ │
                    │ │ ├─ amount            │ │
                    │ │ └─ date              │ │
                    │ └──────────────────────┘ │
                    │                          │
                    │ ┌──────────────────────┐ │
                    │ │recurring_transactions│ │
                    │ │ ├─ id                │ │
                    │ │ ├─ frequency (monthly)│ │
                    │ │ ├─ next_occurrence   │ │
                    │ │ └─ active: true      │ │
                    │ └──────────────────────┘ │
                    │                          │
                    │ ┌──────────────────────┐ │
                    │ │ notifications        │ │
                    │ │ ├─ id                │ │
                    │ │ ├─ title: "⏰ 5 dias"│ │
                    │ │ ├─ type: 'reminder'  │ │
                    │ │ ├─ scheduled_for     │ │
                    │ │ └─ read: false       │ │
                    │ └──────────────────────┘ │
                    │                          │
                    │ ┌──────────────────────┐ │
                    │ │PostgreSQL Functions  │ │
                    │ │                      │ │
                    │ │⚡ process_recurring_│ │
                    │ │  transactions()      │ │
                    │ │                      │ │
                    │ │⚡ create_reminder_  │ │
                    │ │  notifications()     │ │
                    │ └──────────────────────┘ │
                    └────┬─────────────────────┘
                         │
                         │ Executado pelo CRON JOB
                         │ (diariamente 00:30)
                         │
                    ┌────▼──────────────────┐
                    │  /api/cron/process    │
                    │  -recurring           │
                    │  (com autenticação)   │
                    └───────────────────────┘
```

---

## 📅 Timeline: Ciclo de Vida de uma Notificação

### Dia 0: Criar Transação Recorrente

```
Usuário acessa: /entradas (Entrada)
         ↓
Marca: ☑ Tornar recorrente
         ↓
Seleciona: Frequência = "Mensal" (no dia 10)
         ↓
Clica: Salvar
         ↓
INSERT INTO recurring_transactions (
  id: 'abc123',
  user_id: 'user1',
  description: 'Aluguel',
  amount: 2000,
  frequency: 'monthly',
  day_of_month: 10,
  next_occurrence: '2025-12-10',  ← Próximo vencimento
  active: true
)

Notificação imediata:
INSERT INTO notifications (
  title: 'Transação recorrente criada',
  message: 'Aluguel (R$ 2.000,00)',
  type: 'created',
  scheduled_for: '2025-12-10'
)

✓ Toast verde aparece: "Transação recorrente criada"
✓ Badge no Sidebar mostra +1
```

---

### Dias 1-4: Período de Espera

```
2025-12-05:
  - Usuário vê: 5 notificações (outras transações)
  - Badge: 5 não lidas
  - Nada relacionado ao Aluguel

2025-12-06:
  - Nada nova
  
2025-12-07:
  - Nada nova
  
2025-12-08:
  - Nada nova

2025-12-09:
  - Nada nova
```

---

### Dia 5 Antes (2025-12-05): Cron Job Roda

```
⏰ 00:30 → POST /api/cron/process-recurring

1️⃣ Processa transações vencidas (hoje):
   SELECT FROM recurring_transactions
   WHERE next_occurrence = '2025-12-05'
   
   (Nada encontrado, pois próx vence em 10)

2️⃣ Cria lembretes (vence em 5 dias):
   SELECT FROM recurring_transactions
   WHERE next_occurrence = '2025-12-10'
   
   Encontrou: Aluguel (next_occurrence = 2025-12-10)
   
   INSERT INTO notifications (
     id: 'reminder1',
     title: '⏰ Lembrete: 5 dias para vencer',
     message: 'Aluguel (R$ 2.000,00) vence em 5 dias',
     type: 'reminder',
     scheduled_for: '2025-12-10',
     read: false
   )

3️⃣ WebSocket dispara:
   - Browser recebe notificação
   - Toast aparece em 5 segundos (azul)
   - Badge atualiza para +1
   - Usuário vê no Sidebar

✓ Usuário vê: Toast azul "⏰ Lembrete: 5 dias para vencer"
✓ Badge: 1 não lida
```

---

### Dia da Notificação (2025-12-10): Cron Job Roda

```
⏰ 00:30 → POST /api/cron/process-recurring

1️⃣ Processa transações vencidas (hoje):
   WHERE next_occurrence = '2025-12-10'
   
   Encontrou: Aluguel
   
   ✓ INSERT INTO transactions (
       id: 'txn123',
       user_id: 'user1',
       description: 'Aluguel',
       amount: 2000,
       date: '2025-12-10'
     )
   
   ✓ UPDATE recurring_transactions
     SET next_occurrence = '2026-01-10'
        (próximo mês, mesmo dia)
   
   ✓ INSERT INTO notifications (
       title: 'Transação recorrente criada',
       message: 'Aluguel (R$ 2.000,00)',
       type: 'created',
       scheduled_for: '2025-12-10',
       read: false
     )

2️⃣ Cria lembretes (vence em 5 dias):
   WHERE next_occurrence = '2025-12-15'
   (Nada, pois próx vence em janeiro agora)

✓ Transação "Aluguel" aparece no histórico
✓ Próxima ocorrência: 2026-01-10 (em 31 dias)
✓ Usuário recebe notificação "criada" de novo
```

---

### Período Intermediário: Usuário Interage

```
2025-12-10 10:00 → Usuário acessa /notificacoes

Vê:
┌─────────────────────────────────────────┐
│ ⏰ Lembrete: 5 dias para vencer          │ ← Blue badge "5 dias"
│ Aluguel (R$ 2.000,00)                    │
│ [✓ Marcar como lida]  2 horas atrás     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✓ Transação recorrente criada            │ ← Green
│ Aluguel (R$ 2.000,00)                    │
│ [✓ Marcar como lida]  alguns minutos     │
└─────────────────────────────────────────┘

Clica em [✓] da primeira:

UPDATE notifications
SET read = true
WHERE id = 'reminder1'

✓ WebSocket atualiza
✓ Badge diminui (agora mostra 1)
✓ Notificação fica com fundo cinza
```

---

### Após Vencimento: Status Muda

```
2025-12-11 → Notificação de lembrete:
  
  Lógica em useNotifications.ts:
  
  daysRemaining = (2025-12-10) - (2025-12-11)
                = -1 dia
  
  type = 'vencido' (porque daysRemaining <= 0)
  
  Exibição muda para:
  ┌─────────────────────────────────────┐
  │ ⚠️ Vencida                            │ ← RED
  │ Aluguel (R$ 2.000,00)                │
  │                                     │
  │ Status: 1 dia atrasado               │
  └─────────────────────────────────────┘
```

---

## 🔔 Estados das Notificações

```
┌──────────────────────────────────────────────────────┐
│           ESTADOS DA NOTIFICAÇÃO                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ✓ CRIADA (green)                                   │
│  └─ Quando: Transação recorrente foi criada         │
│  └─ Onde: Histórico de transações                   │
│                                                      │
│  ⏰ LEMBRETE (blue)                                  │
│  └─ Quando: 5 dias antes do vencimento              │
│  └─ Badge: "5 dias restantes"                       │
│  └─ Ação: Diário até reconhecer                     │
│                                                      │
│  ⚠️  VENCIDA (red)                                    │
│  └─ Quando: No dia ou após vencimento               │
│  └─ Badge: Mostra dias atrasados                    │
│  └─ Ação: Reconhecer ou arquivar                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 Fluxo de Usuário Visual

### Desktop (Tela Principal)

```
┌─────────────────────────────────────────────────────┐
│                   DASHBOARD                         │
│                                                     │
│ Sidebar                  │ Conteúdo Principal      │
│ ├─ 📊 Dashboard          │                         │
│ ├─ 💰 Entradas           │  Cartão de Renda        │
│ ├─ 💸 Despesas           │  Próximas transações:   │
│ ├─ 📈 Histórico          │                         │
│ ├─ 🔄 Recorridas         │  🔄 Aluguel             │
│ ├─ ⚙️ Configurações      │     R$ 2.000,00         │
│ │                         │     Próx: 10 de janeiro│
│ │        [🔔 3]          │                         │
│ │  Notificações           │                         │
│ │  Badge azul = 3         │                         │
│ │  (não lidas)            │                         │
│ │                         │                         │
│ ├─ 🚪 Logout             │                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Quando Clica em NotificationCenter

```
Toast aparece
no canto inferior
direito da tela
em 5 segundos:

┌────────────────────────────┐
│ ⏰ Lembrete: 5 dias para... │ ← Blue toast
│ Aluguel                     │
│ [×] Fechar                  │
└────────────────────────────┘
```

### Quando Acessa /notificacoes

```
┌────────────────────────────────────────┐
│  🔔 Notificações                        │
│  Você tem 3 notificações não lidas      │
│                                        │
│  [Todas (5)]  [Não lidas (3)]          │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ⏰ Lembrete: 5 dias para vencer    │ │
│  │ Aluguel (R$ 2.000,00)             │ │
│  │                                   │ │
│  │ Tipo: 🟦 Lembrete                 │ │
│  │ Status: 5 dias restantes          │ │
│  │ Data: 8 dez 23:30                 │ │
│  │                        [✓]        │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ✓ Transação recorrente criada     │ │
│  │ Aluguel (R$ 2.000,00)             │ │
│  │                                   │ │
│  │ Tipo: 🟩 Criada                   │ │
│  │ Data: 8 dez 23:30                 │ │
│  │                        [✓]        │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

---

## 📊 Dados no Supabase

### Transações Recorrentes (Table)

```
id           | user_id | description | frequency | next_occurrence | active | day_of_month
─────────────|─────────|─────────────|───────────|─────────────────|────────|─────────────
abc123      | user1   | Aluguel     | monthly   | 2026-01-10      | true   | 10
def456      | user1   | Salário     | monthly   | 2025-12-20      | true   | 20
ghi789      | user1   | Água        | monthly   | 2025-12-25      | true   | 25
```

### Notificações (Table)

```
id         | user_id | scheduled_for | type      | read | created_at
-----------|---------|---------------|-----------|------|─────────────
notif1     | user1   | 2025-12-10    | reminder  | false| 2025-12-05
notif2     | user1   | 2025-12-10    | created   | false| 2025-12-10
notif3     | user1   | 2025-12-20    | reminder  | false| 2025-12-15
```

---

## 🔐 Segurança: Autenticação Cron

```
Requisição HTTP:

POST /api/cron/process-recurring
Authorization: Bearer poupa-ai-cron-secret-2024
Content-Type: application/json

{}

─────────────────────────────────────────

Validação no servidor:

if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return 401 Unauthorized
}

✓ Apenas requests com token correto são processados
```

---

## 🎁 Resultado Final para Usuário

Sem fazer nada, o usuário automaticamente:

✅ Recebe lembretes 5 dias antes de vencer  
✅ Vê toast em tempo real (WebSocket)  
✅ Marca notificações como lidas  
✅ Vê "vencida" em vermelho após vencimento  
✅ Transações são criadas automaticamente  
✅ Badge atualiza em tempo real  

**Zero esforço, máxima utilidade!** 🎉
