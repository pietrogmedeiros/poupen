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

// Componente memoizado para cada item do menu
const MenuItem = memo(({ item, isActive }: { item: typeof menuItems[0], isActive: boolean }) => {
  const Icon = item.icon;
  
  if (!isActive) {
    return (
      <Link
        href={item.href}
        className="relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:shadow-lg"
        title={item.label}
      >
        <Icon className="w-5 h-5" />
        
        {/* Tooltip */}
        <span className="absolute left-full ml-4 px-3 py-2 bg-[var(--bg-primary)] backdrop-blur-sm text-[var(--text-primary)] text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-[var(--border-secondary)] shadow-lg">
          {item.label}
        </span>
      </Link>
    );
  }
  
  return (
    <Link
      href={item.href}
      className="relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 text-white shadow-lg hover:shadow-xl bg-[var(--accent-primary)]"
      title={item.label}
    >
      <Icon className="w-5 h-5" />
      
      {/* Tooltip */}
      <span className="absolute left-full ml-4 px-3 py-2 bg-[var(--bg-primary)] backdrop-blur-sm text-[var(--text-primary)] text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-[var(--border-secondary)] shadow-lg">
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
    <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-20 md:bg-[var(--bg-primary)] md:border-r md:border-[var(--border-primary)] md:backdrop-blur-xl md:flex md:flex-col md:items-center md:py-8 md:space-y-6">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-lg group will-change-transform">
        <div className="absolute inset-0 bg-[var(--accent-primary)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
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
      <div className="flex flex-col space-y-3 mt-auto pt-6 border-t border-[var(--border-secondary)] will-change-auto">
        <Link
          href="/configuracoes"
          className={`relative group flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-200 ${
            pathname === '/configuracoes'
              ? 'text-white bg-[var(--accent-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }`}
          title="Configurações"
        >
          <Settings className="w-5 h-5" />
          <span className="absolute left-full ml-4 px-3 py-2 bg-[var(--bg-primary)] backdrop-blur-sm text-[var(--text-primary)] text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-[var(--border-secondary)] shadow-lg">
            Configurações
          </span>
        </Link>

        {/* Notificações */}
        <div className="relative group">
          <NotificationCenter unreadCount={unreadCount} />
        </div>

        <button
          onClick={handleLogout}
          className="relative group flex items-center justify-center w-11 h-11 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-full ml-4 px-3 py-2 bg-[var(--bg-primary)] backdrop-blur-sm text-red-400 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-[var(--border-secondary)] shadow-lg">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
