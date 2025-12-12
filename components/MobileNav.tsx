'use client';

import { useState, memo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
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

const menuItems = [
  { icon: LayoutDashboard, href: '/', label: 'Dashboard' },
  { icon: TrendingUp, href: '/entradas', label: 'Entradas' },
  { icon: TrendingDown, href: '/despesas', label: 'Despesas' },
  { icon: Repeat2, href: '/recorridos', label: 'Recorridos' },
  { icon: History, href: '/historico', label: 'Histórico' },
  { icon: Camera, href: '/comprovante', label: 'Comprovante' },
];

// Cor padrão para todos os itens selecionados
const ACTIVE_ITEM_GRADIENT = 'linear-gradient(135deg, #eab308 0%, #b45309 100%)';

const MobileMenuItem = memo(({ item, isActive, onClose }: { item: typeof menuItems[0], isActive: boolean, onClose: () => void }) => {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white ${
        isActive
          ? 'shadow-xl'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
      style={isActive ? { 
        background: ACTIVE_ITEM_GRADIENT,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4), 0 0 24px rgba(0, 0, 0, 0.2)',
      } : {}}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{item.label}</span>
    </Link>
  );
});

MobileMenuItem.displayName = 'MobileMenuItem';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);

  const handleCloseMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [signOut, router]);

  // Esconder em páginas de auth
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-700/30 backdrop-blur-xl flex items-center px-4 z-40 shadow-xl will-change-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        <div className="flex-1 flex items-center justify-center">
          <Link href="/" className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden hover:scale-110 transition-transform will-change-transform">
            <img src="/logo.png" alt="Poupen Logo" className="w-full h-full object-cover" />
          </Link>
        </div>

        <div className="w-10" />
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 top-16"
          onClick={handleCloseMenu}
        />
      )}

      {/* Mobile Menu */}
      <nav
        className={`md:hidden fixed left-0 top-16 bottom-0 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-r border-slate-700/30 backdrop-blur-xl overflow-y-auto z-30 transform transition-transform duration-200 shadow-2xl will-change-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <MobileMenuItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              onClose={handleCloseMenu}
            />
          ))}
        </div>

        {/* Bottom Menu */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700/30 bg-slate-900/50 backdrop-blur-sm p-4 space-y-2">
          <Link
            href="/configuracoes"
            onClick={handleCloseMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === '/configuracoes'
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </Link>

          <button
            onClick={() => {
              handleLogout();
              handleCloseMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Spacer for top padding */}
      <div className="md:hidden h-16" />
    </>
  );
}
