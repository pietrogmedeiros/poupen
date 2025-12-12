# 🔐 Feature: Mascaramento de Valores (Bank-style)

## O que foi implementado?

Uma feature similar aos bancos, que permite ocultar/mostrar valores monetários com um simples clique no botão de olho.

---

## 📦 Componentes Criados

### 1. **useValueVisibility Hook** (`lib/useValueVisibility.ts`)
```tsx
// Hook customizado para gerenciar visibilidade
const { isVisible, toggle } = useValueVisibility();
```

### 2. **ValueVisibilityContext** (`lib/ValueVisibilityContext.tsx`)
```tsx
// Context global que sincroniza visibilidade em toda a app
const { isValuesVisible, toggleValuesVisibility } = useValueVisibility();
```

### 3. **MaskedValue Component** (`components/MaskedValue.tsx`)
```tsx
<MaskedValue 
  value={100.50}
  isVisible={isValuesVisible}
  onToggle={handleToggle}
  blurred={false}
  className="text-2xl font-bold"
/>
```

**Características:**
- ✅ Mostra pontos (•••••) quando oculto
- ✅ Botão de olho com hover effect
- ✅ Suporta mode "blurred" (desfocado)
- ✅ ForwardRef para máxima compatibilidade
- ✅ Customizável com className

### 4. **ValueVisibilityToggle Component** (`components/ValueVisibilityToggle.tsx`)
```tsx
// Botão global no Dashboard
<ValueVisibilityToggle />
```

**Características:**
- ✅ Muda entre Mostrar/Ocultar
- ✅ Ícones Eye/EyeOff do Lucide
- ✅ Responsive (oculta texto em mobile)
- ✅ Estilo premium SaaS

---

## 🎯 Integração

### Layout Principal (`app/layout.tsx`)
```tsx
<ValueVisibilityProvider>
  {/* Toda a app agora tem acesso à visibilidade */}
</ValueVisibilityProvider>
```

### Dashboard (`app/page.tsx`)
```tsx
// Header com botão de toggle
<ValueVisibilityToggle />

// Cards com valores mascaráveis
<MaskedValue 
  value={`R$ ${formatNumber(balance)}`}
  isVisible={isValuesVisible}
  onToggle={() => setShowBalance(!showBalance)}
/>

// Transações com valores mascaráveis
<MaskedValue 
  value={`${tipo} R$ ${formatNumber(amount)}`}
  isVisible={isValuesVisible}
  onToggle={() => {}}
/>
```

---

## 🎨 Visual

### Botão de Toggle (Header)
```
┌─────────────────────────┐
│ 👁️ Ocultar  │  👁️ Mostrar │
└─────────────────────────┘
```

### Valor Visível
```
┌────────────────────┐
│ R$ 1.234,56   👁️ │
└────────────────────┘
```

### Valor Oculto
```
┌────────────────────┐
│ •••••••••   👁️‍🗨️ │
└────────────────────┘
```

---

## 🔄 Fluxo de Funcionamento

1. **Clique no botão de olho**
   ↓
2. `toggleValuesVisibility()` atualiza context
   ↓
3. **Todos os componentes recebem novo estado**
   ↓
4. **MaskedValue renderiza novamente**
   ↓
5. **Valores alternam entre visível/oculto**

---

## 💡 Características Avançadas

### Sincronização Global
- Um único clique oculta TODOS os valores em tempo real
- Usa React Context para evitar prop drilling

### Performance
- `useCallback` para funções memorizadas
- Componentes memoizados para evitar re-renders
- Transições CSS suaves (200ms)

### Acessibilidade
- `title` attribute no botão
- Ícones descritivos (Eye/EyeOff)
- Contraste de cores adequado

---

## 📊 Onde Está Integrado

- ✅ **Dashboard** - Cards principais (Saldo, Entradas, Despesas)
- ✅ **Dashboard** - Transações recentes
- 🔄 **Próximas páginas** - Pode ser expandido para Entradas, Despesas, Histórico

---

## 🚀 Futura Expansão

Para adicionar em outras páginas:

```tsx
import { useValueVisibility } from '@/lib/ValueVisibilityContext';
import { MaskedValue } from '@/components/MaskedValue';

// Na página
const { isValuesVisible } = useValueVisibility();

// Ao renderizar valores
<MaskedValue 
  value={valor}
  isVisible={isValuesVisible}
  onToggle={() => {}}
/>
```

---

## 🎯 Resultado

Seu aplicativo agora tem segurança visual como os bancos! 🏦✨

- Oculta valores com um clique
- Interface intuitiva com ícone de olho
- Sincronizado em toda a aplicação
- Premium e profissional
