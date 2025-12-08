"use client";

import {
  useSpendingForecast,
  useFinancialInsights,
  useTransactionAnalysis,
} from "@/lib/hooks/useAI";
import {
  Skeleton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "@/components/ui";
import { TrendingUp, AlertCircle, Lightbulb, PieChart } from "lucide-react";

export default function AnalyticsPage() {
  const { forecast, loading: forecastLoading } = useSpendingForecast();
  const { insights, loading: insightsLoading } = useFinancialInsights();
  const { analysis, loading: analysisLoading, analyze } =
    useTransactionAnalysis();

  const handleAnalyze = () => {
    analyze();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6 ml-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            Análise Inteligente
          </h1>
          <p className="text-gray-400">
            Previsões com IA para melhorar sua saúde financeira
          </p>
        </div>

        {/* Spending Forecast */}
        <Card className="border-blue-900/50 bg-gradient-to-br from-gray-800 to-gray-850 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-blue-400" />
              <CardTitle className="text-white">Previsão de Gastos - Próximo Mês</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Estimativa inteligente baseada em seu histórico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {forecastLoading ? (
              <Skeleton className="h-20 bg-gray-700" />
            ) : forecast ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-900/30 backdrop-blur">
                    <p className="text-sm text-gray-400">Média Mensal</p>
                    <p className="text-3xl font-bold text-blue-400">
                      R$ {forecast.monthlyAverage.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-900/30 backdrop-blur">
                    <p className="text-sm text-gray-400">Previsão Próx. Mês</p>
                    <p className="text-3xl font-bold text-blue-400">
                      R$ {forecast.nextMonthPrediction.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-900/30 backdrop-blur">
                    <p className="text-sm text-gray-400">Confiança</p>
                    <p
                      className={`text-3xl font-bold ${
                        forecast.confidence === "high"
                          ? "text-green-400"
                          : forecast.confidence === "medium"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {forecast.confidence === "high"
                        ? "Alta"
                        : forecast.confidence === "medium"
                          ? "Média"
                          : "Baixa"}
                    </p>
                  </div>
                </div>

                {/* Category Breakdown */}
                {forecast.categories.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white">
                      Por Categoria
                    </h3>
                    <div className="space-y-2">
                      {forecast.categories.map((cat) => (
                        <div
                          key={cat.name}
                          className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-700/50 hover:border-blue-900/50 transition"
                        >
                          <div>
                            <p className="font-medium text-white">
                              {cat.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              Média: R$ {cat.avgSpend.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">
                              R$ {cat.predictedSpend.toFixed(2)}
                            </p>
                            <span
                              className={`text-xs font-medium ${
                                cat.trend === "increasing"
                                  ? "text-red-400"
                                  : cat.trend === "decreasing"
                                    ? "text-green-400"
                                    : "text-gray-400"
                              }`}
                            >
                              {cat.trend === "increasing"
                                ? "↑ Crescente"
                                : cat.trend === "decreasing"
                                  ? "↓ Decrescente"
                                  : "→ Estável"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {forecast.insights.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">Insights</h3>
                    <ul className="space-y-1">
                      {forecast.insights.map((insight, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-300 flex gap-2"
                        >
                          <span className="text-blue-400">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400">Sem dados para análise</p>
            )}
          </CardContent>
        </Card>

        {/* Financial Insights */}
        <Card className="border-green-900/50 bg-gradient-to-br from-gray-800 to-gray-850 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="text-green-400" />
              <CardTitle className="text-white">Recomendações Financeiras</CardTitle>
            </div>
            <CardDescription className="text-gray-400">Dicas personalizadas para melhorar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insightsLoading ? (
              <Skeleton className="h-40 bg-gray-700" />
            ) : insights ? (
              <>
                {insights.summary && (
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-green-900/30 backdrop-blur">
                    <p className="text-gray-200">{insights.summary}</p>
                  </div>
                )}

                {insights.alerts && insights.alerts.length > 0 && (
                  <Alert className="border-red-900/50 bg-red-950/30 backdrop-blur">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertTitle className="text-red-300">Alertas</AlertTitle>
                    <AlertDescription className="text-red-200">
                      <ul className="list-disc pl-5 space-y-1">
                        {insights.alerts.map((alert, i) => (
                          <li key={i}>{alert}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {insights.recommendations && insights.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">
                      Recomendações
                    </h3>
                    <ul className="space-y-2">
                      {insights.recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className="p-3 bg-gray-900/50 rounded border border-green-900/30 text-gray-200 hover:border-green-900/50 transition"
                        >
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.savingsOpportunities &&
                  insights.savingsOpportunities.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white">
                        Oportunidades de Economia
                      </h3>
                      <ul className="space-y-2">
                        {insights.savingsOpportunities.map((opp, i) => (
                          <li
                            key={i}
                            className="p-3 bg-gray-900/50 rounded border border-green-900/30 text-gray-200 hover:border-green-900/50 transition"
                          >
                            💰 {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            ) : (
              <p className="text-gray-400">Sem insights disponíveis</p>
            )}
          </CardContent>
        </Card>

        {/* Transaction Analysis */}
        <Card className="border-purple-900/50 bg-gradient-to-br from-gray-800 to-gray-850 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="text-purple-400" />
                <CardTitle className="text-white">Análise de Transações</CardTitle>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={analysisLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {analysisLoading ? "Analisando..." : "Analisar"}
              </Button>
            </div>
            <CardDescription className="text-gray-400">Breakdown de gastos por categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis ? (
              <>
                {analysis.insights && (
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-900/30 backdrop-blur">
                    <p className="text-gray-200">{analysis.insights}</p>
                  </div>
                )}

                {analysis.categoryBreakdown &&
                  analysis.categoryBreakdown.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-white">
                        Categorias
                      </h3>
                      <div className="space-y-2">
                        {analysis.categoryBreakdown.map((cat) => (
                          <div
                            key={cat.category}
                            className="space-y-1"
                          >
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-white">
                                {cat.category}
                              </span>
                              <span className="text-gray-400">
                                {cat.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full"
                                style={{ width: `${cat.percentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              R$ {cat.amount.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {analysis.topExpenses && analysis.topExpenses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white">
                      Maiores Gastos
                    </h3>
                    <div className="space-y-2">
                      {analysis.topExpenses.map((expense, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 bg-gray-900/50 rounded border border-gray-700/50 hover:border-purple-900/50 transition"
                        >
                          <div>
                            <p className="font-medium text-white">
                              {expense.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(expense.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <p className="font-semibold text-white">
                            R$ {expense.amount.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400">
                Clique em "Analisar" para ver o breakdown de transações
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
