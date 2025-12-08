-- ============================================================
-- PASSO 1: DELETE TUDO
-- ============================================================
DROP FUNCTION IF EXISTS process_recurring_transactions() CASCADE;
DROP FUNCTION IF EXISTS create_reminder_notifications() CASCADE;

-- ============================================================
-- PASSO 2: CRIAR NOVA FUNÇÃO - VERSÃO SIMPLES PRIMEIRO
-- ============================================================

CREATE OR REPLACE FUNCTION process_recurring_transactions()
RETURNS TABLE(
  transaction_id UUID,
  recurring_id UUID,
  user_id UUID,
  status VARCHAR
) AS $$
DECLARE
  rec RECORD;
  tx_id UUID;
  not_id UUID;
BEGIN
  FOR rec IN 
    SELECT 
      recurring_transactions.id, 
      recurring_transactions.user_id, 
      recurring_transactions.description, 
      recurring_transactions.amount, 
      recurring_transactions.category, 
      recurring_transactions.type,
      recurring_transactions.frequency, 
      recurring_transactions.start_date, 
      recurring_transactions.end_date, 
      recurring_transactions.next_occurrence, 
      recurring_transactions.day_of_month
    FROM recurring_transactions
    WHERE recurring_transactions.active = true
      AND recurring_transactions.next_occurrence = CURRENT_DATE
      AND (recurring_transactions.end_date IS NULL OR recurring_transactions.end_date >= CURRENT_DATE)
      AND recurring_transactions.deleted_at IS NULL
  LOOP
    INSERT INTO transactions (
      id, user_id, description, amount, category, type, 
      date, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      rec.user_id,
      rec.description,
      rec.amount,
      rec.category,
      rec.type,
      CURRENT_DATE,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    ) RETURNING transactions.id INTO tx_id;

    UPDATE recurring_transactions
    SET next_occurrence = calculate_next_occurrence(
      recurring_transactions.frequency, 
      CURRENT_DATE, 
      recurring_transactions.day_of_month
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE recurring_transactions.id = rec.id;

    INSERT INTO notifications (
      id, user_id, recurring_transaction_id,
      title, message, type, scheduled_for,
      created_at
    ) VALUES (
      gen_random_uuid(),
      rec.user_id,
      rec.id,
      'Transação recorrente criada',
      rec.description || ' (R$ ' || rec.amount || ')',
      'created',
      CURRENT_DATE,
      CURRENT_TIMESTAMP
    ) RETURNING notifications.id INTO not_id;

    RETURN QUERY VALUES (
      tx_id, 
      rec.id, 
      rec.user_id, 
      'success'::VARCHAR
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PASSO 3: CRIAR SEGUNDA FUNÇÃO
-- ============================================================

CREATE OR REPLACE FUNCTION create_reminder_notifications()
RETURNS TABLE(
  notification_id UUID,
  user_id UUID,
  status VARCHAR
) AS $$
DECLARE
  rec RECORD;
  not_id UUID;
BEGIN
  FOR rec IN 
    SELECT 
      recurring_transactions.id, 
      recurring_transactions.user_id, 
      recurring_transactions.description, 
      recurring_transactions.amount, 
      recurring_transactions.next_occurrence
    FROM recurring_transactions
    WHERE recurring_transactions.active = true
      AND recurring_transactions.next_occurrence = CURRENT_DATE + INTERVAL '5 days'
      AND recurring_transactions.deleted_at IS NULL
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE notifications.recurring_transaction_id = rec.id
        AND notifications.scheduled_for = rec.next_occurrence
        AND notifications.type = 'reminder'
        AND notifications.deleted_at IS NULL
    ) THEN
      INSERT INTO notifications (
        id, user_id, recurring_transaction_id,
        title, message, type, scheduled_for,
        created_at
      ) VALUES (
        gen_random_uuid(),
        rec.user_id,
        rec.id,
        'Lembrete: Transação recorrente em 5 dias',
        rec.description || ' (R$ ' || rec.amount || ') vence em 5 dias',
        'reminder',
        rec.next_occurrence,
        CURRENT_TIMESTAMP
      ) RETURNING notifications.id INTO not_id;

      RETURN QUERY VALUES (
        not_id, 
        rec.user_id, 
        'success'::VARCHAR
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
