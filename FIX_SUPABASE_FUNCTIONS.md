# Como Corrigir as Funções no Supabase

## Problema
As funções PostgreSQL `process_recurring_transactions` e `create_reminder_notifications` têm um erro de sintaxe que causa "column reference is ambiguous".

## Solução

### Passo 1: Abra o Supabase SQL Editor
1. Acesse: https://app.supabase.com/project/vtnykubyupjahoalarba/sql/new
2. Você deve estar logado na sua conta Supabase

### Passo 2: Copie e Cole o SQL Corrigido

Cole EXATAMENTE este código no editor SQL:

```sql
-- Drop existing functions
DROP FUNCTION IF EXISTS process_recurring_transactions() CASCADE;
DROP FUNCTION IF EXISTS create_reminder_notifications() CASCADE;

-- ============================================================
-- FUNCTION: Process recurring transactions (FIXED)
-- ============================================================

CREATE FUNCTION process_recurring_transactions()
RETURNS TABLE(
  transaction_id UUID,
  recurring_id UUID,
  user_id UUID,
  status VARCHAR
) AS $$
DECLARE
  v_recurring RECORD;
  v_transaction_id UUID;
  v_notification_id UUID;
BEGIN
  -- Process all active recurring transactions due today
  FOR v_recurring IN 
    SELECT 
      id, user_id, description, amount, category, type,
      frequency, start_date, end_date, next_occurrence, day_of_month
    FROM recurring_transactions
    WHERE active = true
      AND next_occurrence = CURRENT_DATE
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      AND deleted_at IS NULL
  LOOP
    -- Create transaction
    INSERT INTO transactions (
      id, user_id, description, amount, category, type, 
      date, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_recurring.user_id,
      v_recurring.description,
      v_recurring.amount,
      v_recurring.category,
      v_recurring.type,
      CURRENT_DATE,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    ) RETURNING id INTO v_transaction_id;

    -- Update next occurrence
    UPDATE recurring_transactions
    SET next_occurrence = calculate_next_occurrence(
      frequency, 
      CURRENT_DATE, 
      day_of_month
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = v_recurring.id;

    -- Create notification
    INSERT INTO notifications (
      id, user_id, recurring_transaction_id,
      title, message, type, scheduled_for,
      created_at
    ) VALUES (
      gen_random_uuid(),
      v_recurring.user_id,
      v_recurring.id,
      'Transação recorrente criada',
      v_recurring.description || ' (R$ ' || v_recurring.amount || ')',
      'created',
      CURRENT_DATE,
      CURRENT_TIMESTAMP
    ) RETURNING id INTO v_notification_id;

    RETURN QUERY VALUES (
      v_transaction_id, 
      v_recurring.id, 
      v_recurring.user_id, 
      'success'::VARCHAR
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Create reminder notifications (5 days before) (FIXED)
-- ============================================================

CREATE FUNCTION create_reminder_notifications()
RETURNS TABLE(
  notification_id UUID,
  user_id UUID,
  status VARCHAR
) AS $$
DECLARE
  v_recurring RECORD;
  v_notification_id UUID;
BEGIN
  -- Create reminders for transactions due in 5 days
  FOR v_recurring IN 
    SELECT 
      id, user_id, description, amount, next_occurrence
    FROM recurring_transactions
    WHERE active = true
      AND next_occurrence = CURRENT_DATE + INTERVAL '5 days'
      AND deleted_at IS NULL
  LOOP
    -- Check if notification already exists for this recurring transaction and date
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE recurring_transaction_id = v_recurring.id
        AND scheduled_for = v_recurring.next_occurrence
        AND type = 'reminder'
        AND deleted_at IS NULL
    ) THEN
      INSERT INTO notifications (
        id, user_id, recurring_transaction_id,
        title, message, type, scheduled_for,
        created_at
      ) VALUES (
        gen_random_uuid(),
        v_recurring.user_id,
        v_recurring.id,
        'Lembrete: Transação recorrente em 5 dias',
        v_recurring.description || ' (R$ ' || v_recurring.amount || ') vence em 5 dias',
        'reminder',
        v_recurring.next_occurrence,
        CURRENT_TIMESTAMP
      ) RETURNING id INTO v_notification_id;

      RETURN QUERY VALUES (
        v_notification_id, 
        v_recurring.user_id, 
        'success'::VARCHAR
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### Passo 3: Execute o SQL
1. Clique no botão **"Run"** (canto superior direito)
2. Aguarde a mensagem de sucesso

### Passo 4: Verifique o Resultado
Você verá uma mensagem como:
```
Query Successful
```

### Passo 5: Teste o Cron Job

Depois de executar o SQL, execute este comando:

```bash
curl -X POST http://localhost:3000/api/cron/process-recurring \
  -H "Authorization: Bearer poupa-ai-cron-secret-2024" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Transações recorrentes processadas com sucesso",
  "processedTransactions": 0,
  "reminders": 0
}
```

## O que foi corrigido?

A mudança foi simples mas importante:

**Antes (Erro):**
```sql
RETURN QUERY SELECT 
  v_transaction_id, 
  v_recurring.id, 
  v_recurring.user_id,     -- ❌ Ambiguous! Pode vir de recurring_transactions ou da tabela temporária
  'success'::VARCHAR;
```

**Depois (Correto):**
```sql
RETURN QUERY VALUES (
  v_transaction_id, 
  v_recurring.id, 
  v_recurring.user_id,      -- ✅ Sem ambiguidade, vem do registro
  'success'::VARCHAR
);
```

## Troubleshooting

### Erro: "Function calculate_next_occurrence does not exist"
**Solução**: Execute o arquivo completo `scripts/recurring-transactions.sql` que inclui todas as funções

### Erro: "Table recurring_transactions does not exist"
**Solução**: Execute o arquivo completo `scripts/recurring-transactions.sql` que inclui a criação das tabelas

### Tudo funcionando mas cron não processa transações?
**Possíveis causas**:
- Não há transações recorrentes ativas com `next_occurrence = hoje`
- Veja: https://app.supabase.com/project/vtnykubyupjahoalarba/editor (tabela: recurring_transactions)
