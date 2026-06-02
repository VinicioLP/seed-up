import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { Tutorial, fetchTutorials } from '@/lib/tutorials';

const fallbackCategories = ['Todos', 'Horta', 'Irrigacao', 'Solo', 'Pragas'];

export default function Tutorials() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadTutorials = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setTutorials(await fetchTutorials());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTutorials();
  }, [loadTutorials]);

  const tutorialCategories = useMemo(() => {
    const categories = tutorials.map((tutorial) => tutorial.category).filter(Boolean);

    if (categories.length === 0) {
      return fallbackCategories;
    }

    return ['Todos', ...Array.from(new Set(categories))];
  }, [tutorials]);

  const filteredTutorials = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tutorials.filter((tutorial) => {
      const matchesCategory =
        selectedCategory === 'Todos' || tutorial.category === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        tutorial.title.toLowerCase().includes(normalizedSearch) ||
        tutorial.description.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory, tutorials]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.brandGroup}>
            <Image source={require('@/assets/images/icon.png')} style={styles.avatar} />
            <Text style={[styles.brand, { color: colors.tint }]}>SeedUp</Text>
          </View>
          <Pressable style={styles.themeButton} onPress={toggleTheme}>
            <Ionicons
              name={isDark ? 'moon-outline' : 'sunny-outline'}
              size={31}
              color={colors.tint}
            />
          </Pressable>
        </View>

        <Pressable
          style={styles.titleBlock}
          onLongPress={() => router.push('/tutorial/new' as never)}>
          <Text style={[styles.title, { color: colors.text }]}>Tutoriais de Cultivo</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Aprenda as melhores tecnicas para transformar seu espaco em um santuario verde.
          </Text>
        </Pressable>

        <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={18} color={colors.subtle} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Procurar tutoriais..."
            placeholderTextColor={colors.subtle}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {tutorialCategories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <Pressable
                key={category}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.tint : colors.surface,
                    borderColor: isSelected ? colors.tint : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.filterText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={colors.tint} />
            <Text style={[styles.stateText, { color: colors.muted }]}>Carregando tutoriais...</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View style={[styles.stateBlock, { backgroundColor: colors.surface }]}>
            <Ionicons name="alert-circle-outline" size={26} color={colors.tint} />
            <Text style={[styles.stateText, { color: colors.muted }]}>{errorMessage}</Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.tint }]}
              onPress={loadTutorials}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !errorMessage ? (
          <View style={styles.cards}>
            {filteredTutorials.map((tutorial) => (
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
                  <View style={styles.cardTopRow}>
                    <Text
                      style={[
                        styles.levelBadge,
                        {
                          backgroundColor:
                            tutorial.level === 'Avancado' ? '#D7F1FF' : colors.iconBox,
                          color: colors.tint,
                        },
                      ]}>
                      {tutorial.level}
                    </Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{tutorial.title}</Text>
                  <Text
                    style={[styles.cardDescription, { color: colors.muted }]}
                    numberOfLines={2}>
                    {tutorial.description}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={[styles.readMore, { color: colors.tint }]}>
                      {'Ler mais ->'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {filteredTutorials.length === 0 ? (
              <View style={[styles.stateBlock, { backgroundColor: colors.surface }]}>
                <Text style={[styles.stateText, { color: colors.muted }]}>
                  Nenhum tutorial encontrado.
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 112,
    gap: 24,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 24,
    paddingBottom: 13,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D6EBD5',
  },
  brand: {
    fontSize: 23,
    fontWeight: '800',
  },
  themeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    paddingHorizontal: 24,
    gap: 10,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
  },
  subtitle: {
    maxWidth: 310,
    fontSize: 16,
    lineHeight: 25,
  },
  searchBox: {
    minHeight: 58,
    borderRadius: 10,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filters: {
    gap: 14,
    paddingHorizontal: 24,
  },
  filterChip: {
    minHeight: 42,
    minWidth: 82,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '800',
  },
  cards: {
    paddingHorizontal: 24,
    gap: 28,
  },
  stateBlock: {
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 18,
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
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 12px 22px rgba(40, 65, 48, 0.08)',
  },
  cardImage: {
    width: '100%',
    height: 205,
  },
  cardBody: {
    padding: 20,
    gap: 10,
  },
  cardTopRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
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
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 23,
  },
  cardFooter: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  meta: {
    fontSize: 12,
  },
  readMore: {
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '800',
  },
});
