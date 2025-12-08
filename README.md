# Poupen - Controle de Finanças Pessoais

Uma aplicação web moderna para gerenciar finanças pessoais com recursos inteligentes de análise, categorização dinâmica e visualizações em tempo real.

## Visão Geral

Poupen é uma plataforma completa de controle financeiro que combina a simplicidade de uso com funcionalidades avançadas como:

- Gerenciamento de entradas e despesas
- Análise inteligente com IA (Google Gemini)
- Gráficos interativos e responsivos
- Categorização dinâmica de transações
- Transações recorrentes com agendamento
- Interface totalmente responsiva (desktop e mobile)

## Características Principais

### Entradas e Despesas
- Registro rápido de transações com formulário intuitivo
- Criação dinâmica de categorias durante a entrada de dados
- Suporte para transações recorrentes
- Histórico completo com filtros

### Análise com IA
- Previsão de gastos para o próximo mês
- Recomendações financeiras baseadas em dados
- Análise detalhada de padrões de gastos
- Confiança calculada baseada em histórico

### Visualizações
- Gráfico de evolução de entradas vs despesas
- Gráfico de pizza (donut) para despesas por categoria
- Transações recentes com filtros
- Dashboard com resumo do mês atual

### Interface
- Design moderno com tema escuro
- Totalmente responsivo (mobile-first)
- Menu hamburger para dispositivos móveis
- Transições suaves e animações fluidas
- Dark mode por padrão

## Stack Tecnológico

### Frontend
- **Next.js 16.0.7** com Turbopack
- **React 18** com Hooks
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **Recharts** para gráficos interativos

### Backend
- **Next.js API Routes**
- **Google Generative AI** (Gemini 1.5 Flash)
- **Node.js/TypeScript**

### Banco de Dados
- **Supabase** (PostgreSQL)
- Autenticação e autorização
- Row Level Security (RLS)
- WebSocket em tempo real

## Instalação e Setup

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase
- API Key do Google Gemini

### 1. Clonar repositório
```bash
git clone https://github.com/pietrogmedeiros/poupen.git
cd poupen
npm install
```

### 2. Configurar variáveis de ambiente
Criar arquivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

GEMINI_API_KEY=sua_api_key_gemini
```

### 3. Configurar banco de dados
Execute os scripts SQL no Supabase:

```bash
# Executar schema básico
cat database/supabase.sql | psql

# Configurar storage (opcional)
cat database/supabase-storage.sql | psql
```

### 4. Iniciar desenvolvimento
```bash
npm run dev
```

Acesse em `http://localhost:3000`

## Estrutura do Projeto

```
poupen/
├── app/
│   ├── api/              # API routes (AI, CRUD, etc)
│   ├── analises/         # Dashboard de análises
│   ├── despesas/         # Página de despesas
│   ├── entradas/         # Página de entradas
│   ├── historico/        # Histórico com gráficos
│   ├── recorridos/       # Transações recorrentes
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Dashboard
│
├── components/
│   ├── CategoryInput.tsx  # Input dinâmico de categorias
│   ├── MobileNav.tsx      # Menu mobile
│   ├── Sidebar.tsx        # Sidebar navegação
│   └── ui/                # Componentes reutilizáveis
│
├── lib/
│   ├── gemini.ts          # Integração com IA
│   ├── auth-context.tsx   # Contexto de autenticação
│   └── supabase-queries.ts # Queries do banco
│
└── database/
    ├── supabase.sql       # Schema inicial
    └── supabase-storage.sql # Configuração storage
```

## Funcionalidades Detalhadas

### Categorias Dinâmicas
Ao adicionar uma despesa/entrada, você pode:
1. Selecionar uma categoria existente
2. Ou criar uma nova categoria digitando seu nome
3. A categoria é automaticamente salva no banco de dados
4. Fica disponível para futuras transações

### Análises com IA
Três endpoints principais:
- `/api/ai/forecast` - Previsão de gastos
- `/api/ai/insights` - Recomendações financeiras
- `/api/ai/analyze` - Análise detalhada

### Transações Recorrentes
- Configure transações que se repetem automaticamente
- Suporte para: diário, semanal, quinzenal, mensal, trimestral, anual
- Processamento automático via cron job

### Dashboard
Exibe em tempo real:
- Saldo total do mês
- Total de entradas
- Total de despesas
- Últimas transações
- Análises de IA

## Scripts Disponíveis

```bash
npm run dev      # Iniciar servidor de desenvolvimento
npm run build    # Build para produção
npm start        # Iniciar servidor de produção
```

## Autenticação

A aplicação usa autenticação local com localStorage:
- Registro e login de usuários
- Senha com hash (bcrypt)
- Contexto de autenticação para proteger rotas
- Headers x-user-id para verificação nas APIs

## Banco de Dados

### Tabelas Principais

**users** - Usuários do sistema
```
id, email, name, password_hash, created_at
```

**transactions** - Entradas e despesas
```
id, user_id, type, amount, category, description, date, created_at
```

**categories** - Categorias dinâmicas
```
id, user_id, name, type, color, icon, created_at
```

**recurring_transactions** - Transações recorrentes
```
id, user_id, description, amount, category, type, frequency, start_date, end_date
```

## Performance

- Otimizado com Next.js 16 Turbopack
- Imagens otimizadas
- Code splitting automático
- Cache em cliente via React Query patterns
- API routes otimizadas

## Responsividade

A aplicação é totalmente responsiva:
- Desktop: Sidebar + conteúdo
- Tablet: Sidebar colapsável
- Mobile: Menu hamburger

Breakpoints Tailwind utilizados:
- sm: 640px
- md: 768px
- lg: 1024px

## Gráficos e Visualizações

Utilizamos Recharts para:
- Gráficos de linha com animações suaves
- Gráficos de pizza (donut) com múltiplas cores
- Tooltips customizados
- Responsividade automática

## Segurança

- Row Level Security (RLS) no Supabase
- Validação de entrada no backend
- Proteção de rotas com autenticação
- Headers de segurança
- CORS configurado

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto é de código aberto sob a licença MIT.

## Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email.

## Roadmap

- [ ] Orçamentos personalizados
- [ ] Exportação de dados (CSV, PDF)
- [ ] Múltiplas moedas
- [ ] Integração com contas bancárias
- [ ] App mobile nativa
- [ ] Compartilhamento de orçamento
- [ ] Mais modelos de IA para análises

## Versão

v0.1.0 - Lançamento inicial

---

Desenvolvido com dedicação para melhorar o controle financeiro pessoal.
