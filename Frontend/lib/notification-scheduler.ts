import * as Notifications from "expo-notifications";
<<<<<<< HEAD
import { SchedulableTriggerInputTypes } from "expo-notifications";
=======
>>>>>>> 60d8783801559cdc5d614f843b4f25e379f4cc1a
import { Platform } from "react-native";
import {
  ensureNotificationChannelAsync,
  sendRandomNotificationAsync,
} from "./notifications";

export async function startNotificationScheduler() {
  try {
    await ensureNotificationChannelAsync();

<<<<<<< HEAD
    if (Platform.OS === "android") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Scheduler Ativado",
          body: "Você receberá notificações a cada 1 hora!",
          data: { category: "scheduler_start" },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DAILY,
          hour: 9,
          minute: 0,
        },
      });
    } else if (Platform.OS === "ios") {
      await setupIOSNotificationScheduler();
    }
  } catch (error) {
    console.error("Erro ao iniciar scheduler:", error);
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

=======
>>>>>>> 60d8783801559cdc5d614f843b4f25e379f4cc1a
=======
>>>>>>> 60d8783801559cdc5d614f843b4f25e379f4cc1a
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✅ Scheduler Ativado",
        body: "Você receberá notificações a cada 1 hora!",
        data: { category: "scheduler_start" },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.CALENDAR,
        repeats: true,
        hour: futureTime.getHours(),
        minute: futureTime.getMinutes(),

        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3600,
        repeats: true,
        ...(Platform.OS === "android" ? { channelId: "default" } : {}),
      },
    });
  } catch (error) {
    console.error("Erro ao iniciar scheduler:", error);
  }
}

export async function stopNotificationScheduler() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Erro ao parar scheduler:", error);
  }
}

export async function testScheduler() {
  try {
    await ensureNotificationChannelAsync();
    await sendRandomNotificationAsync();
  } catch (error) {
    console.error("Erro ao testar scheduler:", error);
  }
}
