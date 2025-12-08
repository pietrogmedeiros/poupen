-- Script para criar os buckets de storage no Supabase
-- Execute isso no SQL Editor do Supabase Dashboard

-- Criar bucket para avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para comprovantes/recibos
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Pronto! Os buckets foram criados.
-- Para ajustar as políticas de segurança, vá para:
-- Supabase Dashboard > Storage > Policies


