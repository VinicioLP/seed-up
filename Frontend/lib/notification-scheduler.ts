import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Platform } from "react-native";
import {
  ensureNotificationChannelAsync,
  sendRandomNotificationAsync,
} from "./notifications";

export async function startNotificationScheduler() {
  try {
    await ensureNotificationChannelAsync();
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
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  for (let i = 1; i <= 24; i++) {
    const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌱 Notificação SeedUp",
          body: "Confira suas plantas!",
          data: { category: "periodic_check" },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.CALENDAR,
          repeats: true,
          hour: futureTime.getHours(),
          minute: futureTime.getMinutes(),
        },
      });
    } catch (error) {
      console.error("Erro ao agendar notificação:", error);
    }
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
