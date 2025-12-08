#!/bin/bash

# Script para validar se o build funcionará na Vercel

echo "Validando configuração para deploy..."
echo ""

# Verificar Node version
echo "✓ Node Version: $(node --version)"

# Verificar variáveis de ambiente
echo ""
echo "Verificando variáveis de ambiente:"

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "✗ NEXT_PUBLIC_SUPABASE_URL não configurada"
  exit 1
else
  echo "✓ NEXT_PUBLIC_SUPABASE_URL configurada"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "✗ SUPABASE_SERVICE_ROLE_KEY não configurada"
  exit 1
else
  echo "✓ SUPABASE_SERVICE_ROLE_KEY configurada"
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo "✗ GEMINI_API_KEY não configurada"
  exit 1
else
  echo "✓ GEMINI_API_KEY configurada"
fi

echo ""
echo "Verificando dependências..."
npm list @supabase/supabase-js > /dev/null 2>&1 || { echo "✗ @supabase/supabase-js não instalado"; exit 1; }
echo "✓ @supabase/supabase-js instalado"

npm list @google/generative-ai > /dev/null 2>&1 || { echo "✗ @google/generative-ai não instalado"; exit 1; }
echo "✓ @google/generative-ai instalado"

echo ""
echo "Tentando fazer build..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ Build bem-sucedido!"
  echo "Você está pronto para fazer deploy na Vercel"
else
  echo ""
  echo "✗ Build falhou. Corrija os erros acima"
  exit 1
fi
