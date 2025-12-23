const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkData() {
  console.log('\n=== ANÁLISE DE DADOS ===\n');

  try {
    // Contar usuários
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, is_active', { count: 'exact' });

    console.log(`📊 Total de usuários: ${users?.length || 0}`);
    if (users) {
      users.forEach((u) => {
        console.log(`   - ${u.name} (${u.email}) - Ativo: ${u.is_active}`);
      });
    }

    // Contar transações por usuário
    console.log('\n💰 Transações por usuário:');
    if (users) {
      for (const user of users) {
        const { data: txs } = await supabase
          .from('transactions')
          .select('id, type, amount, date', { count: 'exact' })
          .eq('user_id', user.id)
          .is('deleted_at', null);

        if (txs && txs.length > 0) {
          let entradas = 0;
          let despesas = 0;
          txs.forEach((tx) => {
            if (tx.type === 'income') entradas += parseFloat(tx.amount);
            if (tx.type === 'expense') despesas += parseFloat(tx.amount);
          });
          
          const taxa = entradas > 0 ? ((entradas - despesas) / entradas) * 100 : 0;
          console.log(`   ${user.name}: ${txs.length} transações | Entradas: R$ ${entradas.toFixed(2)} | Despesas: R$ ${despesas.toFixed(2)} | Taxa: ${taxa.toFixed(2)}%`);
        } else {
          console.log(`   ${user.name}: SEM TRANSAÇÕES`);
        }
      }
    }

    // Contar rankings
    const { data: rankings } = await supabase
      .from('rankings')
      .select('*', { count: 'exact' });

    console.log(`\n🏆 Rankings cadastrados: ${rankings?.length || 0}`);
    if (rankings && rankings.length > 0) {
      rankings.forEach((r) => {
        console.log(`   - Posição ${r.posicao}: Taxa ${r.economia_taxa}% | Mês ${r.month}`);
      });
    } else {
      console.log('   Nenhum ranking ainda. Execute POST /api/ranking/calculate para gerar.');
    }

    console.log('\n');
  } catch (err) {
    console.error('Erro:', err);
  }
  
  process.exit(0);
}

checkData();
