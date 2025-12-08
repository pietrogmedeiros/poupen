#!/bin/bash

# Script para executar o SQL de atualização das funções no Supabase
# Usage: ./scripts/update-recurring-functions.sh

SUPABASE_URL="https://vtnykubyupjahoalarba.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnlrdWJ5dXBqYWhvYWxhcmJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTUwMjgwOCwiZXhwIjoyMDc3MDc4ODA4fQ.bKrP_w7yh6tHCuI7L0R_2lqVDU1X0XG1t7v8Z5C0cKs"

# Extract just the function update parts
cat > /tmp/update-functions.sql << 'EOF'
-- ============================================================
-- FUNCTION: Process recurring transactions (UPDATED)
-- ============================================================

CREATE OR REPLACE FUNCTION process_recurring_transactions()
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
-- FUNCTION: Create reminder notifications (5 days before) (UPDATED)
-- ============================================================

CREATE OR REPLACE FUNCTION create_reminder_notifications()
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
EOF

echo "SQL statements prepared. You need to execute them in Supabase SQL Editor:"
echo "1. Go to: https://app.supabase.com/project/vtnykubyupjahoalarba/sql/new"
echo "2. Copy and paste the contents of /tmp/update-functions.sql"
echo "3. Click 'Run'"
echo ""
echo "Or use Supabase CLI:"
echo "supabase db push"
