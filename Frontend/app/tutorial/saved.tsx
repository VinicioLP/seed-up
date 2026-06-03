import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { Tutorial, fetchSavedTutorials } from '@/lib/tutorials';

export default function SavedTutorials() {
  const { colors } = useAppTheme();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadSavedTutorials = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setTutorials(await fetchSavedTutorials());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSavedTutorials();
    }, [loadSavedTutorials])
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={[styles.topTitle, { color: colors.text }]}>Salvos</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text }]}>Tutoriais salvos</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Acesse rapidamente os guias que voce marcou para consultar depois.
          </Text>
        </View>

        {isLoading ? (
          <View style={[styles.stateBlock, { backgroundColor: colors.surface }]}>
            <ActivityIndicator color={colors.tint} />
            <Text style={[styles.stateText, { color: colors.muted }]}>Carregando salvos...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View style={[styles.stateBlock, { backgroundColor: colors.surface }]}>
            <Ionicons name="alert-circle-outline" size={28} color={colors.tint} />
            <Text style={[styles.stateText, { color: colors.muted }]}>{errorMessage}</Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.tint }]}
              onPress={loadSavedTutorials}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !errorMessage && tutorials.length === 0 ? (
          <View style={[styles.stateBlock, { backgroundColor: colors.surface }]}>
            <Ionicons name="bookmark-outline" size={30} color={colors.tint} />
            <Text style={[styles.stateText, { color: colors.muted }]}>
              Voce ainda nao salvou nenhum tutorial.
            </Text>
          </View>
        ) : null}

        <View style={styles.cards}>
          {tutorials.map((tutorial) => (
            <Pressable
              key={tutorial.id}
              style={[styles.card, { backgroundColor: colors.surface }]}
              onPress={() =>
                router.push({
                  pathname: '/tutorial/[id]',
                  params: { id: tutorial.id },
                } as never)
              }>
              <Image source={{ uri: tutorial.image }} style={styles.cardImage} contentFit="cover" />
              <View style={styles.cardBody}>
                <Text style={[styles.badge, { backgroundColor: colors.iconBox, color: colors.tint }]}>
                  {tutorial.level}
                </Text>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{tutorial.title}</Text>
                <Text style={[styles.cardDescription, { color: colors.muted }]} numberOfLines={2}>
                  {tutorial.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 44,
    gap: 22,
  },
  topBar: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  titleBlock: {
    gap: 8,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  stateBlock: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  stateText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  retryButton: {
    minHeight: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cards: {
    gap: 18,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 12px 22px rgba(40, 65, 48, 0.08)',
  },
  cardImage: {
    width: '100%',
    height: 185,
  },
  cardBody: {
    padding: 18,
    gap: 9,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '800',
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
});
