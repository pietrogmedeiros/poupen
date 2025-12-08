# Poupa AI - Controle de Finanças Pessoais

Aplicação completa de controle de finanças pessoais com design moderno e recursos inteligentes.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase
- **Gráficos**: Recharts
- **OCR**: Tesseract.js
- **Ícones**: Lucide React

## ✨ Features

- ✅ Dashboard com visão geral das finanças
- ✅ Controle de entradas (receitas)
- ✅ Controle de despesas
- ✅ Histórico com gráficos inteligentes
- ✅ Análise por categorias
- ✅ Scanner de comprovantes com OCR
- ✅ Tema claro/escuro com toggle animado
- ✅ Sidebar minimalista com apenas ícones
- ✅ Design responsivo e moderno

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

## 🗄️ Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o seguinte SQL para criar a tabela:

```sql
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('income', 'expense')),
  amount decimal(10, 2) not null,
  category text not null,
  description text not null,
  date date not null,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

3. Adicione suas credenciais no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

## 🚀 Executar o Projeto

### Desenvolvimento

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend (servidor OCR)
npm run server
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Produção

```bash
npm run build
npm start
```

## 📱 Funcionalidades

### Dashboard
- Visualização do saldo atual
- Total de entradas e despesas do mês
- Transações recentes

### Entradas
- Adicionar novas receitas
- Categorização automática
- Histórico de entradas

### Despesas
- Registrar gastos
- Múltiplas categorias
- Controle mensal

### Histórico
- Gráfico de evolução temporal
- Análise por categoria (pizza)
- Comparativo entradas vs despesas
- Lista de transações recentes

### Scanner de Comprovantes
- Upload de imagem ou foto
- OCR para extrair valor
- Identificação automática de categoria
- Salvamento direto no banco

## 🎨 Temas

A aplicação suporta tema claro e escuro com um toggle animado (Sol ↔️ Lua).

## 📂 Estrutura do Projeto

```
poupa_ai/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── entradas/page.tsx     # Página de entradas
│   ├── despesas/page.tsx     # Página de despesas
│   ├── historico/page.tsx    # Página de histórico
│   ├── comprovante/page.tsx  # Scanner de comprovantes
│   └── layout.tsx            # Layout principal
├── components/
│   ├── Sidebar.tsx           # Menu lateral
│   ├── ThemeProvider.tsx     # Provider de temas
│   └── ThemeToggle.tsx       # Botão de troca de tema
├── lib/
│   └── supabase.ts           # Configuração Supabase
├── server/
│   └── index.ts              # Servidor Express + OCR
└── package.json
```

## 🔧 Próximos Passos

- [ ] Conectar com Supabase (substitua os dados mockados)
- [ ] Adicionar autenticação de usuários
- [ ] Implementar filtros avançados
- [ ] Adicionar exportação de relatórios (PDF/Excel)
- [ ] Notificações de gastos
- [ ] Meta de orçamento mensal
- [ ] Integração com bancos (Open Banking)

## 📝 Licença

MIT

---

Desenvolvido com ❤️ para ajudar você a controlar suas finanças!
