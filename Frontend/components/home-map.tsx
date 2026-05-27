import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GardenRegion } from '@/app/(tabs)/home';
import { useAppTheme } from '@/components/app-theme';

type HomeMapProps = {
  fallbackRegion: GardenRegion;
  userRegion: GardenRegion | null;
};

export function HomeMap({ fallbackRegion, userRegion }: HomeMapProps) {
  const { colors } = useAppTheme();
  const activeRegion = userRegion ?? fallbackRegion;

  function openFullMap() {
    router.push({
      pathname: '/map-picker',
      params: {
        latitude: String(activeRegion.latitude),
        longitude: String(activeRegion.longitude),
      },
    });
  }

  return (
    <View style={[styles.mapCard, { backgroundColor: colors.mapFallback }]}>
      <View style={[styles.mapGrid, { backgroundColor: colors.mapFallback }]}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={`h-${index}`} style={[styles.mapLineH, { top: `${index * 13}%` }]} />
        ))}
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={`v-${index}`} style={[styles.mapLineV, { left: `${index * 16}%` }]} />
        ))}
        <Text style={[styles.coords, { color: colors.textStrong }]}>
          {activeRegion.latitude.toFixed(3)}, {activeRegion.longitude.toFixed(3)}
        </Text>
      </View>

      <Pressable style={[styles.mapButton, { backgroundColor: colors.mapButton }]} onPress={openFullMap}>
        <Ionicons name="expand-outline" size={22} color={colors.tint} />
        <Text style={[styles.mapButtonText, { color: colors.tint }]}>Abrir Mapa</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    height: 192,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  mapLineH: {
    position: 'absolute',
    left: -24,
    right: -24,
    height: 1,
    backgroundColor: 'rgba(158, 210, 184, 0.16)',
    transform: [{ rotate: '-11deg' }],
  },
  mapLineV: {
    position: 'absolute',
    top: -24,
    bottom: -24,
    width: 1,
    backgroundColor: 'rgba(158, 210, 184, 0.13)',
    transform: [{ rotate: '15deg' }],
  },
  coords: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 12,
    fontWeight: '700',
  },
  mapButton: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    minHeight: 42,
    borderRadius: 23,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
