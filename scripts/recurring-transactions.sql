-- ============================================================
-- RECURRING TRANSACTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(100),
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE NOT NULL,
  day_of_month INT CHECK (day_of_month >= 1 AND day_of_month <= 31),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_occurrence ON recurring_transactions(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_transactions(active);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('reminder', 'created', 'failed')),
  scheduled_for DATE NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================================
-- FUNCTION: Calculate next occurrence date
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_next_occurrence(
  p_frequency VARCHAR,
  p_current_date DATE,
  p_day_of_month INT DEFAULT NULL
) RETURNS DATE AS $$
DECLARE
  v_next_date DATE;
BEGIN
  CASE p_frequency
    WHEN 'daily' THEN
      v_next_date := p_current_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      v_next_date := p_current_date + INTERVAL '7 days';
    WHEN 'biweekly' THEN
      v_next_date := p_current_date + INTERVAL '14 days';
    WHEN 'monthly' THEN
      IF p_day_of_month IS NOT NULL THEN
        v_next_date := DATE_TRUNC('month', p_current_date + INTERVAL '1 month')::DATE + ((p_day_of_month - 1) || ' days')::INTERVAL;
      ELSE
        v_next_date := p_current_date + INTERVAL '1 month';
      END IF;
    WHEN 'quarterly' THEN
      v_next_date := p_current_date + INTERVAL '3 months';
    WHEN 'yearly' THEN
      v_next_date := p_current_date + INTERVAL '1 year';
    ELSE
      v_next_date := p_current_date;
  END CASE;
  
  RETURN v_next_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Process recurring transactions
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
-- FUNCTION: Create reminder notifications (5 days before)
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
