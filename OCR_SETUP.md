# Configuração do OCR em Produção

## Opção 1: Usando Google Cloud Vision API (Recomendado)

Se quiser ativar o OCR automático em produção, siga estos passos:

### 1. Criar projeto no Google Cloud
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative a API "Cloud Vision API"
4. Crie uma chave de API

### 2. Adicionar a chave ao Vercel
1. Vá para seu projeto no Vercel
2. Acesse Settings → Environment Variables
3. Adicione: `GOOGLE_VISION_API_KEY` = sua chave

### 3. Testade
A feature funcionará automaticamente após o deploy.

## Opção 2: Sem OCR Automático (Padrão Atual)

Se não configurar a API, o app funcionará normalmente permitindo entrada manual de dados. Isso é completamente funcional!

## Alternativa: Usar Tesseract.js Localmente

Para desenvolvimento local com OCR completo:

```bash
# Terminal 1: Servidor OCR
npm run server

# Terminal 2: Dev server
npm run dev
```

Acesse: http://localhost:3000/comprovante
