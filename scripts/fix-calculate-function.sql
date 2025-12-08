-- ============================================================
-- CORRIGIR FUNÇÃO calculate_next_occurrence
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
