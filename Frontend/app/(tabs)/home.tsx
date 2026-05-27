import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/components/app-theme';
import { HomeMap } from '../../components/home-map';

export type GardenRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const saoPauloRegion: GardenRegion = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const weatherStats = [
  { icon: 'rainy-outline', label: 'Chuva', value: '12%' },
  { icon: 'water-outline', label: 'Umidade', value: '65%' },
  { icon: 'reorder-three-outline', label: 'Vento', value: '8 km/h' },
] as const;

export default function Home() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const params = useLocalSearchParams<{ latitude?: string; longitude?: string }>();
  const [userRegion, setUserRegion] = useState<GardenRegion | null>(null);
  const [locationStatus, setLocationStatus] = useState('Localizando...');

  const activeRegion = userRegion ?? saoPauloRegion;

  useEffect(() => {
    const latitude = Number(params.latitude);
    const longitude = Number(params.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    setUserRegion({
      latitude,
      longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    });
    setLocationStatus('Localizacao selecionada');
  }, [params.latitude, params.longitude]);

  useEffect(() => {
    let isMounted = true;

    async function loadUserLocation() {
      if (params.latitude && params.longitude) {
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!isMounted) {
        return;
      }

      if (status !== Location.PermissionStatus.GRANTED) {
        setLocationStatus('Permissao de localizacao negada');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!isMounted) {
        return;
      }

      setUserRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
      setLocationStatus('Localizacao atual');
    }

    loadUserLocation();

    return () => {
      isMounted = false;
    };
  }, [params.latitude, params.longitude]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
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

        <View style={[styles.weatherCard, { backgroundColor: colors.weather }]}>
          <View style={styles.weatherTop}>
            <View style={styles.weatherCopy}>
              <Text style={[styles.skyTitle, { color: colors.text }]}>Ceu Limpo</Text>
              <Text style={[styles.location, { color: colors.muted }]}>
                <Ionicons name="location-outline" size={13} color={colors.muted} /> {locationStatus}
              </Text>
              <Text style={[styles.coords, { color: colors.muted }]}>
                Lat: {activeRegion.latitude.toFixed(4)} / Long: {activeRegion.longitude.toFixed(4)}
              </Text>
            </View>
            <Text style={[styles.temperature, { color: colors.tint }]}>24°</Text>
          </View>

          <View style={[styles.statsPanel, { backgroundColor: colors.surfaceStrong }]}>
            {weatherStats.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.statItem,
                  index < weatherStats.length - 1 && {
                    borderRightWidth: 1,
                    borderRightColor: colors.border,
                  },
                ]}>
                <Ionicons name={item.icon} size={24} color={colors.tint} />
                <Text style={[styles.statLabel, { color: colors.muted }]}>{item.label}</Text>
                <Text style={[styles.statValue, { color: colors.textStrong }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.helpCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.helpIconBox, { backgroundColor: colors.iconBox }]}>
            <Ionicons name="chatbubbles-outline" size={28} color={colors.tint} />
          </View>
          <View style={styles.helpText}>
            <Text style={[styles.helpTitle, { color: colors.text }]}>Precisa de Ajuda?</Text>
            <Text style={[styles.helpBody, { color: colors.muted }]}>
              Converse com o Chat IA para receber orientacoes sobre sua horta.
            </Text>
          </View>
          <Pressable
            style={[styles.helpButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/chat-ia')}>
            <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
            <Text style={styles.helpButtonText}>Abrir Chat IA</Text>
          </Pressable>
        </View>

        <HomeMap fallbackRegion={saoPauloRegion} userRegion={userRegion} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    gap: 24,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    marginHorizontal: -24,
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
  weatherCard: {
    minHeight: 258,
    borderRadius: 24,
    padding: 17,
    justifyContent: 'space-between',
    boxShadow: '0 15px 22px rgba(47, 86, 73, 0.16)',
  },
  weatherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  weatherCopy: {
    flex: 1,
  },
  skyTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  location: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '700',
  },
  coords: {
    marginTop: 5,
    fontSize: 12,
    fontStyle: 'italic',
  },
  temperature: {
    fontSize: 61,
    lineHeight: 68,
    fontWeight: '900',
  },
  statsPanel: {
    minHeight: 96,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  helpCard: {
    borderRadius: 14,
    padding: 17,
    gap: 14,
  },
  helpIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    gap: 5,
  },
  helpTitle: {
    fontSize: 21,
    fontWeight: '800',
  },
  helpBody: {
    fontSize: 16,
    lineHeight: 24,
  },
  helpButton: {
    minHeight: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
