import { Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NotificationCenterProps {
  unreadCount: number;
}

export function NotificationCenter({ unreadCount }: NotificationCenterProps) {
  const pathname = usePathname();
  const isActive = pathname === '/notificacoes';

  return (
    <Link
      href="/notificacoes"
      className={`relative flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
      title="Notificações"
    >
      <Bell className="w-5 h-5" />
      
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
