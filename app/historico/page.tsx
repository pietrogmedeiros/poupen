'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
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

    return Object.values(categories);
  };

  const dadosLinha = processMonthlyData();
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

      {/* Gráfico de Linha com Área - Evolução */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 rounded-3xl p-8 shadow-xl border border-gray-700 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          Evolução de Entradas e Despesas
        </h2>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : dadosLinha.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dadosLinha} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
              <XAxis dataKey="mes" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '2px solid #4b5563',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  color: '#ffffff',
                  padding: '10px'
                }}
                cursor={{ stroke: '#9ca3af', strokeWidth: 2 }}
                formatter={(value: any) => `R$ ${formatNumber(parseFloat(value))}`}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="natural"
                dataKey="entradas" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
                name="Entradas"
                animationDuration={1000}
                connectNulls
              />
              <Line 
                type="natural"
                dataKey="despesas" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 5 }}
                activeDot={{ r: 7 }}
                name="Despesas"
                animationDuration={1000}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-400">
            Sem dados para exibir
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Despesas por Categoria */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 rounded-3xl p-8 shadow-xl border border-gray-700 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-red-400" />
            Despesas por Categoria
          </h2>
          {dadosPizza.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #4b5563',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    color: '#ffffff'
                  }}
                  formatter={(value) => `R$ ${formatNumber(parseFloat(value as any))}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400">
              Sem dados de despesas
            </div>
          )}
        </div>

        {/* Transações Recentes */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 rounded-3xl p-8 shadow-xl border border-gray-700 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-emerald-400" />
            Últimas Transações
          </h2>
          <div className="space-y-4">
            {transacoesRecentes.map((transacao: any) => (
              <div 
                key={transacao.id}
                className="flex items-center justify-between p-4 bg-gray-700/50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-300 border border-gray-600 dark:border-gray-700 hover:border-gray-500"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                    transacao.type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {transacao.type === 'income' ? '+' : '-'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {transacao.description}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-gray-600 dark:bg-gray-700 text-gray-200 dark:text-gray-300 px-3 py-1 rounded-full">
                        {transacao.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(transacao.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
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
