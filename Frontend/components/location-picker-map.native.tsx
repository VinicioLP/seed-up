import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type MapPressEvent, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';

type LocationPickerMapProps = {
  initialRegion: Region;
};

export function LocationPickerMap({ initialRegion }: LocationPickerMapProps) {
  const { colors } = useAppTheme();
  const mapRef = useRef<MapView>(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState({
    latitude: initialRegion.latitude,
    longitude: initialRegion.longitude,
  });
  const [locationMessage, setLocationMessage] = useState('');

  function selectLocation(event: MapPressEvent) {
    setSelectedCoordinate(event.nativeEvent.coordinate);
  }

  function saveLocation() {
    router.replace({
      pathname: '/home',
      params: {
        latitude: selectedCoordinate.latitude.toFixed(6),
        longitude: selectedCoordinate.longitude.toFixed(6),
      },
    });
  }

  async function centerOnUser() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== Location.PermissionStatus.GRANTED) {
      setLocationMessage('Permissao de localizacao negada');
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const nextCoordinate = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };
    const nextRegion = {
      ...initialRegion,
      ...nextCoordinate,
    };

    setSelectedCoordinate(nextCoordinate);
    setLocationMessage('Centralizado na sua localizacao');
    mapRef.current?.animateToRegion(nextRegion, 450);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={selectLocation}
        showsCompass
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}>
        <Marker
          coordinate={selectedCoordinate}
          draggable
          onDragEnd={(event) => setSelectedCoordinate(event.nativeEvent.coordinate)}
          pinColor={colors.tint}
          title="Localizacao selecionada"
        />
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
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
            {!!locationMessage && (
              <Text style={[styles.messageText, { color: colors.tint }]}>{locationMessage}</Text>
            )}
          </View>
        </View>

        <View style={styles.actionGroup}>
          <Pressable
            style={[styles.centerButton, { backgroundColor: colors.background }]}
            onPress={centerOnUser}>
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
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
  messageText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
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
