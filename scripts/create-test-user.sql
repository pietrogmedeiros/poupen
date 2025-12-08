-- Script para criar usuário de teste na tabela users
-- Execute isso no SQL Editor do Supabase Dashboard

-- Inserir usuário de teste
INSERT INTO users (
  id,
  name,
  email,
  phone,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Pietro Medeiros',
  'pietro@example.com',
  '(11) 98765-4321',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verificar se foi criado
SELECT * FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';
