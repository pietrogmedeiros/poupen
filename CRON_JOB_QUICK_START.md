# 🚀 Configuração de Cron Job - Resumo da Implementação

## Status: ✅ Cron Job Pronto para Usar

### O que foi criado:

1. **Endpoint de Processamento**: `/api/cron/process-recurring`
   - Processa transações recorrentes vencidas
   - Cria notificações automáticas
   - Requer autenticação via header `Authorization: Bearer CRON_SECRET`

2. **Documentação Completa**
   - `CRON_JOB_SETUP.md` - Instruções para 5 serviços diferentes
   - `FIX_SUPABASE_FUNCTIONS.md` - Como corrigir as funções SQL

3. **Variáveis de Ambiente**
   ```
   CRON_SECRET=poupa-ai-cron-secret-2024
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ⚠️ Próximo Passo: Executar SQL no Supabase

### Instruções Rápidas:

#### 1️⃣ Abra o Supabase SQL Editor
```
https://app.supabase.com/project/vtnykubyupjahoalarba/sql/new
```

#### 2️⃣ Cole o SQL Corrigido
O SQL foi copiado para seu clipboard. Basta colar no editor.

Se não estiver no clipboard, copie deste arquivo:
```
/Users/pietro_medeiros/Downloads/poupa_ai/scripts/fix-recurring-functions.sql
```

#### 3️⃣ Clique "Run"
Espere pela mensagem de sucesso.

---

## 🧪 Teste o Cron Job

Depois de executar o SQL, rode este comando:

```bash
curl -X POST http://localhost:3000/api/cron/process-recurring \
  -H "Authorization: Bearer poupa-ai-cron-secret-2024" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Resposta Esperada:
```json
{
  "success": true,
  "message": "Transações recorrentes processadas com sucesso",
  "processedTransactions": 0,
  "reminders": 0
}
```

> **Nota**: Mostra 0 porque ainda não há transações recorrentes. Crie uma para testar!

---

## 🔧 Configurar Cron Automático

Escolha uma opção abaixo:

### Opção 1: EasyCron (Gratuito, Recomendado para Teste)
1. Acesse https://www.easycron.com/
2. Crie nova cron job
3. URL: `https://seu-dominio.com/api/cron/process-recurring`
4. Header: `Authorization: Bearer poupa-ai-cron-secret-2024`
5. Frequency: Diariamente às 00:30 (São Paulo)

### Opção 2: Vercel (Se estiver hospedado no Vercel)
1. Configure em `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/process-recurring",
    "schedule": "30 0 * * *"
  }]
}
```

### Opção 3: GitHub Actions (Gratuito)
1. Crie `.github/workflows/daily-notifications.yml`
2. Configure secret `CRON_SECRET`
3. Schedule: `30 0 * * *` (UTC)

Ver detalhes completos em: `CRON_JOB_SETUP.md`

---

## 📊 Como Funciona o Processamento

### Diariamente (via cron job):

1. **Process Recurring Transactions**
   - Busca transações com `next_occurrence = hoje`
   - Cria nova transação de entrada/despesa
   - Calcula próxima ocorrência
   - Cria notificação "Transação recorrente criada"

2. **Create Reminder Notifications**
   - Busca transações vencendo em exatamente 5 dias
   - Cria notificação tipo "reminder"
   - Usuário vê no Sidebar e recebe toast em tempo real (WebSocket)

3. **Smart Notification Display**
   - Lembretes mostram dias restantes
   - No vencimento muda para "vencida" (vermelho)
   - Usuário marca como lida e badge é atualizado

---

## 📝 Exemplos de Teste

### 1. Criar Transação Recorrente
1. Vá para "Entradas" ou "Despesas"
2. Marque "Tornar recorrente"
3. Escolha frequência "Diariamente"
4. Salve

### 2. Forçar Processamento
```bash
curl -X POST http://localhost:3000/api/cron/process-recurring \
  -H "Authorization: Bearer poupa-ai-cron-secret-2024" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Ver Notificações
- Acesse: http://localhost:3000/notificacoes
- Veja o badge no Sidebar
- Marque como lida

---

## ✅ Checklist de Implementação

- [x] Endpoint `/api/cron/process-recurring` criado
- [x] Autenticação via CRON_SECRET implementada
- [x] Funções SQL criadas e documentadas
- [x] Bug de ambiguidade corrigido
- [x] Documentação de setup completa
- [ ] SQL executado no Supabase ⬅️ **PRÓXIMO PASSO**
- [ ] Cron automático configurado em um serviço
- [ ] Testado com transação recorrente real

---

## 📚 Referências Rápidas

| Arquivo | Propósito |
|---------|-----------|
| `app/api/cron/process-recurring/route.ts` | Endpoint cron job |
| `scripts/recurring-transactions.sql` | Schema SQL completo |
| `scripts/fix-recurring-functions.sql` | Funções corrigidas (execute isto!) |
| `CRON_JOB_SETUP.md` | 5 opções de serviços cron |
| `FIX_SUPABASE_FUNCTIONS.md` | Tutorial passo a passo |

---

## 🆘 Troubleshooting

### "Unauthorized" (401)
- Verifique se `CRON_SECRET` está em `.env.local`
- Confirme header: `Authorization: Bearer poupa-ai-cron-secret-2024`

### "column reference is ambiguous"
- Execute o SQL em `scripts/fix-recurring-functions.sql`
- Drop e recrie as funções (NÃO use CREATE OR REPLACE)

### Notificações não aparecem
- Verifique se há transações recorrentes com `next_occurrence = hoje`
- Confirme que WebSocket está ativo (Toast deve aparecer)
- Verifique logs em Supabase Dashboard

### Cron não executa automaticamente
- Para EasyCron: Teste manualmente primeiro no painel
- Confirme UTC vs timezone local
- Verifique logs do seu serviço (Vercel, GitHub Actions, etc)

---

## 🎯 Próximos Passos após Configurar Cron

1. Implementar RLS policies (segurança)
2. Upgrade para bcrypt password hashing
3. Adicionar validação de email
4. Integrar OCR para recibos
5. Deploy em produção

---

**Última atualização**: 8 de dezembro de 2025
**Criado por**: GitHub Copilot
**Status**: Pronto para uso após executar SQL no Supabase
