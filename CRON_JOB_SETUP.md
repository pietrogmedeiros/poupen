# Configuração de Cron Job para Processamento de Notificações

## Visão Geral

O aplicativo processa automaticamente transações recorrentes e cria notificações de lembrete através do endpoint:

```
POST /api/cron/process-recurring
```

Este endpoint:
1. Processa transações recorrentes vencidas
2. Cria transações automáticas
3. Gera notificações de lembrete (5 dias antes do vencimento)
4. Marca notificações antigas como "vencidas"

## Autenticação

O endpoint requer autenticação via header `Authorization`:

```
Authorization: Bearer YOUR_CRON_SECRET
```

**Configure a variável de ambiente:**
```
CRON_SECRET=sua-chave-secreta-aqui
```

## Opções de Configuração

### Opção 1: EasyCron (Gratuito até 100 crons)

1. Acesse https://www.easycron.com/
2. Faça login/crie conta
3. Clique em "Cron Jobs" → "New"
4. Configure:
   - **URL**: `https://seu-app.com/api/cron/process-recurring`
   - **Method**: POST
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```
   - **Frequency**: Diariamente às 00:30 (ou horário desejado)
   - **Timezone**: America/Sao_Paulo

5. Teste clicando em "Cron Job Details" → "Execute Now"

### Opção 2: Supabase Edge Functions + Postgres Cron

1. Crie uma Edge Function no Supabase:

```sql
-- Execute no Supabase SQL Editor para ativar pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agende job para rodar diariamente às 00:30
SELECT cron.schedule('process-recurring-transactions', '30 0 * * *', '
  SELECT http_post(
    ''https://seu-app.com/api/cron/process-recurring'',
    ''{}''::jsonb,
    ''application/json''::text,
    jsonb_build_object(
      ''Authorization'', ''Bearer '' || current_setting(''app.cron_secret'')
    )
  );
');
```

### Opção 3: GitHub Actions (Gratuito para repos públicos)

1. Crie `.github/workflows/daily-notifications.yml`:

```yaml
name: Daily Notification Processing

on:
  schedule:
    # Executa diariamente às 00:30 (UTC)
    - cron: '30 0 * * *'

jobs:
  process-recurring:
    runs-on: ubuntu-latest
    steps:
      - name: Process recurring transactions
        run: |
          curl -X POST https://seu-app.com/api/cron/process-recurring \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{}'
```

2. Configure o secret `CRON_SECRET` em Settings → Secrets

### Opção 4: Vercel Cron Jobs (Recomendado)

Se estiver usando Vercel, você pode usar cron jobs nativos.

1. Crie `vercel.json` na raiz do projeto:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-recurring",
      "schedule": "30 0 * * *"
    }
  ]
}
```

2. Configure variável de ambiente:
```
CRON_SECRET=sua-chave-secreta
```

3. Faça deploy no Vercel

### Opção 5: AWS Lambda + EventBridge

1. Crie função Lambda que faz request ao endpoint
2. Configure EventBridge para disparar diariamente
3. Teste com CloudWatch Logs

## Testando Manualmente

```bash
curl -X POST http://localhost:3000/api/cron/process-recurring \
  -H "Authorization: Bearer seu-cron-secret" \
  -H "Content-Type: application/json"
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Transações recorrentes processadas com sucesso",
  "processedTransactions": 3,
  "reminders": 5
}
```

## Lógica do Processamento

### 1. Process Recurring Transactions
- Busca transações recorrentes ativas
- Verifica se `next_occurrence <= hoje`
- Cria nova transação de entrada/despesa
- Calcula próxima ocorrência
- Salva no histórico

### 2. Create Reminder Notifications
- Busca transações recorrentes vencendo em 5 dias
- Cria notificação com título e mensagem
- Define `scheduled_for` para data de vencimento
- Marca como `read: false`

### 3. Marcar Vencidas
- Notificações com `scheduled_for <= hoje` mudam tipo para "vencido"
- Mostradas em vermelho na UI
- Badge mostra "⚠️ Vencida"

## Monitoramento

Adicione logging para monitorar execuções:

```typescript
// Em app/api/cron/process-recurring/route.ts
console.log(`[CRON] Iniciado às ${new Date().toISOString()}`);
console.log(`[CRON] Transações processadas: ${result1.data?.length}`);
console.log(`[CRON] Lembretes criados: ${result2.data?.length}`);
```

Verifique logs em:
- **Vercel**: Dashboard → Logs
- **Local**: Terminal onde roda `npm run dev`

## Troubleshooting

### "Unauthorized" (401)
- Verifique se `CRON_SECRET` está configurado
- Confirme se o header `Authorization` está correto
- Certifique-se de espaço entre "Bearer" e o token

### Notificações não aparecem
- Verifique se `process_recurring_transactions()` foi executada
- Confirme se há transações recorrentes ativas
- Verifique se `create_reminder_notifications()` criou registros

### Job não roda no horário esperado
- Confirme timezone da plataforma
- Verifique logs para erros de request
- Teste manualmente para verificar lógica

## Próximos Passos

1. Escolha um serviço de cron (recomendado: Vercel ou EasyCron)
2. Configure `CRON_SECRET` em variáveis de ambiente
3. Teste manualmente com curl
4. Configure schedule (recomendado: 00:30 diariamente)
5. Monitore execuções nos primeiros dias
