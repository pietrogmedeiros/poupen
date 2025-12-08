# 🤖 Sistema de IA com Gemini - Visão Geral

## Arquitetura Implementada

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React/Next.js)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  /analises page                                     │
│    ├─ useSpendingForecast()                        │
│    ├─ useFinancialInsights()                       │
│    └─ useTransactionAnalysis()                     │
│                                                     │
│  Componentes UI:                                    │
│    ├─ Card, CardHeader, CardTitle, etc            │
│    ├─ Alert, AlertTitle, AlertDescription         │
│    ├─ Button                                       │
│    └─ Skeleton (loading states)                    │
│                                                     │
└──────────────────────┬──────────────────────────────┘
                       │
                  API Calls
                       │
       ┌───────────────┴───────────────┐
       │                               │
┌──────▼─────────────┐    ┌───────────▼──────────┐
│  API Endpoints     │    │   Gemini 1.5 Flash   │
├────────────────────┤    ├──────────────────────┤
│ GET  /ai/forecast  │───▶│  Análise de Gastos   │
│ GET  /ai/insights  │───▶│  Recomendações      │
│ POST /ai/analyze   │───▶│  Padrões            │
└──────┬─────────────┘    └──────────────────────┘
       │
       └──────────────────┐
                          │
                   ┌──────▼───────┐
                   │  Supabase    │
                   ├──────────────┤
                   │ transactions │
                   │ users        │
                   └──────────────┘
```

## 3 Cards de Análise

### 1️⃣ **Previsão de Gastos** (Card Azul)
```
┌─ Título: "Previsão de Gastos - Próximo Mês"
│
├─ Dados:
│  ├─ Média Mensal: R$ 2.500,00
│  ├─ Previsão: R$ 2.650,00
│  └─ Confiança: Alta
│
├─ Breakdown por Categoria:
│  ├─ Alimentação: R$ 850 (↑ Crescente)
│  ├─ Transporte: R$ 450 (→ Estável)
│  └─ Lazer: R$ 300 (↓ Decrescente)
│
└─ Insights automáticos
```

### 2️⃣ **Recomendações Financeiras** (Card Verde)
```
┌─ Resumo Executivo:
│  "Sua situação está estável. Renda > Despesas"
│
├─ Alertas (se houver):
│  ├─ Gasto crescente em Lazer
│  └─ Categoria crítica: Transporte
│
├─ Recomendações:
│  ├─ Reduzir gastos com alimentação em 5%
│  ├─ Revisar assinaturas de lazer
│  └─ Aumentar economia mensal
│
└─ Oportunidades:
   ├─ Economizar R$ 100/mês em Transporte
   └─ Renegociar Alimentação
```

### 3️⃣ **Análise Detalhada** (Card Roxo)
```
┌─ Insights de Padrões:
│  "Seus maiores gastos concentram-se em..."
│
├─ Gráfico de Categorias:
│  ├─ Alimentação: 35% [███████░░]
│  ├─ Transporte: 20% [████░░░░░]
│  └─ Outros: 45% [█████████░]
│
├─ Top 5 Maiores Gastos:
│  ├─ Supermercado: R$ 500 (07 Dec)
│  ├─ Uber: R$ 150 (06 Dec)
│  ├─ Netflix: R$ 50 (05 Dec)
│  ├─ Restaurante: R$ 200 (04 Dec)
│  └─ Gasolina: R$ 180 (03 Dec)
│
└─ Botão "Analisar" para período específico
```

## Fluxo de Dados

```
1. Usuário acessa /analises
   ↓
2. Página carrega com loading skeletons
   ↓
3. useSpendingForecast() → GET /api/ai/forecast
   ↓
4. API busca transações dos últimos 6 meses
   ↓
5. Envia para Gemini: "Analise estes gastos..."
   ↓
6. Gemini retorna JSON com previsão estruturada
   ↓
7. React renderiza os cards com dados
   ↓
8. Usuário vê análise completa + recomendações
```

## Como o Gemini Analisa

### Entrada (Prompt):
```
Gastos por categoria (últimos 6 meses):
- Alimentação: 800, 850, 900, 920, 950, 1000
- Transporte: 200, 210, 215, 220, 220, 225
- Lazer: 150, 140, 130, 120, 110, 100

Forneça previsão para próximo mês com:
- monthlyAverage
- nextMonthPrediction
- confidence ("high"|"medium"|"low")
- insights (3-4 frases sobre padrões)
- categories (com trend: increasing/decreasing/stable)
```

### Saída (Response):
```json
{
  "monthlyAverage": 2250,
  "nextMonthPrediction": 2350,
  "confidence": "high",
  "insights": [
    "Alimentação crescendo consistentemente",
    "Lazer em tendência de queda",
    "Padrão muito previsível"
  ],
  "categories": [
    {
      "name": "Alimentação",
      "avgSpend": 900,
      "predictedSpend": 950,
      "trend": "increasing"
    }
  ]
}
```

## Recursos Especiais da IA

✅ **Análise Contextual**
- Entende o significado dos gastos
- Identifica padrões complexos
- Faz recomendações baseadas em lógica

✅ **Previsão Inteligente**
- Reconhece tendências
- Calcula margem de confiança
- Cria insights narrativos

✅ **Recomendações Personalizadas**
- Baseadas em dados reais do usuário
- Priorizadas por impacto potencial
- Acionáveis e específicas

## Estrutura de Pastas

```
poupa_ai/
├── app/
│   ├── analises/
│   │   └── page.tsx           ← Interface principal
│   └── api/ai/
│       ├── forecast/route.ts  ← API de previsão
│       ├── insights/route.ts  ← API de recomendações
│       └── analyze/route.ts   ← API de análise
│
├── lib/
│   ├── gemini.ts              ← Integração com Gemini
│   └── hooks/
│       └── useAI.ts           ← Hooks React
│
├── components/
│   ├── ui/                    ← Componentes reutilizáveis
│   │   ├── card.tsx
│   │   ├── alert.tsx
│   │   ├── button.tsx
│   │   └── skeleton.tsx
│   └── Sidebar.tsx            ← Com link para /analises
│
└── .env.local                 ← Add GEMINI_API_KEY aqui
```

## Status

| Item | Status | Detalhes |
|------|--------|----------|
| Integração Gemini | ✅ Pronto | Classe GoogleGenerativeAI configurada |
| APIs Backend | ✅ Pronto | 3 endpoints implementados |
| Frontend | ✅ Pronto | Página com 3 cards funcionais |
| Componentes UI | ✅ Pronto | Card, Alert, Button, Skeleton |
| Sidebar | ✅ Pronto | Link para /analises adicionado |
| Segurança | ✅ Pronto | Filtra por user_id, API key no servidor |
| **Gemini API Key** | ⏳ TODO | Preencher em .env.local |

---

**Tudo está pronto para funcionar quando você adicionar a chave do Gemini!** 🚀
