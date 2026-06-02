import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { ensureNotificationChannelAsync, sendRandomNotificationAsync } from './notifications';

const NOTIFICATION_TASK = 'NOTIFICATION_SCHEDULER_TASK';

// Tarefa de background para enviar notificações
TaskManager.defineTask(NOTIFICATION_TASK, async () => {
  try {
    await ensureNotificationChannelAsync();
    await sendRandomNotificationAsync();
    return TaskManager.BackgroundTaskResult.NewData;
  } catch (error) {
    console.error('Erro na tarefa de notificação:', error);
    return TaskManager.BackgroundTaskResult.Failed;
  }
});

export async function startNotificationScheduler() {
  try {
    await ensureNotificationChannelAsync();

    // Se for Android, registra a tarefa de background
    if (Platform.OS === 'android') {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(NOTIFICATION_TASK);

      if (!isRegistered) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '✅ Scheduler Ativado',
            body: 'Você receberá notificações a cada 1 hora!',
            data: { category: 'scheduler_start' },
          },
          trigger: null,
        });
      }
    }

    // Para iOS, usa um scheduler local
    if (Platform.OS === 'ios') {
      setupIOSNotificationScheduler();
    }
  } catch (error) {
    console.error('Erro ao iniciar scheduler:', error);
  }
}

async function setupIOSNotificationScheduler() {
  // No iOS, vamos usar notificações agendadas regularmente
  // Limpar notificações agendadas anteriores
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Agendar 24 notificações (uma a cada hora)
  const now = new Date();
  for (let i = 1; i <= 24; i++) {
    const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌱 Notificação SeedUp',
        body: 'Confira suas plantas!',
        data: { category: 'periodic_check' },
      },
      trigger: {
        hour: futureTime.getHours(),
        minute: futureTime.getMinutes(),
        repeats: true,
      },
    });
  }
}

export async function stopNotificationScheduler() {
  try {
    if (Platform.OS === 'android') {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(NOTIFICATION_TASK);
      if (isRegistered) {
        await TaskManager.unregisterTaskAsync(NOTIFICATION_TASK);
      }
    } else if (Platform.OS === 'ios') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch (error) {
    console.error('Erro ao parar scheduler:', error);
  }
}

export async function testScheduler() {
  try {
    await ensureNotificationChannelAsync();
    await sendRandomNotificationAsync();
  } catch (error) {
    console.error('Erro ao testar scheduler:', error);
  }
}
