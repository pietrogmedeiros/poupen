# Guia de Deploy na Vercel

## Pré-requisitos

1. Conta no Vercel
2. Repositório GitHub conectado

## Passo a Passo

### 1. Importar projeto no Vercel

```bash
# Acesse https://vercel.com/new e selecione seu repositório
# Ou use o Vercel CLI:
npm i -g vercel
vercel
```

### 2. Configurar Variáveis de Ambiente

No dashboard da Vercel, acesse **Settings > Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
GEMINI_API_KEY=sua-chave-gemini
CRON_SECRET=seu-cron-secret
```

### 3. Obter as Credenciais

**Supabase:**
- Acesse https://app.supabase.com
- Vá em Project Settings > API
- Copie `URL` e as chaves

**Google Gemini:**
- Acesse https://aistudio.google.com/app/apikey
- Crie uma nova chave de API

### 4. Deploy

```bash
# Automaticamente via GitHub (recomendado)
# Quando fazer push para main, Vercel faz deploy automático

# Ou manualmente:
vercel --prod
```

### 5. Verificar Logs

No dashboard da Vercel:
- Clique em seu projeto
- Vá em "Deployments"
- Clique no deploy e veja os logs

## Troubleshooting

### Erro: "supabaseUrl is required"
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` está configurado nas variáveis de ambiente da Vercel
- Não use variáveis do `.env.local` - elas só funcionam localmente

### Erro: Build timeout
- Aumentar timeout em Vercel Settings > Build and Development Settings
- Limpar cache: Settings > Git > Redeploy

### Erro: API calls failing
- Verificar se CORS está configurado no Supabase
- Adicionar domínio da Vercel em URL Configuration

## URLs Úteis

- Dashboard Vercel: https://vercel.com/dashboard
- Supabase Console: https://app.supabase.com
- Google AI Studio: https://aistudio.google.com

## Após Deploy

1. Testar acesso em https://seu-app.vercel.app
2. Verificar funcionalidades principais (login, transações, IA)
3. Monitorar logs para erros
4. Configurar domain customizado (opcional)
