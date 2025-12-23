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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
          Análise Inteligente
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm md:text-base">
          Previsões com IA para melhorar sua saúde financeira
        </p>
      </div>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Spending Forecast */}
        <Card className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-[var(--accent-primary)]" />
              <CardTitle className="text-[var(--text-primary)]">Previsão de Gastos - Próximo Mês</CardTitle>
            </div>
            <CardDescription className="text-[var(--text-secondary)]">
              Estimativa inteligente baseada em seu histórico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {forecastLoading ? (
              <Skeleton className="h-20 bg-[var(--bg-hover)]" />
            ) : forecast ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[var(--bg-hover)] p-4 rounded-lg border border-[var(--border-primary)]">
                    <p className="text-sm text-[var(--text-secondary)]">Média Mensal</p>
                    <p className="text-3xl font-bold text-[var(--accent-primary)]">
                      R$ {forecast.monthlyAverage.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-[var(--bg-hover)] p-4 rounded-lg border border-[var(--border-primary)]">
                    <p className="text-sm text-[var(--text-secondary)]">Previsão Próx. Mês</p>
                    <p className="text-3xl font-bold text-[var(--accent-primary)]">
                      R$ {forecast.nextMonthPrediction.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-[var(--bg-hover)] p-4 rounded-lg border border-[var(--border-primary)]">
                    <p className="text-sm text-[var(--text-secondary)]">Confiança</p>
                    <p
                      className={`text-3xl font-bold ${
                        forecast.confidence === "high"
                          ? "text-[var(--status-success)]"
                          : forecast.confidence === "medium"
                            ? "text-[var(--status-warning)]"
                            : "text-[var(--status-error)]"
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
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      Por Categoria
                    </h3>
                    <div className="space-y-2">
                      {forecast.categories.map((cat) => (
                        <div
                          key={cat.name}
                          className="flex items-center justify-between p-3 bg-[var(--bg-hover)] rounded border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition"
                        >
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">
                              {cat.name}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">
                              Média: R$ {cat.avgSpend.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[var(--text-primary)]">
                              R$ {cat.predictedSpend.toFixed(2)}
                            </p>
                            <span
                              className={`text-xs font-medium ${
                                cat.trend === "increasing"
                                  ? "text-[var(--status-error)]"
                                  : cat.trend === "decreasing"
                                    ? "text-[var(--status-success)]"
                                    : "text-[var(--text-secondary)]"
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
                    <h3 className="font-semibold text-[var(--text-primary)]">Insights</h3>
                    <ul className="space-y-1">
                      {forecast.insights.map((insight, i) => (
                        <li
                          key={i}
                          className="text-sm text-[var(--text-primary)] flex gap-2"
                        >
                          <span className="text-[var(--accent-primary)]">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[var(--text-secondary)]">Sem dados para análise</p>
            )}
          </CardContent>
        </Card>

        {/* Financial Insights */}
        <Card className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="text-[var(--accent-primary)]" />
              <CardTitle className="text-[var(--text-primary)]">Recomendações Financeiras</CardTitle>
            </div>
            <CardDescription className="text-[var(--text-secondary)]">Dicas personalizadas para melhorar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insightsLoading ? (
              <Skeleton className="h-40 bg-[var(--bg-hover)]" />
            ) : insights ? (
              <>
                {insights.summary && (
                  <div className="p-4 bg-[var(--bg-hover)] rounded-lg border border-[var(--border-primary)]">
                    <p className="text-[var(--text-primary)]">{insights.summary}</p>
                  </div>
                )}

                {insights.alerts && insights.alerts.length > 0 && (
                  <Alert className="border border-[var(--status-error)] bg-[var(--status-error)]/10">
                    <AlertCircle className="h-4 w-4 text-[var(--status-error)]" />
                    <AlertTitle className="text-[var(--status-error)]">Alertas</AlertTitle>
                    <AlertDescription className="text-[var(--text-primary)]">
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
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      Recomendações
                    </h3>
                    <ul className="space-y-2">
                      {insights.recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className="p-3 bg-[var(--bg-hover)] rounded border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition"
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
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        Oportunidades de Economia
                      </h3>
                      <ul className="space-y-2">
                        {insights.savingsOpportunities.map((opp, i) => (
                          <li
                            key={i}
                            className="p-3 bg-[var(--bg-hover)] rounded border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition"
                          >
                            💰 {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            ) : (
              <p className="text-[var(--text-secondary)]">Sem insights disponíveis</p>
            )}
          </CardContent>
        </Card>

        {/* Transaction Analysis */}
        <Card className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="text-[var(--accent-primary)]" />
                <CardTitle className="text-[var(--text-primary)]">Análise de Transações</CardTitle>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={analysisLoading}
                className="bg-[var(--accent-primary)] hover:opacity-90 text-white"
              >
                {analysisLoading ? "Analisando..." : "Analisar"}
              </Button>
            </div>
            <CardDescription className="text-[var(--text-secondary)]">Breakdown de gastos por categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis ? (
              <>
                {analysis.insights && (
                  <div className="p-4 bg-[var(--bg-hover)] rounded-lg border border-[var(--border-primary)]">
                    <p className="text-[var(--text-primary)]">{analysis.insights}</p>
                  </div>
                )}

                {analysis.categoryBreakdown &&
                  analysis.categoryBreakdown.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        Categorias
                      </h3>
                      <div className="space-y-2">
                        {analysis.categoryBreakdown.map((cat) => (
                          <div
                            key={cat.category}
                            className="space-y-1"
                          >
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-[var(--text-primary)]">
                                {cat.category}
                              </span>
                              <span className="text-[var(--text-secondary)]">
                                {cat.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-[var(--bg-hover)] rounded-full h-2">
                              <div
                                className="bg-[var(--accent-primary)] h-2 rounded-full"
                                style={{ width: `${cat.percentage}%` }}
                              />
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">
                              R$ {cat.amount.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {analysis.topExpenses && analysis.topExpenses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      Maiores Gastos
                    </h3>
                    <div className="space-y-2">
                      {analysis.topExpenses.map((expense, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 bg-[var(--bg-hover)] rounded border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition"
                        >
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">
                              {expense.description}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {new Date(expense.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <p className="font-semibold text-[var(--text-primary)]">
                            R$ {expense.amount.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[var(--text-secondary)]">
                Clique em "Analisar" para ver o breakdown de transações
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
