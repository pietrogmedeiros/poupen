'use client';

import { useState } from 'react';
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
  Repeat2,
  Brain
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/useNotifications';

const menuItems = [
  { icon: LayoutDashboard, href: '/', label: 'Dashboard' },
  { icon: TrendingUp, href: '/entradas', label: 'Entradas' },
  { icon: TrendingDown, href: '/despesas', label: 'Despesas' },
  { icon: Repeat2, href: '/recorridos', label: 'Recorridos' },
  { icon: Brain, href: '/analises', label: 'Análises IA' },
  { icon: History, href: '/historico', label: 'Histórico' },
  { icon: Camera, href: '/comprovante', label: 'Comprovante' },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);

  // Esconder em páginas de auth
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-b border-gray-700 flex items-center px-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        <div className="flex-1 flex items-center justify-center">
          <Link href="/" className="flex items-center justify-center w-14 h-14 rounded-lg overflow-hidden">
            <img src="/logo.png" alt="Poupen Logo" className="w-full h-full object-cover" />
          </Link>
        </div>

        <div className="w-10" />
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <nav
        className={`md:hidden fixed left-0 top-16 bottom-0 w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-r border-gray-700 overflow-y-auto z-30 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Menu */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700 bg-gray-900/50 p-4 space-y-2">
          <Link
            href="/configuracoes"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              pathname === '/configuracoes'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </Link>

          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-300"
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
