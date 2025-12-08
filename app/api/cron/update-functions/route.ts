import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'your-secret-key';

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // SQL to update process_recurring_transactions function
    const updateProcessSQL = `
    DROP FUNCTION IF EXISTS process_recurring_transactions();
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
    `;

    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: updateProcessSQL
    });

    if (updateError) {
      // Try a simpler approach - just recreate inline
      console.log('SQL execution approach failed, trying simpler method...');
    }

    // Instead, call the existing (but broken) function to get the error details
    // Then we'll provide instructions to manually update
    return NextResponse.json({
      success: false,
      message: 'Please manually update the functions in Supabase',
      instructions: {
        step1: 'Go to https://app.supabase.com/project/vtnykubyupjahoalarba/sql/new',
        step2: 'Copy the SQL from scripts/recurring-transactions.sql',
        step3: 'Paste and run the functions section (CREATE OR REPLACE FUNCTION process_recurring_transactions and create_reminder_notifications)',
        step4: 'The issue is: RETURN QUERY with column references was causing ambiguity - fixed to use RETURN QUERY VALUES instead'
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
