import { useEffect } from 'react';
import {
  startNotificationScheduler,
  stopNotificationScheduler,
  testScheduler,
} from '@/lib/notification-scheduler';
import { ensureNotificationChannelAsync, ensureNotificationPermissionsAsync } from '@/lib/notifications';

export function useNotificationScheduler() {
  useEffect(() => {
    async function initializeScheduler() {
      try {
        // Preparar canal de notificações
        await ensureNotificationChannelAsync();

        // Solicitar permissões
        const hasPermission = await ensureNotificationPermissionsAsync();
        if (!hasPermission) {
          console.warn('Permissão de notificações não concedida');
          return;
        }

        // Iniciar scheduler
        await startNotificationScheduler();
        console.log('✅ Scheduler de notificações iniciado');
      } catch (error) {
        console.error('Erro ao inicializar scheduler:', error);
      }
    }

    initializeScheduler();

    // Cleanup
    return () => {
      stopNotificationScheduler().catch(error =>
        console.error('Erro ao parar scheduler:', error)
      );
    };
  }, []);

  return {
    testNotification: testScheduler,
  };
}
