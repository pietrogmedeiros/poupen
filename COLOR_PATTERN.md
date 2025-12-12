# 🎨 Padrão de Cores - Menu Lateral & Títulos

## Padrão Implementado

Cada página agora tem um **padrão visual consistente** onde:
- ✅ **Ícone do menu lateral** muda de cor quando selecionado
- ✅ **Título da página** usa o mesmo gradiente de cor do ícone
- ✅ **Mascaramento de valores** sincronizado em toda a página

---

## Mapa de Cores por Página

### 📊 Dashboard
```
Ícone do Menu:  🔵 from-blue-600 to-cyan-600
Título:         🔵 "Dashboard" com gradiente blue → cyan
Transações:     🔵 Valores mascaráveis
Botão Toggle:   👁️ "Mostrar/Ocultar" (sincroniza todas as páginas)
```

**Resultado Visual:**
```
┌─────────────────────────────────┐
│ 🔵 Dashboard                    │
│ ════════════════════════════════│
│ ●●●●●●●●●●  👁️ (Oculto)       │
│ Saldo Total: Patrimônio total   │
└─────────────────────────────────┘
```

---

### 💚 Entradas
```
Ícone do Menu:  🟢 from-green-500 to-emerald-600
Título:         🟢 "Entradas" com gradiente green → emerald
Valores:        🟢 Entradas em verde (+R$ XXX)
Mascaramento:   ✅ Sincronizado com Dashboard
```

**Resultado Visual:**
```
┌─────────────────────────────────┐
│ 🟢 Entradas                     │
│ ════════════════════════════════│
│ Seja AP                         │
│ Freelance                       │
│ ●●●●●●●●●●●  👁️               │
└─────────────────────────────────┘
```

---

### 🔴 Despesas
```
Ícone do Menu:  🔴 from-red-500 to-orange-600
Título:         🔴 "Despesas" com gradiente red → orange
Valores:        🔴 Despesas em vermelho (-R$ XXX)
Mascaramento:   ✅ Sincronizado com Dashboard
```

**Resultado Visual:**
```
┌─────────────────────────────────┐
│ 🔴 Despesas                     │
│ ════════════════════════════════│
│ Gastos extras - Mecânico        │
│ Carro                           │
│ ●●●●●●●●●●●  👁️               │
└─────────────────────────────────┘
```

---

### 🟡 Recorridos
```
Ícone do Menu:  🟡 from-yellow-500 to-amber-600
Título:         🟡 "Recorridos" com gradiente yellow → amber
Valores:        🟡 Transações recorrentes mascaráveis
Mascaramento:   ✅ Sincronizado com Dashboard
```

**Resultado Visual:**
```
┌─────────────────────────────────┐
│ 🟡 Recorridos                   │
│ ════════════════════════════════│
│ Salário                         │
│ ●●●●●●●●●●●  👁️               │
│ Próx: 31/12/2025                │
└─────────────────────────────────┘
```

---

### 📈 Histórico
```
Ícone do Menu:  🟣 from-indigo-600 to-purple-600
Título:         🟣 "Histórico" com gradiente indigo → purple
Valores:        🟣 Transações em cores por tipo
Gráficos:       📊 Análises visuais
Mascaramento:   ✅ Valores na seção "Últimas Transações"
```

**Resultado Visual:**
```
┌─────────────────────────────────┐
│ 🟣 Histórico                    │
│ ════════════════════════════════│
│ 📊 Gráficos de análise          │
│ Últimas Transações:             │
│ ●●●●●●●●●●●  👁️               │
└─────────────────────────────────┘
```

---

### 📸 Comprovante
```
Ícone do Menu:  🔵 from-cyan-600 to-blue-600
Título:         🔵 "Comprovante" com gradiente cyan → blue
Valores:        📷 Escaneia e identifica automaticamente
Mascaramento:   ✅ Valores extraídos também mascaráveis
```

**Resultado Visual:**
```
┌─────────────────────────────────┐
│ 🔵 Comprovante                  │
│ ════════════════════════════════│
│ 📷 Selecionar Imagem            │
│ Valor extraído: ●●●●●●  👁️    │
└─────────────────────────────────┘
```

---

### ⚙️ Configurações
```
Ícone do Menu:  ⚪ from-slate-700 to-slate-800 (bottom)
Título:         ⚪ "Configurações" com gradiente slate → slate
Conteúdo:       👤 Perfil, Senha, Email
Mascaramento:   ✅ Preparado para dados sensíveis
```

**Resultado Visual:**
```
┌─────────────────────────────────┐
│ ⚪ Configurações                │
│ ════════════════════════════════│
│ Gerenciar conta                 │
│ Email: ●●●●●●●  👁️            │
└─────────────────────────────────┘
```

---

## 🔄 Sincronização de Mascaramento

### Como funciona:

1. **Usuário clica no toggle de olho no Dashboard**
   ```
   Botão "Mostrar/Ocultar" (header do Dashboard)
   ```

2. **Estado global atualiza via Context**
   ```tsx
   useValueVisibility() → isValuesVisible (true/false)
   ```

3. **TODAS as páginas atualizam simultaneamente**
   ```
   Dashboard    ✓ Mascarado
   Entradas     ✓ Mascarado
   Despesas     ✓ Mascarado
   Recorridos   ✓ Mascarado
   Histórico    ✓ Mascarado
   Comprovante  ✓ Mascarado
   ```

---

## 🎯 Benefícios do Padrão

| Aspecto | Benefício |
|---------|-----------|
| **Consistência** | Cada página tem cor única e reconhecível |
| **Usabilidade** | Usuário sabe onde está pelo gradiente no título |
| **Segurança** | Mascaramento sincronizado em toda a app |
| **Privacidade** | Um clique oculta todos os valores |
| **Visual** | Design premium e profissional |

---

## 📝 Implementação Técnica

### Padrão de Título (Template)
```tsx
<h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[COLOR1] to-[COLOR2]">
  Título da Página
</h1>
<p className="text-slate-400 mt-3 text-lg">
  Descrição/subtítulo
</p>
```

### Padrão de Mascaramento
```tsx
import { useValueVisibility } from '@/lib/ValueVisibilityContext';
import { MaskedValue } from '@/components/MaskedValue';

// No componente
const { isValuesVisible } = useValueVisibility();

// Ao renderizar valor
<div className="text-[COR]">
  <MaskedValue
    value={`R$ ${formatNumber(valor)}`}
    isVisible={isValuesVisible}
    onToggle={() => {}}
  />
</div>
```

---

## ✅ Status

- ✅ **Dashboard** - Título azul + Toggle + Mascaramento
- ✅ **Entradas** - Título verde + Valores mascaráveis
- ✅ **Despesas** - Título vermelho + Valores mascaráveis
- ✅ **Recorridos** - Título amarelo + Valores mascaráveis
- ✅ **Histórico** - Título roxo + Valores mascaráveis
- ✅ **Comprovante** - Título ciano + Estrutura
- ✅ **Configurações** - Título cinza + Estrutura
- ✅ **Sincronização Global** - Funcionando perfeitamente

---

## 🚀 Visual Consistency

Agora seu aplicativo tem:
- 🎨 **Identidade visual forte** em cada página
- 🔐 **Segurança visual** com mascaramento sincronizado
- 💎 **Design premium** com gradientes consistentes
- 🎯 **UX intuitiva** - cores identifikam o contexto

Parabéns! 🎉
