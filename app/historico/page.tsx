'use client';

import { useState, useEffect } from 'react';
import { 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { fetchTransactions } from '@/lib/supabase-queries';
import { useAuth } from '@/lib/auth-context';
import { formatNumber } from '@/lib/format';

export default function HistoricoPage() {
  const { user, loading: authLoading } = useAuth();
  const [periodo, setPeriodo] = useState('mes');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadTransactions();
    }
  }, [user, authLoading]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions(user!.id);
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Processar dados para gráficos
  const processMonthlyData = () => {
    const months: { [key: string]: any } = {};

    transactions.forEach((t: any) => {
      const date = new Date(t.date);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      if (!months[monthKey]) {
        months[monthKey] = { mes: monthKey, entradas: 0, despesas: 0 };
      }

      if (t.type === 'income') {
        months[monthKey].entradas += parseFloat(t.amount);
      } else {
        months[monthKey].despesas += parseFloat(t.amount);
      }
    });

    return Object.values(months).slice(-6).reverse();
  };

  const processCategoryData = () => {
    const categories: { [key: string]: any } = {};
    const colors = [
      '#3b82f6', // azul
      '#ef4444', // vermelho
      '#10b981', // verde
      '#f59e0b', // âmbar
      '#8b5cf6', // roxo
      '#ec4899', // rosa
      '#06b6d4', // ciano
      '#f97316', // laranja
      '#14b8a6', // teal
      '#6366f1', // indigo
    ];

    transactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        if (!categories[t.category]) {
          categories[t.category] = {
            name: t.category,
            value: 0,
            color: colors[Object.keys(categories).length % colors.length],
          };
        }
        categories[t.category].value += parseFloat(t.amount);
      });

    // Ordenar por valor decrescente
    return Object.values(categories).sort((a: any, b: any) => b.value - a.value);
  };

  const processRankingData = () => {
    const categories: { [key: string]: any } = {};
    const colors = [
      '#3b82f6', // azul
      '#ef4444', // vermelho
      '#10b981', // verde
      '#f59e0b', // âmbar
      '#8b5cf6', // roxo
      '#ec4899', // rosa
      '#06b6d4', // ciano
      '#f97316', // laranja
      '#14b8a6', // teal
      '#6366f1', // indigo
    ];

    transactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        if (!categories[t.category]) {
          categories[t.category] = {
            name: t.category,
            value: 0,
            color: colors[Object.keys(categories).length % colors.length],
          };
        }
        categories[t.category].value += parseFloat(t.amount);
      });

    // Ordenar por valor decrescente e adicionar ranking
    return Object.values(categories)
      .sort((a: any, b: any) => b.value - a.value)
      .map((cat: any, index: number) => ({
        ...cat,
        rank: index + 1,
        displayName: `${index + 1}º. ${cat.name}`
      }));
  };

  const dadosLinha = processMonthlyData();
  const dadosRanking = processRankingData();
  const dadosPizza = processCategoryData();
  const transacoesRecentes = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Histórico
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Análise detalhada das suas finanças
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setPeriodo('mes')}
            className={`px-6 py-2 rounded-lg transition-all duration-300 font-semibold text-sm ${
              periodo === 'mes'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-gray-700 dark:bg-gray-700 text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-600'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setPeriodo('ano')}
            className={`px-6 py-2 rounded-lg transition-all duration-300 font-semibold text-sm ${
              periodo === 'ano'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-gray-700 dark:bg-gray-700 text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-600'
            }`}
          >
            Ano
          </button>
        </div>
      </div>

      {/* Gráfico de Area - Ranking de Maiores Gastos */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 rounded-3xl p-8 shadow-2xl border border-gray-700 dark:border-gray-700 backdrop-blur-sm mb-12">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          Ranking de Maiores Gastos
        </h2>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : dadosRanking.length > 0 ? (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={dadosRanking}
              layout="vertical"
              margin={{ top: 10, right: 80, left: 60, bottom: 10 }}
            >
              <defs>
                <linearGradient id="barGradient1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={1}/>
                </linearGradient>
                <filter id="barGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="#374151" opacity={0.15} vertical={true} />
              <XAxis 
                type="number" 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                dataKey="displayName" 
                type="category" 
                stroke="#9ca3af" 
                style={{ fontSize: '13px', fontWeight: '500' }} 
                width={50}
                tick={{ fill: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '2px solid #4b5563',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  color: '#ffffff',
                  padding: '12px 16px',
                  backdropFilter: 'blur(10px)'
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.15)' }}
                formatter={(value) => `R$ ${formatNumber(parseFloat(value as any))}`}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="value"
                fill="url(#barGradient1)"
                radius={[0, 16, 16, 0]}
                animationDuration={1400}
                filter="url(#barGlow)"
                isAnimationActive={true}
                barSize={36}
                label={{
                  position: 'right',
                  fill: '#e5e7eb',
                  fontSize: 12,
                  formatter: (value: any) => `R$ ${formatNumber(value as number)}`
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-400">
            Sem dados para exibir
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Ranking de Maiores Gastos - Despesas por Categoria */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 rounded-3xl p-8 shadow-2xl border border-gray-700 dark:border-gray-700 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-red-400" />
            Despesas por Categoria
          </h2>
          {dadosPizza.length > 0 ? (
            <ResponsiveContainer width="100%" height={450}>
              <BarChart
                data={dadosPizza}
                layout="vertical"
                margin={{ top: 10, right: 80, left: 60, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={1}/>
                  </linearGradient>
                  <filter id="barGlow2">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#374151" opacity={0.15} vertical={true} />
                <XAxis 
                  type="number" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '13px', fontWeight: '500' }} 
                  width={50}
                  tick={{ fill: '#e5e7eb' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '2px solid #4b5563',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    color: '#ffffff',
                    padding: '12px 16px',
                    backdropFilter: 'blur(10px)'
                  }}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.15)' }}
                  formatter={(value) => `R$ ${formatNumber(parseFloat(value as any))}`}
                />
                <Bar
                  dataKey="value"
                  fill="url(#barGradient2)"
                  radius={[0, 16, 16, 0]}
                  animationDuration={1400}
                  filter="url(#barGlow2)"
                  isAnimationActive={true}
                  barSize={36}
                  label={{
                    position: 'right',
                    fill: '#e5e7eb',
                    fontSize: 12,
                    formatter: (value: any) => `R$ ${formatNumber(value as number)}`
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400">
              Sem dados de despesas
            </div>
          )}
        </div>

        {/* Transações Recentes */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 rounded-3xl p-8 shadow-2xl border border-gray-700 dark:border-gray-700 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-emerald-400" />
            Últimas Transações
          </h2>
          <div className="space-y-4">
            {transacoesRecentes.map((transacao: any) => (
              <div 
                key={transacao.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-700/40 to-gray-700/20 dark:from-gray-800/40 dark:to-gray-800/20 rounded-xl hover:from-gray-700/60 hover:to-gray-700/40 dark:hover:from-gray-800/60 dark:hover:to-gray-800/40 transition-all duration-300 border border-gray-600 dark:border-gray-700 hover:border-gray-500 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    transacao.type === 'income'
                      ? 'bg-emerald-500/30 text-emerald-300 hover:bg-emerald-500/50'
                      : 'bg-red-500/30 text-red-300 hover:bg-red-500/50'
                  }`}>
                    {transacao.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {transacao.description}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-gradient-to-r from-gray-600/50 to-gray-700/50 text-gray-200 dark:text-gray-300 px-3 py-1 rounded-full border border-gray-600/30">
                        {transacao.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(transacao.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg transition-all duration-300 ${
                    transacao.type === 'income'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}>
                    {transacao.type === 'income' ? '+' : '-'} R$ {formatNumber(parseFloat(transacao.amount))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
