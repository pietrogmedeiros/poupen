'use client';

import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/useNotifications';
import { Toast } from './Toast';

export function NotificationHandler({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toastNotification, setToastNotification } = useNotifications(user?.id);

  return (
    <>
      {children}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast
            title={toastNotification.title}
            message={toastNotification.message}
            type={toastNotification.type}
            onClose={() => setToastNotification(null)}
          />
        </div>
      )}
    </>
  );
}
