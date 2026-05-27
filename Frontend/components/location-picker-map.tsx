import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';

type LocationPickerMapProps = {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
};

const quickPoints = [
  { label: 'Norte', latitudeOffset: 0.02, longitudeOffset: 0 },
  { label: 'Leste', latitudeOffset: 0, longitudeOffset: 0.02 },
  { label: 'Sul', latitudeOffset: -0.02, longitudeOffset: 0 },
  { label: 'Oeste', latitudeOffset: 0, longitudeOffset: -0.02 },
];

export function LocationPickerMap({ initialRegion }: LocationPickerMapProps) {
  const { colors } = useAppTheme();
  const [selectedCoordinate, setSelectedCoordinate] = useState({
    latitude: initialRegion.latitude,
    longitude: initialRegion.longitude,
  });

  function saveLocation() {
    router.replace({
      pathname: '/home',
      params: {
        latitude: selectedCoordinate.latitude.toFixed(6),
        longitude: selectedCoordinate.longitude.toFixed(6),
      },
    });
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.mapFallback }]}>
      <View style={[styles.mapGrid, { backgroundColor: colors.mapFallback }]}>
        {Array.from({ length: 10 }).map((_, index) => (
          <View key={`h-${index}`} style={[styles.mapLineH, { top: `${index * 11}%` }]} />
        ))}
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={`v-${index}`} style={[styles.mapLineV, { left: `${index * 14}%` }]} />
        ))}
      </View>

      <SafeAreaView style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.background }]}
            onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>

          <View style={[styles.coordsBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.coordsTitle, { color: colors.text }]}>
              Localizacao selecionada
            </Text>
            <Text style={[styles.coordsText, { color: colors.muted }]}>
              Lat: {selectedCoordinate.latitude.toFixed(6)}
            </Text>
            <Text style={[styles.coordsText, { color: colors.muted }]}>
              Long: {selectedCoordinate.longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        <View style={styles.pointGrid}>
          {quickPoints.map((point) => (
            <Pressable
              key={point.label}
              style={[styles.pointButton, { backgroundColor: colors.mapButton }]}
              onPress={() =>
                setSelectedCoordinate({
                  latitude: initialRegion.latitude + point.latitudeOffset,
                  longitude: initialRegion.longitude + point.longitudeOffset,
                })
              }>
              <Text style={[styles.pointText, { color: colors.tint }]}>{point.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actionGroup}>
          <Pressable
            style={[styles.centerButton, { backgroundColor: colors.background }]}
            onPress={() =>
              setSelectedCoordinate({
                latitude: initialRegion.latitude,
                longitude: initialRegion.longitude,
              })
            }>
            <Ionicons name="locate-outline" size={23} color={colors.tint} />
            <Text style={[styles.centerButtonText, { color: colors.tint }]}>
              Minha localizacao
            </Text>
          </Pressable>

          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={saveLocation}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Salvar localizacao</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 18,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordsBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    gap: 3,
  },
  coordsTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  coordsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionGroup: {
    gap: 10,
  },
  centerButton: {
    minHeight: 52,
    borderRadius: 26,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  centerButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  pointGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pointButton: {
    minHeight: 44,
    minWidth: 82,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pointText: {
    fontSize: 14,
    fontWeight: '800',
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
