# 🎯 Ranking System - Setup Guide

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no seu `.env.local`:

```env
# Ranking CRON Job Secret (gere uma string aleatória longa)
CRON_SECRET=seu-cron-secret-super-secreto-aqui-12345

# URL da aplicação (para chamar APIs internamente)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Local
# NEXT_PUBLIC_APP_URL=https://seu-dominio.com  # Production
```

## 🔧 Configuração da CRON no Vercel

O arquivo `vercel.json` já está configurado para rodar diariamente às 00:00 (meia-noite UTC).

**Configuração atual:**
```json
{
  "crons": [
    {
      "path": "/api/cron/ranking",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## 📋 Endpoints da API

### GET /api/ranking
Fetch rankings de um mês específico

**Query Parameters:**
- `month` (opcional): Mês no formato "YYYY-MM" (ex: "2025-12"). Default: mês atual
- `limit` (opcional): Limite de resultados (1-100, default: 50)
- `offset` (opcional): Offset para paginação (default: 0)
- `username` (opcional): Buscar ranking de um usuário específico

**Exemplo:**
```bash
# Fetch top 50 do mês atual
curl http://localhost:3000/api/ranking

# Fetch top 10 com offset
curl http://localhost:3000/api/ranking?limit=10&offset=0

# Fetch ranking de um mês específico
curl http://localhost:3000/api/ranking?month=2025-11

# Buscar ranking de um usuário
curl http://localhost:3000/api/ranking?username=joao_silva
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "id": "...",
        "user_id": "...",
        "month": "2025-12",
        "economia_taxa": 75.5,
        "entradas_total": 5000,
        "despesas_total": 1225,
        "posicao": 1,
        "badges": ["top_1", "high_growth"],
        "users": {
          "id": "...",
          "name": "João Silva",
          "avatar_url": "...",
          "username": "joao_silva",
          "total_badges": 5,
          "current_streak": 2
        }
      }
    ],
    "total": 1245,
    "userRanking": null,
    "month": "2025-12",
    "pagination": {
      "limit": 50,
      "offset": 0,
      "pages": 25
    }
  }
}
```

### POST /api/ranking/calculate
Calcula rankings para um mês (chamado automaticamente pela CRON)

**Headers obrigatórios:**
```
Authorization: Bearer {CRON_SECRET}
```

**Query Parameters:**
- `month` (opcional): Mês no formato "YYYY-MM". Default: mês atual

**Exemplo (manual):**
```bash
curl -X POST http://localhost:3000/api/ranking/calculate \
  -H "Authorization: Bearer seu-cron-secret-aqui"
```

**Response:**
```json
{
  "success": true,
  "month": "2025-12",
  "usersProcessed": 1245,
  "timestamp": "2025-12-23T00:00:00.000Z"
}
```

## 🗄️ Estrutura de Dados

### Tabela: rankings
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
month VARCHAR(7) -- "2025-12"
economia_taxa DECIMAL(5,2) -- 0-100%
entradas_total DECIMAL(15,2)
despesas_total DECIMAL(15,2)
posicao INT -- Rank (1, 2, 3...)
badges TEXT[] -- Array de badge IDs
created_at TIMESTAMP
updated_at TIMESTAMP
UNIQUE(user_id, month)
```

### Tabela: ranking_history
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
month VARCHAR(7) -- "2025-12"
day INT -- Dia do mês (1-31)
posicao INT -- Rank naquele dia
economia_taxa DECIMAL(5,2)
created_at TIMESTAMP
UNIQUE(user_id, month, day)
```

### Campos estendidos em: users
```sql
username VARCHAR(100) UNIQUE
avatar_url TEXT
total_badges INT DEFAULT 0
current_streak INT DEFAULT 0
bio TEXT
```

## 🎮 Badges Disponíveis

| Badge ID | Label | Ícone | Requisito |
|----------|-------|-------|-----------|
| `top_1` | Campeão | 🥇 | Ser #1 no ranking |
| `top_10` | Elite | 🏆 | Estar entre top 10 |
| `top_25` | Destaque | ⭐ | Estar entre top 25 |
| `streak_3` | Persistência | 🔥 | 3 meses economizando |
| `high_growth` | Crescimento | 📈 | +20% economia vs mês anterior |
| `consistency` | Consistência | ✨ | Semana sem ultrapassar limite |
| `first_month` | Iniciante | 🎯 | Primeiro mês completado |

## 📊 Fórmula de Economia

```
Taxa de Economia = ((Entradas - Despesas) / Entradas) × 100
```

**Exemplos:**
- Entradas: R$ 5.000 | Despesas: R$ 1.000 → 80% economia
- Entradas: R$ 5.000 | Despesas: R$ 3.000 → 40% economia
- Entradas: R$ 5.000 | Despesas: R$ 5.000 → 0% economia
- Entradas: R$ 5.000 | Despesas: R$ 6.000 → 0% economia (negativo vira 0)

## 🧪 Testes

### Testar CRON manualmente (local)

```bash
# Com CRON_SECRET configurada em .env.local
curl -X POST http://localhost:3000/api/ranking/calculate \
  -H "Authorization: Bearer seu-cron-secret-aqui"
```

### Testar GET ranking

```bash
curl http://localhost:3000/api/ranking
curl http://localhost:3000/api/ranking?month=2025-12
curl http://localhost:3000/api/ranking?limit=10
```

### Inserir ranking de teste (SQL)

```sql
INSERT INTO rankings (user_id, month, economia_taxa, entradas_total, despesas_total, posicao, badges)
SELECT 
  id, 
  '2025-12', 
  75.50, 
  5000.00, 
  1225.00, 
  1, 
  ARRAY['top_1', 'high_growth']
FROM users
LIMIT 1;
```

## ⚠️ Troubleshooting

### CRON não está rodando
- [ ] Verificar `vercel.json` está no root do projeto
- [ ] Verificar `CRON_SECRET` está definido em Vercel
- [ ] Verificar logs em Vercel Dashboard → Deployments → Logs

### Erro "Unauthorized" na API
- [ ] Verificar `CRON_SECRET` está correto
- [ ] Verificar header `Authorization: Bearer {CRON_SECRET}`
- [ ] Redeployer se mudou variável de env

### Rankings não aparecem
- [ ] Verificar se tabelas foram criadas: `SELECT * FROM rankings;`
- [ ] Verificar se há transações no mês: `SELECT * FROM transactions WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW());`
- [ ] Verificar logs da CRON em Vercel

### Erro de conexão Supabase
- [ ] Verificar `NEXT_PUBLIC_SUPABASE_URL` e keys
- [ ] Verificar RLS policies nas tabelas (devem permitir read/write)

## 📚 Próximas Fases

- ✅ Fase 1: Backend & Infraestrutura
- ⏳ Fase 2: Componentes Base & Hooks
- ⏳ Fase 3: Componentes Gamificados
- ⏳ Fase 4: Páginas & Navegação
- ⏳ Fase 5: Testes & Otimizações
- ⏳ Fase 6: Deploy & Monitoramento
