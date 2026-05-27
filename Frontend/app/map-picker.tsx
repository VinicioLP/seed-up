import { useLocalSearchParams } from 'expo-router';

import { LocationPickerMap } from '@/components/location-picker-map';

const fallbackRegion = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapPicker() {
  const params = useLocalSearchParams<{ latitude?: string; longitude?: string }>();
  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);

  const initialRegion =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? {
          ...fallbackRegion,
          latitude,
          longitude,
        }
      : fallbackRegion;

  return <LocationPickerMap initialRegion={initialRegion} />;
}
