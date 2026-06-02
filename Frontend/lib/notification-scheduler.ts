import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  ensureNotificationChannelAsync,
  sendRandomNotificationAsync,
} from "./notifications";

export async function startNotificationScheduler() {
  try {
    await ensureNotificationChannelAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✅ Scheduler Ativado",
        body: "Você receberá notificações a cada 1 hora!",
        data: { category: "scheduler_start" },
      },
      trigger: {
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
