import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NotificationType =
  | 'watering'
  | 'harvest'
  | 'care_tip'
  | 'weather_alert'
  | 'daily_challenge'
  | 'community_post';

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
}

const notificationTemplates: Record<NotificationType, () => NotificationConfig> = {
  watering: () => ({
    type: 'watering',
    title: '💧 Hora de Regar',
    body: 'Suas plantas estão precisando de água. Regue suas mudas agora!',
    data: { category: 'watering' },
  }),
  harvest: () => ({
    type: 'harvest',
    title: '🌱 Colheita Disponível',
    body: 'Suas plantas estão prontas para colher! Veja quais estão maduras.',
    data: { category: 'harvest' },
  }),
  care_tip: () => {
    const tips = [
      'Remova folhas mortas para melhorar a circulação de ar.',
      'Use composto orgânico para nutrir suas plantas naturalmente.',
      'Plantas precisam de 6-8 horas de luz solar por dia.',
      'Faça poda regular para estimular o crescimento saudável.',
      'Mantenha a umidade do solo consistente, sem encharcar.',
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    return {
      type: 'care_tip',
      title: '🌿 Dica de Cuidado',
      body: randomTip,
      data: { category: 'care_tip' },
    };
  },
  weather_alert: () => {
    const alerts = [
      'Chuva prevista! Prepare suas plantas para a chuva.',
      'Previsão de calor intenso. Aumente a rega das plantas.',
      'Vento forte esperado. Proteja suas mudas delicadas.',
      'Dia ensolarado perfeito para plantio!',
    ];
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    return {
      type: 'weather_alert',
      title: '☀️ Alerta de Clima',
      body: randomAlert,
      data: { category: 'weather_alert' },
    };
  },
  daily_challenge: () => {
    const challenges = [
      'Desafio: Plante uma nova muda hoje!',
      'Desafio: Fotografe sua planta mais bonita.',
      'Desafio: Compartilhe uma dica de horta com um amigo.',
      'Desafio: Organize seus potes e ferramentas.',
      'Desafio: Faça compostagem de restos de plantas.',
    ];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    return {
      type: 'daily_challenge',
      title: '🎯 Desafio do Dia',
      body: randomChallenge,
      data: { category: 'daily_challenge' },
    };
  },
  community_post: () => ({
    type: 'community_post',
    title: 'Postagem publicada',
    body: 'Sua postagem ja esta na comunidade.',
    data: { category: 'community_post' },
  }),
};

export async function ensureNotificationChannelAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2F9E44',
    });
  }
}

export async function ensureNotificationPermissionsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== Notifications.PermissionStatus.GRANTED) {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === Notifications.PermissionStatus.GRANTED;
}

export async function sendNotificationAsync(config: NotificationConfig) {
  try {
    const hasPermission = await ensureNotificationPermissionsAsync();
    if (!hasPermission) {
      console.warn('Notificação não permitida pelo usuário');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        data: config.data,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

export async function sendRandomNotificationAsync() {
  const types: NotificationType[] = ['watering', 'harvest', 'care_tip', 'weather_alert', 'daily_challenge'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const config = notificationTemplates[randomType]();
  await sendNotificationAsync(config);
}

export async function sendCommunityPostPublishedNotificationAsync(postId: string) {
  await sendNotificationAsync({
    type: 'community_post',
    title: 'Postagem publicada',
    body: 'Toque para ver a postagem que voce acabou de publicar.',
    data: {
      category: 'community_post',
      screen: 'community',
      postId,
    },
  });
}

export function getNotificationConfig(type: NotificationType): NotificationConfig {
  return notificationTemplates[type]();
}
