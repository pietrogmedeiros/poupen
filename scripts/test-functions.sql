-- ============================================================
-- TESTE 1: Verificar se as funções existem
-- ============================================================
SELECT 'TESTE 1: Funções Existem?' as teste;
SELECT proname FROM pg_proc 
WHERE proname IN ('process_recurring_transactions', 'create_reminder_notifications')
ORDER BY proname;

-- ============================================================
-- TESTE 2: Ver definição da função (verificar se tem VALUES)
-- ============================================================
SELECT 'TESTE 2: Definição de process_recurring_transactions' as teste;
SELECT pg_get_functiondef('process_recurring_transactions()'::regprocedure) as definicao;

-- ============================================================
-- TESTE 3: Executar função manualmente
-- ============================================================
SELECT 'TESTE 3: Executar function manualmente' as teste;
SELECT * FROM process_recurring_transactions();
