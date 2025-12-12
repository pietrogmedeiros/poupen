'use client';

import { memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  History,
  Camera,
  Settings,
  LogOut,
  Repeat2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/useNotifications';
import { NotificationCenter } from './NotificationCenter';

const menuItems = [
  { icon: LayoutDashboard, href: '/', label: 'Dashboard' },
  { icon: TrendingUp, href: '/entradas', label: 'Entradas' },
  { icon: TrendingDown, href: '/despesas', label: 'Despesas' },
  { icon: Repeat2, href: '/recorridos', label: 'Recorridos' },
  { icon: History, href: '/historico', label: 'Histórico' },
  { icon: Camera, href: '/comprovante', label: 'Comprovante' },
];

// Cor padrão para todos os ícones selecionados
const ACTIVE_ICON_GRADIENT = 'linear-gradient(135deg, #eab308 0%, #b45309 100%)';

// Componente memoizado para cada item do menu
const MenuItem = memo(({ item, isActive }: { item: typeof menuItems[0], isActive: boolean }) => {
  const Icon = item.icon;
  
  if (!isActive) {
    return (
      <Link
        href={item.href}
        className="relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50 hover:shadow-lg"
        title={item.label}
      >
        <Icon className="w-5 h-5" />
        
        {/* Tooltip */}
        <span className="absolute left-full ml-4 px-3 py-2 bg-slate-900/95 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-slate-700/50 shadow-lg">
          {item.label}
        </span>
      </Link>
    );
  }
  
  return (
    <Link
      href={item.href}
      className="relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 text-white shadow-xl hover:shadow-2xl"
      style={{
        background: ACTIVE_ICON_GRADIENT,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4), 0 0 24px rgba(0, 0, 0, 0.2)',
      }}
      title={item.label}
    >
      <Icon className="w-5 h-5" />
      
      {/* Tooltip */}
      <span className="absolute left-full ml-4 px-3 py-2 bg-slate-900/95 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-slate-700/50 shadow-lg">
        {item.label}
      </span>
    </Link>
  );
});

MenuItem.displayName = 'MenuItem';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [signOut, router]);

  // Esconder sidebar em páginas de auth
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-20 md:bg-gradient-to-b md:from-slate-950 md:via-slate-900 md:to-slate-900 md:border-r md:border-slate-700/50 md:backdrop-blur-xl md:flex md:flex-col md:items-center md:py-8 md:space-y-6">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 group will-change-transform">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
        <img src="/logo.png" alt="Poupen Logo" className="w-full h-full object-cover" />
      </Link>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col space-y-3 will-change-auto">
        {menuItems.map((item) => (
          <MenuItem 
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* Bottom Icons */}
      <div className="flex flex-col space-y-3 mt-auto pt-6 border-t border-slate-700/30 will-change-auto">
        <Link
          href="/configuracoes"
          className={`relative group flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-200 ${
            pathname === '/configuracoes'
              ? 'text-white bg-gradient-to-br from-slate-700 to-slate-800'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
          title="Configurações"
        >
          <Settings className="w-5 h-5" />
          <span className="absolute left-full ml-4 px-3 py-2 bg-slate-900/95 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-slate-700/50 shadow-lg">
            Configurações
          </span>
        </Link>

        {/* Notificações */}
        <div className="relative group">
          <NotificationCenter unreadCount={unreadCount} />
        </div>

        <button
          onClick={handleLogout}
          className="relative group flex items-center justify-center w-11 h-11 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-full ml-4 px-3 py-2 bg-slate-900/95 backdrop-blur-sm text-red-400 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-slate-700/50 shadow-lg">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
