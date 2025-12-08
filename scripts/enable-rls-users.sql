-- Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT - usuário pode ver sua própria linha
CREATE POLICY "Users can view their own profile"
ON users
FOR SELECT
USING (auth.uid() = id OR true);  -- true permite públicos acesso (para signup/login)

-- Policy para UPDATE - usuário pode atualizar sua própria linha
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Policy para INSERT - qualquer um pode criar conta
CREATE POLICY "Anyone can create an account"
ON users
FOR INSERT
WITH CHECK (true);
