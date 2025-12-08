# Script SQL - Supabase para Poupa AI

## 📋 Descrição

Este script configura o banco de dados PostgreSQL no Supabase com todas as tabelas, índices, triggers e políticas de segurança necessárias para a aplicação Poupa AI.

## 📊 Tabelas Criadas

### 1. **users** - Usuários do Sistema
```sql
Armazena informações de login e perfil do usuário
- id (UUID) - ID único do usuário
- email (VARCHAR) - Email único para login
- password_hash (VARCHAR) - Senha criptografada
- name (VARCHAR) - Nome completo
- phone (VARCHAR) - Telefone opcional
- avatar_url (TEXT) - URL do avatar/foto de perfil
- is_active (BOOLEAN) - Usuário ativo ou desativado
- created_at, updated_at, deleted_at - Timestamps
```

### 2. **transactions** - Transações (Entradas/Despesas)
```sql
Registra todas as entradas e despesas do usuário
- id (UUID) - ID único da transação
- user_id (UUID) - FK para usuário
- type (VARCHAR) - 'income' ou 'expense'
- amount (DECIMAL) - Valor da transação
- category (VARCHAR) - Categoria (Salário, Alimentação, etc)
- description (TEXT) - Descrição detalhada
- date (DATE) - Data da transação
- receipt_url (TEXT) - URL do comprovante
- receipt_text (TEXT) - Texto extraído do comprovante
- notes (TEXT) - Notas adicionais
```

### 3. **categories** - Categorias Personalizáveis
```sql
Categorias customizáveis por usuário
- id (UUID) - ID única
- user_id (UUID) - FK para usuário
- name (VARCHAR) - Nome da categoria
- type (VARCHAR) - 'income' ou 'expense'
- color (VARCHAR) - Cor em hex (#FF0000)
- icon (VARCHAR) - Nome do ícone
```

### 4. **budgets** - Orçamentos Mensais
```sql
Define limites de gastos por categoria
- id (UUID) - ID único
- user_id (UUID) - FK para usuário
- category (VARCHAR) - Categoria limitada
- month (INTEGER) - Mês (1-12)
- year (INTEGER) - Ano
- limit_amount (DECIMAL) - Limite de gastos
- alert_percentage (INTEGER) - % para alertar (padrão 80%)
```

### 5. **receipts** - Comprovantes Escaneados
```sql
Armazena comprovantes processados por OCR
- id (UUID) - ID único
- user_id (UUID) - FK para usuário
- transaction_id (UUID) - FK para transação
- image_url (TEXT) - URL da imagem original
- extracted_text (TEXT) - Texto extraído
- detected_amount (DECIMAL) - Valor detectado
- detected_category (VARCHAR) - Categoria detectada
- confidence_score (DECIMAL) - Confiança do OCR (0-1)
- processing_status (VARCHAR) - pending, processing, success, failed
- error_message (TEXT) - Mensagem de erro se falhar
```

### 6. **user_preferences** - Preferências do Usuário
```sql
Configurações e preferências de cada usuário
- user_id (UUID) - FK para usuário (UNIQUE)
- theme (VARCHAR) - 'light', 'dark' ou 'system'
- currency (VARCHAR) - Moeda (BRL, USD, etc)
- date_format (VARCHAR) - Formato de data
- decimal_separator (VARCHAR) - ',' ou '.'
- thousands_separator (VARCHAR) - '.' ou ','
- notifications_enabled (BOOLEAN) - Notificações ativas?
- email_digest (VARCHAR) - daily, weekly, monthly, none
- language (VARCHAR) - Idioma (pt-BR, en-US, etc)
```

### 7. **monthly_summary** - Resumo Mensal
```sql
Resumo pré-calculado para melhor performance
- user_id (UUID) - FK para usuário
- month (INTEGER) - Mês
- year (INTEGER) - Ano
- total_income (DECIMAL) - Total de entradas
- total_expense (DECIMAL) - Total de despesas
- balance (DECIMAL) - Gerado automaticamente
- transaction_count (INTEGER) - Número de transações
```

### 8. **audit_log** - Log de Auditoria
```sql
Registra todas as mudanças para auditoria
- user_id (UUID) - Usuário que fez a ação
- action (VARCHAR) - 'INSERT', 'UPDATE', 'DELETE'
- table_name (VARCHAR) - Tabela afetada
- record_id (UUID) - Registro afetado
- old_values (JSONB) - Valores antigos
- new_values (JSONB) - Valores novos
- ip_address (VARCHAR) - IP da requisição
- user_agent (TEXT) - User agent do navegador
```

## 🔧 Como Usar

### Passo 1: Acessar o Supabase
1. Vá para [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. Clique em **SQL Editor** na sidebar esquerda

### Passo 2: Executar o Script
1. Clique em **New Query**
2. Copie todo o conteúdo do arquivo `database/supabase.sql`
3. Cole no editor SQL
4. Clique em **Run** (ou Cmd+Enter)

### Passo 3: Verificar as Tabelas
1. Vá para **Table Editor**
2. Confirme que todas as 8 tabelas foram criadas:
   - users
   - transactions
   - categories
   - budgets
   - receipts
   - user_preferences
   - monthly_summary
   - audit_log

## 🔐 Segurança - Row Level Security (RLS)

O script já configura RLS automaticamente. Isso significa:

- ✅ Cada usuário vê **APENAS seus próprios dados**
- ✅ Um usuário **NÃO PODE** acessar dados de outro
- ✅ As políticas são aplicadas automaticamente no banco

Exemplo:
```sql
-- Usuário A não consegue ver as transações do Usuário B
SELECT * FROM transactions WHERE user_id = 'outro-usuario';
-- Retorna: 0 linhas (bloqueado por RLS)
```

## 📍 Triggers Automáticos

O script cria triggers para atualizar `updated_at` automaticamente:

```sql
-- Quando você atualiza um registro:
UPDATE transactions SET amount = 100 WHERE id = '...';
-- O campo updated_at é atualizado automaticamente para agora
```

## 📈 Views Úteis

Duas views foram criadas para consultas comuns:

### 1. `user_transactions_summary`
```sql
SELECT * FROM user_transactions_summary;
-- Mostra todas as transações com informações do usuário
```

### 2. `user_monthly_balance`
```sql
SELECT * FROM user_monthly_balance WHERE user_id = '...';
-- Mostra balanço mensal agrupado
```

## 📝 Exemplo de Uso no Next.js

### Inserir uma Transação
```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert([
    {
      user_id: userId,
      type: 'expense',
      amount: 150.50,
      category: 'Alimentação',
      description: 'Supermercado',
      date: '2024-12-06'
    }
  ]);
```

### Buscar Transações do Usuário
```typescript
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false });
// RLS automaticamente filtra apenas do usuário autenticado
```

### Atualizar Preferências
```typescript
const { data, error } = await supabase
  .from('user_preferences')
  .upsert([
    {
      user_id: userId,
      theme: 'dark',
      currency: 'BRL',
      language: 'pt-BR'
    }
  ]);
```

## 🚨 Importante

1. **Habilitar Supabase Auth:**
   - Vá em **Authentication > Providers**
   - Ative "Email" como provider
   - Configure de acordo com sua necessidade

2. **Política de Retenção:**
   - O script usa soft delete (`deleted_at`)
   - Dados nunca são deletados fisicamente
   - Você pode restaurar se necessário

3. **Backup:**
   - O Supabase faz backup automático
   - Você pode restaurar em caso de necessidade

4. **Performance:**
   - Os índices já estão criados
   - Para tabelas muito grandes, considere adicionar mais índices

## ❓ Troubleshooting

### Erro: "permission denied for schema public"
**Solução:** Garanta que você está logado como super admin do projeto

### Erro: "relation already exists"
**Solução:** O script já foi executado. Execute `DROP TABLE IF EXISTS` para remover e recriar

### RLS bloqueando acesso?
**Solução:** Confirme que o usuário está autenticado e o token é válido

## 📞 Próximos Passos

1. Configure a autenticação do Supabase Auth no Next.js
2. Atualize os endpoints da API para usar as novas tabelas
3. Implemente os formulários de login/registro
4. Conecte o OCR ao banco de dados (salvar em `receipts` e `transactions`)

---

**Criado para: Poupa AI**  
**Data:** 6 de dezembro de 2025  
**Versão:** 1.0
