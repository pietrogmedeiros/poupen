'use client';

import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { fetchTransactions, calculateMonthlyStats } from '@/lib/supabase-queries';
import { useAuth } from '@/lib/auth-context';
import { useValueVisibility } from '@/lib/ValueVisibilityContext';
import { MaskedValue } from '@/components/MaskedValue';
import { ValueVisibilityToggle } from '@/components/ValueVisibilityToggle';
import { gradients } from '@/lib/colorMap';
import { useEffect, useState, useCallback } from 'react';
import { formatNumber } from '@/lib/format';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { isValuesVisible } = useValueVisibility();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showIncome, setShowIncome] = useState(true);
  const [showExpense, setShowExpense] = useState(true);

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
      <div className="animate-fadeInUp flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 
            className="text-5xl font-bold text-transparent bg-clip-text"
            style={{ backgroundImage: gradients.slate }}
          >
            Dashboard
          </h1>
          <p className="text-slate-400 capitalize mt-2 text-lg">
            {mesAtual}
          </p>
        </div>
        <ValueVisibilityToggle />
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp">
        {/* Saldo Total */}
        <div className="col-span-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-2xl border border-blue-500/30 backdrop-blur-xl hover:shadow-3xl transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-blue-100 text-sm font-medium tracking-wide">Saldo Total</p>
              <div className="mt-3">
                <MaskedValue 
                  value={`R$ ${formatNumber(displayStats.balance)}`}
                  isVisible={isValuesVisible}
                  onToggle={() => setShowBalance(!showBalance)}
                  className="text-5xl font-bold group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <DollarSign className="w-7 h-7 text-blue-100" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-400/20">
            <p className="text-blue-100 text-xs">Patrimônio total</p>
          </div>
        </div>

        {/* Total Entradas */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-2xl p-8 border border-emerald-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 group backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-emerald-300 text-sm font-medium tracking-wide">Entradas</p>
              <div className="mt-3">
                <MaskedValue 
                  value={`R$ ${formatNumber(displayStats.totalIncome)}`}
                  isVisible={isValuesVisible}
                  onToggle={() => setShowIncome(!showIncome)}
                  className="text-4xl font-bold text-emerald-400 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="w-14 h-14 bg-emerald-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-500/20">
            <p className="text-emerald-300 text-xs">Receitas deste mês</p>
          </div>
        </div>

        {/* Total Despesas */}
        <div className="bg-gradient-to-br from-red-500/10 to-orange-600/10 rounded-2xl p-8 border border-red-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 group backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-red-300 text-sm font-medium tracking-wide">Despesas</p>
              <div className="mt-3">
                <MaskedValue 
                  value={`R$ ${formatNumber(displayStats.totalExpense)}`}
                  isVisible={isValuesVisible}
                  onToggle={() => setShowExpense(!showExpense)}
                  className="text-4xl font-bold text-red-400 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="w-14 h-14 bg-red-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
              <TrendingDown className="w-7 h-7 text-red-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-red-500/20">
            <p className="text-red-300 text-xs">Gastos deste mês</p>
          </div>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/30 shadow-2xl animate-fadeInUp hover:border-slate-700/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            Transações Recentes
          </h2>
          <a href="/historico" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors text-sm bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500/20">
            Ver todas →
          </a>
        </div>
        
        <div className="space-y-3">
          {transacoesRecentes.length > 0 ? (
            transacoesRecentes.map((transacao) => (
              <div 
                key={transacao.id}
                className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/60 transition-all duration-200 border border-slate-700/30 hover:border-slate-700/60 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    transacao.type === 'income'
                      ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30'
                      : 'bg-red-500/20 group-hover:bg-red-500/30'
                  }`}>
                    {transacao.type === 'income' ? (
                      <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-indigo-100 transition-colors">
                      {transacao.description}
                    </p>
                    <p className="text-sm text-slate-400">
                      {transacao.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-lg ${
                    transacao.type === 'income'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}>
                    <MaskedValue 
                      value={`${transacao.type === 'income' ? '+' : '-'} R$ ${formatNumber(transacao.amount)}`}
                      isVisible={isValuesVisible}
                      onToggle={() => {}}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(transacao.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                Nenhuma transação registrada ainda
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Comece a adicionar transações para ver o resumo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
