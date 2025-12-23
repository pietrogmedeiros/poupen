'use client';

import React from 'react';

interface TransactionItemProps {
  title: string;
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  icon?: React.ReactNode;
}

export function TransactionItem({
  title,
  category,
  amount,
  date,
  type,
  icon,
}: TransactionItemProps) {
  const isExpense = type === 'expense';
  const amountColor = isExpense ? 'text-[var(--status-error)]' : 'text-[var(--status-success)]';
  const amountSign = isExpense ? '-' : '+';
  const bgColor = isExpense 
    ? 'bg-[var(--status-error)]/10' 
    : 'bg-[var(--status-success)]/10';

  return (
    <div className="flex items-center justify-between p-3 md:p-4 border-b border-[var(--border-primary)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <div className={`${bgColor} rounded-lg p-2.5 flex-shrink-0`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {title}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {category}
          </p>
        </div>
      </div>
      
      <div className="text-right flex-shrink-0 ml-2">
        <p className={`text-sm font-semibold ${amountColor}`}>
          {amountSign} R$ {Math.abs(amount).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">
          {new Date(date).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}
