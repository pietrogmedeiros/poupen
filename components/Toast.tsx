import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Bell, X } from 'lucide-react';

interface ToastProps {
  title: string;
  message: string;
  type: 'reminder' | 'created' | 'vencido';
  onClose: () => void;
  autoCloseDuration?: number;
}

export function Toast({ title, message, type, onClose, autoCloseDuration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoCloseDuration, onClose]);

  if (!isVisible) return null;

  const styles = {
    reminder: {
      bg: 'bg-blue-500 dark:bg-blue-600',
      icon: <Bell className="w-5 h-5" />,
    },
    created: {
      bg: 'bg-green-500 dark:bg-green-600',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    vencido: {
      bg: 'bg-red-500 dark:bg-red-600',
      icon: <AlertCircle className="w-5 h-5" />,
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} text-white rounded-lg shadow-lg p-4 max-w-md animate-slide-in`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm opacity-90 mt-1">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        :global(.animate-slide-in) {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
