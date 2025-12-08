'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  History,
  Camera,
  Settings,
  HelpCircle,
  LogOut,
  Pen,
  Repeat2,
  Brain
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/useNotifications';
import { NotificationCenter } from './NotificationCenter';

const menuItems = [
  { icon: LayoutDashboard, href: '/', label: 'Dashboard', color: 'from-gray-600 to-gray-700' },
  { icon: TrendingUp, href: '/entradas', label: 'Entradas', color: 'from-gray-600 to-gray-700' },
  { icon: TrendingDown, href: '/despesas', label: 'Despesas', color: 'from-gray-600 to-gray-700' },
  { icon: Repeat2, href: '/recorridos', label: 'Recorridos', color: 'from-gray-600 to-gray-700' },
  { icon: Brain, href: '/analises', label: 'Análises IA', color: 'from-purple-600 to-purple-700' },
  { icon: History, href: '/historico', label: 'Histórico', color: 'from-gray-600 to-gray-700' },
  { icon: Camera, href: '/comprovante', label: 'Comprovante', color: 'from-gray-600 to-gray-700' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);

  // Esconder sidebar em páginas de auth
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
    <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-20 md:bg-gradient-to-b md:from-gray-900 md:via-gray-900 md:to-gray-800 md:border-r md:border-gray-700 md:flex md:flex-col md:items-center md:py-8 md:space-y-8">
      {/* Logo */}
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl text-white font-bold text-xl shadow-lg border border-gray-600">
        <Pen size={24} />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-br ${item.color} text-white shadow-lg`
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-3 py-1 bg-gray-800 text-gray-100 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-gray-700">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Icons */}
      <div className="flex flex-col space-y-4 mt-auto pt-4 border-t border-gray-700">
        <Link
          href="/configuracoes"
          className={`relative group flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
            pathname === '/configuracoes'
              ? 'text-white bg-gray-800'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
          }`}
          title="Configurações"
        >
          <Settings className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-3 py-1 bg-gray-800 text-gray-100 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-gray-700">
            Configurações
          </span>
        </Link>

        {/* Notificações */}
        <div className="relative group">
          <NotificationCenter unreadCount={unreadCount} />
        </div>

        <button
          onClick={handleLogout}
          className="relative group flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all duration-300"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-3 py-1 bg-gray-800 text-gray-100 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-gray-700">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
