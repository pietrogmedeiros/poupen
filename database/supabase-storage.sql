-- ============================================================
-- SUPABASE STORAGE - Configuração de Buckets
-- ============================================================

-- ============================================================
-- 1. CRIAR BUCKET PARA AVATARES
-- ============================================================
INSERT INTO storage.buckets (id, name, owner, public, avail_encryption_key_id, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'avatars',
  'avatars',
  NULL,
  true,
  NULL,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. CRIAR BUCKET PARA COMPROVANTES
-- ============================================================
INSERT INTO storage.buckets (id, name, owner, public, avail_encryption_key_id, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'receipts',
  'receipts',
  NULL,
  false, -- Privado, apenas usuário pode acessar
  NULL,
  10485760, -- 10MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']::text[],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. CRIAR BUCKET PARA DOCUMENTOS
-- ============================================================
INSERT INTO storage.buckets (id, name, owner, public, avail_encryption_key_id, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'documents',
  'documents',
  NULL,
  false, -- Privado
  NULL,
  52428800, -- 50MB em bytes
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. POLÍTICAS DE ACESSO - AVATARS (Públicos)
-- ============================================================

-- Permitir leitura pública de avatares
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Permitir usuário fazer upload de seu próprio avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir usuário deletar seu próprio avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 5. POLÍTICAS DE ACESSO - RECEIPTS (Privados)
-- ============================================================

-- Permitir usuário fazer upload de comprovante
DROP POLICY IF EXISTS "Users can upload receipts" ON storage.objects;
CREATE POLICY "Users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir usuário ler seus próprios comprovantes
DROP POLICY IF EXISTS "Users can read their own receipts" ON storage.objects;
CREATE POLICY "Users can read their own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir usuário deletar seus próprios comprovantes
DROP POLICY IF EXISTS "Users can delete their receipts" ON storage.objects;
CREATE POLICY "Users can delete their receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir usuário atualizar seus próprios comprovantes
DROP POLICY IF EXISTS "Users can update their receipts" ON storage.objects;
CREATE POLICY "Users can update their receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 6. POLÍTICAS DE ACESSO - DOCUMENTS (Privados)
-- ============================================================

-- Permitir usuário fazer upload de documento
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
CREATE POLICY "Users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir usuário ler seus próprios documentos
DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
CREATE POLICY "Users can read their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir usuário deletar seus próprios documentos
DROP POLICY IF EXISTS "Users can delete their documents" ON storage.objects;
CREATE POLICY "Users can delete their documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- INSTRUÇÕES DE USO:
-- ============================================================
-- 1. Execute este script na aba SQL Editor do Supabase
-- 2. Três buckets serão criados automaticamente:
--    - avatars (Público, 5MB, imagens)
--    - receipts (Privado, 10MB, imagens + PDF)
--    - documents (Privado, 50MB, documentos)
-- 3. As políticas de acesso já estão configuradas
-- 4. Use os URLs do Supabase para acessar os arquivos
-- ============================================================
