import * as Notifications from "expo-notifications";
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
          seconds: 3600,
          repeats: true,
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

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌱 Notificação SeedUp",
        body: "Confira suas plantas!",
        data: { category: "periodic_check" },
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
