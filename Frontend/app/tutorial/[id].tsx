import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { tutorials } from '@/constants/tutorials';

export default function TutorialDetail() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tutorial = tutorials.find((item) => item.id === id) ?? tutorials[0];
  const [isSaved, setIsSaved] = useState(false);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable style={[styles.iconButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={[styles.topTitle, { color: colors.text }]}>Tutorial</Text>
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => setIsSaved((current) => !current)}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={colors.tint}
            />
          </Pressable>
        </View>

        <Image source={{ uri: tutorial.image }} style={styles.heroImage} contentFit="cover" />

        <View style={styles.titleBlock}>
          <Text style={[styles.levelBadge, { backgroundColor: colors.iconBox, color: colors.tint }]}>
            {tutorial.level}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>{tutorial.title}</Text>
          <Text style={[styles.description, { color: colors.muted }]}>{tutorial.intro}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: colors.muted }]}>
              <Ionicons name="time-outline" size={13} /> {tutorial.duration}
            </Text>
            <Text style={[styles.meta, { color: colors.muted }]}>
              <Ionicons name="eye-outline" size={13} /> {tutorial.views}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Materiais necessarios</Text>
          <View style={styles.materialGrid}>
            {tutorial.materials.map((material) => (
              <View
                key={material}
                style={[styles.materialItem, { backgroundColor: colors.iconBox }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.tint} />
                <Text style={[styles.materialText, { color: colors.text }]}>{material}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Passo a passo</Text>
          {tutorial.steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.muted }]}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dicas rapidas</Text>
          {tutorial.tips.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Ionicons name="leaf-outline" size={18} color={colors.tint} />
              <Text style={[styles.tipText, { color: colors.muted }]}>{tip}</Text>
            </View>
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
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: 20,
  },
  titleBlock: {
    gap: 12,
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
  title: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '800',
  },
  description: {
    fontSize: 16,
    lineHeight: 25,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 18,
  },
  meta: {
    fontSize: 13,
  },
  section: {
    borderRadius: 18,
    padding: 18,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  materialGrid: {
    gap: 10,
  },
  materialItem: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  materialText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
  },
});
