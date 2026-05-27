import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { GardenRegion } from '@/app/(tabs)/home';
import { useAppTheme } from '@/components/app-theme';

type HomeMapProps = {
  fallbackRegion: GardenRegion;
  userRegion: GardenRegion | null;
};

export function HomeMap({ fallbackRegion, userRegion }: HomeMapProps) {
  const { colors } = useAppTheme();
  const mapRef = useRef<MapView>(null);
  const activeRegion = userRegion ?? fallbackRegion;

  useEffect(() => {
    if (userRegion) {
      mapRef.current?.animateToRegion(userRegion, 450);
    }
  }, [userRegion]);

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
    <View style={[styles.mapCard, { backgroundColor: colors.surface }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={activeRegion}
        showsCompass={false}
        showsUserLocation={!!userRegion}
        showsMyLocationButton={false}
        toolbarEnabled={false}>
        {!userRegion && (
          <Marker
            coordinate={{
              latitude: fallbackRegion.latitude,
              longitude: fallbackRegion.longitude,
            }}
            title="Sao Paulo"
            description="Localizacao padrao"
            pinColor={colors.tint}
          />
        )}
      </MapView>

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
  map: {
    ...StyleSheet.absoluteFillObject,
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
