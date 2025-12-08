'use client';

import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { fetchTransactions, calculateMonthlyStats } from '@/lib/supabase-queries';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/format';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const txs = await fetchTransactions(user!.id);
      const monthStats = await calculateMonthlyStats(user!.id, month, year);

      setTransactions(txs);
      setStats(monthStats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600 dark:text-gray-400">Faça login para continuar</p>
      </div>
    );
  }

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const transacoesRecentes = transactions?.slice(0, 4) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  const defaultStats = {
    balance: 0,
    totalIncome: 0,
    totalExpense: 0
  };
  const displayStats = stats || defaultStats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 capitalize mt-2">
          {mesAtual}
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo Total */}
        <div className="col-span-1 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-white shadow-lg border border-gray-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Saldo Total</p>
              <p className="text-3xl font-bold mt-2">
                R$ {formatNumber(displayStats.balance)}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Entradas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Entradas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                R$ {formatNumber(displayStats.totalIncome)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Despesas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Despesas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                R$ {formatNumber(displayStats.totalExpense)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Transações Recentes
          </h2>
          <a href="/historico" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
            Ver todas
          </a>
        </div>
        
        <div className="space-y-3">
          {transacoesRecentes.length > 0 ? (
            transacoesRecentes.map((transacao) => (
              <div 
                key={transacao.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transacao.type === 'income'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {transacao.type === 'income' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transacao.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transacao.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transacao.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transacao.type === 'income' ? '+' : '-'} R$ {formatNumber(transacao.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(transacao.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Nenhuma transação registrada ainda
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
