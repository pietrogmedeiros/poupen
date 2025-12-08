-- ============================================================
-- POUPA AI - Database Schema
-- Supabase PostgreSQL Database
-- ============================================================

-- ============================================================
-- 1. USERS TABLE (Usuários / Autenticação)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Index para melhor performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================
-- 2. TRANSACTIONS TABLE (Transações - Entradas e Despesas)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  receipt_text TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes para melhor performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ============================================================
-- 3. CATEGORIES TABLE (Categorias Personalizáveis)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  color VARCHAR(7),
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name, type)
);

-- Indexes
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- ============================================================
-- 4. BUDGETS TABLE (Orçamentos Mensais)
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  limit_amount DECIMAL(15, 2) NOT NULL,
  alert_percentage INTEGER DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category, month, year)
);

-- Indexes
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_year_month ON budgets(year, month);

-- ============================================================
-- 5. RECEIPTS TABLE (Comprovantes Escaneados)
-- ============================================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  extracted_text TEXT,
  detected_amount DECIMAL(15, 2),
  detected_category VARCHAR(100),
  confidence_score DECIMAL(3, 2),
  processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_transaction_id ON receipts(transaction_id);
CREATE INDEX idx_receipts_status ON receipts(processing_status);

-- ============================================================
-- 6. USER_PREFERENCES TABLE (Preferências do Usuário)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  currency VARCHAR(3) DEFAULT 'BRL',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  decimal_separator VARCHAR(1) DEFAULT ',',
  thousands_separator VARCHAR(1) DEFAULT '.',
  notifications_enabled BOOLEAN DEFAULT true,
  email_digest VARCHAR(20) DEFAULT 'weekly' CHECK (email_digest IN ('daily', 'weekly', 'monthly', 'none')),
  language VARCHAR(10) DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. MONTHLY_SUMMARY TABLE (Resumo Mensal)
-- ============================================================
CREATE TABLE IF NOT EXISTS monthly_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  total_income DECIMAL(15, 2) DEFAULT 0,
  total_expense DECIMAL(15, 2) DEFAULT 0,
  balance DECIMAL(15, 2) GENERATED ALWAYS AS (total_income - total_expense) STORED,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month, year)
);

-- Indexes
CREATE INDEX idx_monthly_summary_user_id ON monthly_summary(user_id);
CREATE INDEX idx_monthly_summary_year_month ON monthly_summary(year, month);

-- ============================================================
-- 8. AUDIT_LOG TABLE (Log de Auditoria)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- ============================================================
-- INITIAL DATA - DEFAULT CATEGORIES
-- ============================================================
-- Nota: Você precisa inserir dados de exemplo após criar um usuário

-- ============================================================
-- TRIGGERS - Atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para users
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para transactions
DROP TRIGGER IF EXISTS trigger_transactions_updated_at ON transactions;
CREATE TRIGGER trigger_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para categories
DROP TRIGGER IF EXISTS trigger_categories_updated_at ON categories;
CREATE TRIGGER trigger_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para budgets
DROP TRIGGER IF EXISTS trigger_budgets_updated_at ON budgets;
CREATE TRIGGER trigger_budgets_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para receipts
DROP TRIGGER IF EXISTS trigger_receipts_updated_at ON receipts;
CREATE TRIGGER trigger_receipts_updated_at
BEFORE UPDATE ON receipts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_preferences
DROP TRIGGER IF EXISTS trigger_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trigger_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para monthly_summary
DROP TRIGGER IF EXISTS trigger_monthly_summary_updated_at ON monthly_summary;
CREATE TRIGGER trigger_monthly_summary_updated_at
BEFORE UPDATE ON monthly_summary
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEW - Transações do Usuário com Resumo
-- ============================================================
CREATE OR REPLACE VIEW user_transactions_summary AS
SELECT 
  t.id,
  t.user_id,
  t.type,
  t.amount,
  t.category,
  t.description,
  t.date,
  t.created_at,
  u.name as user_name,
  u.email
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.deleted_at IS NULL
ORDER BY t.date DESC;

-- ============================================================
-- VIEW - Balanço Mensal por Usuário
-- ============================================================
CREATE OR REPLACE VIEW user_monthly_balance AS
SELECT 
  DATE_TRUNC('month', t.date)::DATE as month_start,
  EXTRACT(YEAR FROM t.date)::INTEGER as year,
  EXTRACT(MONTH FROM t.date)::INTEGER as month,
  t.user_id,
  u.name as user_name,
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expense,
  SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) - 
  SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as balance
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', t.date), EXTRACT(YEAR FROM t.date), EXTRACT(MONTH FROM t.date), t.user_id, u.name;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Segurança
-- ============================================================
-- Ativar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para transactions (usuário só vê suas próprias transações)
DROP POLICY IF EXISTS transactions_user_policy ON transactions;
CREATE POLICY transactions_user_policy ON transactions
FOR ALL USING (auth.uid() = user_id);

-- Políticas para categories
DROP POLICY IF EXISTS categories_user_policy ON categories;
CREATE POLICY categories_user_policy ON categories
FOR ALL USING (auth.uid() = user_id);

-- Políticas para budgets
DROP POLICY IF EXISTS budgets_user_policy ON budgets;
CREATE POLICY budgets_user_policy ON budgets
FOR ALL USING (auth.uid() = user_id);

-- Políticas para receipts
DROP POLICY IF EXISTS receipts_user_policy ON receipts;
CREATE POLICY receipts_user_policy ON receipts
FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_preferences
DROP POLICY IF EXISTS user_preferences_user_policy ON user_preferences;
CREATE POLICY user_preferences_user_policy ON user_preferences
FOR ALL USING (auth.uid() = user_id);

-- Políticas para monthly_summary
DROP POLICY IF EXISTS monthly_summary_user_policy ON monthly_summary;
CREATE POLICY monthly_summary_user_policy ON monthly_summary
FOR ALL USING (auth.uid() = user_id);

-- Políticas para audit_log
DROP POLICY IF EXISTS audit_log_user_policy ON audit_log;
CREATE POLICY audit_log_user_policy ON audit_log
FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- GRANTS - Permissões para usuários autenticados
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- INSTRUÇÕES DE USO:
-- ============================================================
-- 1. Execute este script na aba SQL Editor do Supabase
-- 2. Após criar um usuário, crie registro correspondente na tabela 'users'
-- 3. Para autenticação segura, use o Supabase Auth com this script para tabela de usuários
-- 4. Row Level Security (RLS) garante que cada usuário vê apenas seus dados
-- ============================================================
