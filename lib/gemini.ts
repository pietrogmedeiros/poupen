import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEnv } from "./env";

// Lazy initialization - só carrega quando necessário
let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI) {
    const { geminiKey } = getEnv();
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    genAI = new GoogleGenerativeAI(geminiKey);
  }
  return genAI;
}

export function getGeminiModel() {
  return getGenAI().getGenerativeModel({
    model: "gemini-1.5-flash",
  });
}

// Exportar como função que retorna o modelo
export const geminiModel = {
  generateContent: async (prompt: string) => {
    return getGeminiModel().generateContent(prompt);
  }
};

export interface SpendingForecast {
  monthlyAverage: number;
  nextMonthPrediction: number;
  confidence: "high" | "medium" | "low";
  insights: string[];
  categories: {
    name: string;
    avgSpend: number;
    predictedSpend: number;
    trend: "increasing" | "decreasing" | "stable";
  }[];
}

export interface FinancialInsights {
  summary: string;
  recommendations: string[];
  alerts: string[];
  savingsOpportunities: string[];
}

export interface TransactionAnalysis {
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  topExpenses: {
    description: string;
    amount: number;
    date: string;
  }[];
  insights: string;
}

export async function forecastNextMonthSpending(
  transactions: Array<{
    amount: number;
    category: string;
    date: string;
    type: "expense" | "income";
  }>,
  userId: string
): Promise<SpendingForecast> {
  const expenses = transactions.filter((t) => t.type === "expense");

  if (expenses.length === 0) {
    return {
      monthlyAverage: 0,
      nextMonthPrediction: 0,
      confidence: "low",
      insights: ["Não há gastos registrados para análise"],
      categories: [],
    };
  }

  const categoryTotals: Record<string, number[]> = {};
  expenses.forEach((t) => {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = [];
    }
    categoryTotals[t.category].push(t.amount);
  });

  const prompt = `
Analise os dados de despesas e forneça uma previsão inteligente.

GASTOS POR CATEGORIA (últimos 3-6 meses):
${Object.entries(categoryTotals)
  .map(
    ([category, amounts]) => `
${category}: ${amounts.map((a) => `R$ ${a.toFixed(2)}`).join(", ")}
Total: R$ ${amounts.reduce((a, b) => a + b, 0).toFixed(2)}
Média: R$ ${(amounts.reduce((a, b) => a + b, 0) / amounts.length).toFixed(2)}
`
  )
  .join("\n")}

TOTAL GASTO: R$ ${expenses.reduce((a, b) => a + b.amount, 0).toFixed(2)}
NÚMERO DE TRANSAÇÕES: ${expenses.length}

Baseado nesse histórico, fornça a resposta em JSON com a seguinte estrutura:
{
  "monthlyAverage": número (média mensal de gastos),
  "nextMonthPrediction": número (previsão para o próximo mês),
  "confidence": "high" | "medium" | "low" (confiança da previsão),
  "insights": ["insight1", "insight2", ...] (3-4 insights sobre os gastos),
  "categories": [
    {
      "name": "nome da categoria",
      "avgSpend": número (média de gastos nessa categoria),
      "predictedSpend": número (previsão para próximo mês),
      "trend": "increasing" | "decreasing" | "stable"
    }
  ]
}

Retorne APENAS o JSON, sem explicações adicionais.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0];

    if (!responseText || typeof responseText.text !== "string") {
      throw new Error("Invalid response from Gemini");
    }

    // Extract JSON from response
    const jsonMatch = responseText.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const forecast = JSON.parse(jsonMatch[0]) as SpendingForecast;
    return forecast;
  } catch (error) {
    console.error("Error forecasting spending:", error);
    // Return fallback with simple calculation
    const avg =
      expenses.reduce((a, b) => a + b.amount, 0) / expenses.length;
    return {
      monthlyAverage: avg * 20, // Simple estimate
      nextMonthPrediction: avg * 20,
      confidence: "low",
      insights: [
        "Erro ao processar previsão com IA. Usando cálculo simples.",
      ],
      categories: [],
    };
  }
}

export async function getFinancialInsights(
  transactions: Array<{
    amount: number;
    category: string;
    date: string;
    type: "expense" | "income";
    description: string;
  }>,
  userId: string
): Promise<FinancialInsights> {
  const expenses = transactions.filter((t) => t.type === "expense");
  const income = transactions.filter((t) => t.type === "income");

  const totalIncome = income.reduce((a, b) => a + b.amount, 0);
  const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  const prompt = `
Analise a situação financeira do usuário e forneça recomendações personalizadas.

RESUMO FINANCEIRO:
- Total de Renda: R$ ${totalIncome.toFixed(2)}
- Total de Despesas: R$ ${totalExpense.toFixed(2)}
- Saldo: R$ ${balance.toFixed(2)}
- Número de Transações: ${transactions.length}

DESPESAS POR CATEGORIA:
${
  expenses.length > 0
    ? (() => {
        const cats: Record<string, number> = {};
        expenses.forEach((t) => {
          cats[t.category] = (cats[t.category] || 0) + t.amount;
        });
        return Object.entries(cats)
          .map(([cat, total]) => `${cat}: R$ ${total.toFixed(2)}`)
          .join("\n");
      })()
    : "Sem despesas registradas"
}

Forneça a resposta em JSON com a seguinte estrutura:
{
  "summary": "resumo executivo da situação financeira (2-3 frases)",
  "recommendations": ["recomendação1", "recomendação2", "recomendação3"],
  "alerts": ["alerta1", "alerta2"] (alertas críticos, deixar [] se nenhum),
  "savingsOpportunities": ["oportunidade1", "oportunidade2"] (onde economizar)
}

Retorne APENAS o JSON, sem explicações adicionais.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0];

    if (!responseText || typeof responseText.text !== "string") {
      throw new Error("Invalid response from Gemini");
    }

    const jsonMatch = responseText.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    return JSON.parse(jsonMatch[0]) as FinancialInsights;
  } catch (error) {
    console.error("Error getting financial insights:", error);
    return {
      summary: "Análise não disponível no momento.",
      recommendations: [],
      alerts: [],
      savingsOpportunities: [],
    };
  }
}

export async function analyzeTransactions(
  transactions: Array<{
    amount: number;
    category: string;
    date: string;
    description: string;
  }>
): Promise<TransactionAnalysis> {
  if (transactions.length === 0) {
    return {
      categoryBreakdown: [],
      topExpenses: [],
      insights: "Sem transações para analisar.",
    };
  }

  const total = transactions.reduce((a, b) => a + b.amount, 0);
  const categoryMap: Record<string, number> = {};
  const topTransactions = [...transactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  transactions.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const prompt = `
Analise essas transações de despesas e forneça um resumo executivo.

CATEGORIAS PRINCIPAIS:
${categoryBreakdown.map((c) => `${c.category}: ${c.percentage.toFixed(1)}% (R$ ${c.amount.toFixed(2)})`).join("\n")}

TOP 5 GASTOS:
${topTransactions.map((t, i) => `${i + 1}. ${t.description}: R$ ${t.amount.toFixed(2)}`).join("\n")}

GASTO TOTAL: R$ ${total.toFixed(2)}

Forneça um insight breve (2-3 frases) sobre os padrões de gastos. Responda APENAS com o texto do insight, sem formatação adicional.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const insights =
      result.response.candidates?.[0]?.content?.parts?.[0];

    if (!insights || typeof insights.text !== "string") {
      throw new Error("Invalid response");
    }

    return {
      categoryBreakdown,
      topExpenses: topTransactions.map((t) => ({
        description: t.description,
        amount: t.amount,
        date: t.date,
      })),
      insights: insights.text,
    };
  } catch (error) {
    console.error("Error analyzing transactions:", error);
    return {
      categoryBreakdown,
      topExpenses: topTransactions.map((t) => ({
        description: t.description,
        amount: t.amount,
        date: t.date,
      })),
      insights: "Análise não disponível no momento.",
    };
  }
}
