'use client';

import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { fetchTransactions, calculateMonthlyStats } from '@/lib/supabase-queries';
import { useAuth } from '@/lib/auth-context';
import { useValueVisibility } from '@/lib/ValueVisibilityContext';
import { MaskedValue } from '@/components/MaskedValue';
import { ValueVisibilityToggle } from '@/components/ValueVisibilityToggle';
import { StatCard } from '@/components/StatCard';
import { TransactionItem } from '@/components/TransactionItem';
import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/format';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { isValuesVisible } = useValueVisibility();
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
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-[var(--text-secondary)]">Faça login para continuar</p>
      </div>
    );
  }

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const transacoesRecentes = transactions?.slice(0, 5) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" />
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
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] capitalize mt-1 text-sm md:text-base">
            {mesAtual}
          </p>
        </div>
        <ValueVisibilityToggle />
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo Total */}
        <StatCard
          title="Saldo Total"
          value={
            <MaskedValue 
              value={`R$ ${formatNumber(displayStats.balance)}`}
              isVisible={isValuesVisible}
              onToggle={() => {}}
            />
          }
          icon={<DollarSign className="w-5 h-5" />}
          subtitle="Patrimônio total"
          variant="primary"
        />

        {/* Total Entradas */}
        <StatCard
          title="Entradas"
          value={
            <MaskedValue 
              value={`R$ ${formatNumber(displayStats.totalIncome)}`}
              isVisible={isValuesVisible}
              onToggle={() => {}}
            />
          }
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Receitas deste mês"
          variant="success"
        />

        {/* Total Despesas */}
        <StatCard
          title="Despesas"
          value={
            <MaskedValue 
              value={`R$ ${formatNumber(displayStats.totalExpense)}`}
              isVisible={isValuesVisible}
              onToggle={() => {}}
            />
          }
          icon={<TrendingDown className="w-5 h-5" />}
          subtitle="Gastos deste mês"
          variant="error"
        />
      </div>

      {/* Transações Recentes */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-secondary)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Transações Recentes
          </h2>
          <a href="/historico" className="text-xs md:text-sm font-medium text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] transition-colors">
            Ver todas →
          </a>
        </div>
        
        <div>
          {transacoesRecentes.length > 0 ? (
            transacoesRecentes.map((transacao) => (
              <TransactionItem
                key={transacao.id}
                title={transacao.description}
                category={transacao.category}
                amount={transacao.amount}
                date={transacao.date}
                type={transacao.type}
                icon={
                  transacao.type === 'income' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )
                }
              />
            ))
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-[var(--text-secondary)] text-sm">
                Nenhuma transação registrada ainda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
