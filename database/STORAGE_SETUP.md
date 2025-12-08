# Supabase Storage - Configuração de Buckets

## 📋 O que foi criado

Este script configura 3 buckets (pastas) no Supabase Storage:

### 1. **avatars** (Público)
- Tipos: JPEG, PNG, GIF, WebP
- Tamanho máximo: 5MB
- Público: Qualquer um pode visualizar
- Uso: Fotos de perfil dos usuários

### 2. **receipts** (Privado)
- Tipos: JPEG, PNG, GIF, WebP, PDF
- Tamanho máximo: 10MB
- Privado: Apenas o usuário dono pode acessar
- Uso: Comprovantes escaneados

### 3. **documents** (Privado)
- Tipos: PDF, DOCX, JPEG, PNG
- Tamanho máximo: 50MB
- Privado: Apenas o usuário dono pode acessar
- Uso: Documentos gerais

## 🔧 Como Executar

### No Supabase Dashboard:

1. Vá em **SQL Editor**
2. Clique em **New Query**
3. Copie o conteúdo de `database/supabase-storage.sql`
4. Cole e execute com **Run** (ou Cmd+Enter)

### Verificar os Buckets:

1. Vá em **Storage** na sidebar esquerda
2. Você verá os 3 buckets criados
3. Clique em cada um para verificar as configurações

## 🔐 Políticas de Segurança

### Avatars (Público)
```
✓ Qualquer um pode LER
✓ Usuário pode ENVIAR seu próprio avatar (pasta com seu ID)
✓ Usuário pode DELETAR seu próprio avatar
```

Estrutura de pastas:
```
avatars/
├── 550e8400-e29b-41d4-a716-446655440000/
│   └── profile.png
└── 6ba7b810-9dad-11d1-80b4-00c04fd430c8/
    └── avatar.jpg
```

### Receipts e Documents (Privados)
```
✓ Apenas o dono pode LER
✓ Apenas o dono pode ENVIAR
✓ Apenas o dono pode DELETAR
✓ Apenas o dono pode ATUALIZAR
```

## 📝 Exemplos de Uso no Next.js

### 1. Upload de Avatar

```typescript
import { supabase } from '@/lib/supabase';

async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true, // Substitui se já existe
    });

  if (error) {
    console.error('Erro ao upload:', error);
    return null;
  }

  // Pegar URL pública do avatar
  const { data: publicData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicData.publicUrl;
}
```

### 2. Upload de Comprovante

```typescript
async function uploadReceipt(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, file);

  if (error) {
    console.error('Erro ao upload:', error);
    return null;
  }

  // Para comprovantes (privado), usar getSignedUrl
  const { data: signedData } = await supabase.storage
    .from('receipts')
    .createSignedUrl(fileName, 3600); // URL válida por 1 hora

  return signedData.signedUrl;
}
```

### 3. Deletar Avatar

```typescript
async function deleteAvatar(userId: string) {
  const { error } = await supabase.storage
    .from('avatars')
    .remove([`${userId}/avatar.png`]);

  if (error) {
    console.error('Erro ao deletar:', error);
    return false;
  }

  return true;
}
```

### 4. Download de Comprovante

```typescript
async function downloadReceipt(fileName: string) {
  const { data, error } = await supabase.storage
    .from('receipts')
    .download(fileName);

  if (error) {
    console.error('Erro ao download:', error);
    return null;
  }

  // Criar URL para download
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
}
```

## 🎯 Integração com a Página de Configurações

### Atualizar `app/configuracoes/page.tsx`:

```typescript
// Adicionar no estado
const [uploading, setUploading] = useState(false);

// Nova função para upload
const handleAvatarUpload = async (file: File) => {
  setUploading(true);
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userProfile.id}/avatar.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Atualizar URL do avatar no banco
    await supabase
      .from('users')
      .update({ avatar_url: publicData.publicUrl })
      .eq('id', userProfile.id);

    setUserProfile({
      ...userProfile,
      avatar: publicData.publicUrl,
    });

    showSuccess('Avatar atualizado com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao fazer upload do avatar');
  } finally {
    setUploading(false);
  }
};
```

## 📊 Estrutura de Pastas Recomendada

```
avatars/
├── [user-id-1]/
│   └── avatar.[jpg|png]
└── [user-id-2]/
    └── avatar.[jpg|png]

receipts/
├── [user-id-1]/
│   ├── 1733462400000.jpg
│   ├── 1733462500000.jpg
│   └── 1733462600000.pdf
└── [user-id-2]/
    ├── 1733462700000.jpg
    └── 1733462800000.jpg

documents/
├── [user-id-1]/
│   ├── invoice-2024.pdf
│   └── tax-return.pdf
└── [user-id-2]/
    ├── contract.docx
    └── invoice-2024.pdf
```

## 🔗 URLs do Supabase

### Avatar Público (direto)
```
https://[project-id].supabase.co/storage/v1/object/public/avatars/[user-id]/avatar.png
```

### Comprovante Privado (URL assinada)
```
https://[project-id].supabase.co/storage/v1/object/sign/receipts/[user-id]/[timestamp].jpg?token=[signed-token]&t=[expiration]
```

## ⚙️ Configurações Principais

| Propriedade | Valor | Descrição |
|---|---|---|
| file_size_limit (avatars) | 5,242,880 | 5MB em bytes |
| file_size_limit (receipts) | 10,485,760 | 10MB em bytes |
| file_size_limit (documents) | 52,428,800 | 50MB em bytes |
| allowed_mime_types | image/jpeg, image/png, etc | Tipos permitidos |

## 🚨 Limites do Supabase Storage

- **Free Plan:** 1GB de armazenamento
- **Pro Plan:** 100GB de armazenamento
- **Max file size:** 5GB

Ajuste `file_size_limit` conforme necessário para seu plano.

## 🐛 Troubleshooting

### Erro: "Bucket does not exist"
**Solução:** Execute o script SQL para criar os buckets

### Erro: "Access Denied"
**Solução:** Verifique se o usuário está autenticado e as políticas estão corretas

### URL de avatar não funciona
**Solução:** Confirme que o bucket 'avatars' está marcado como público

### Comprovante não carrega
**Solução:** Use `createSignedUrl` para URLs privadas com expiração

## 📚 Referências

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Signed URLs](https://supabase.com/docs/guides/storage/security/signed-urls)

---

**Criado para:** Poupa AI  
**Data:** 6 de dezembro de 2025
