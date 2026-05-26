import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const weatherStats = [
  { icon: 'rainy-outline', label: 'Chuva', value: '12%' },
  { icon: 'water-outline', label: 'Umidade', value: '65%' },
  { icon: 'reorder-three-outline', label: 'Vento', value: '8 km/h' },
] as const;

export default function Home() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.brandGroup}>
            <Image source={require('@/assets/images/icon.png')} style={styles.avatar} />
            <Text style={styles.brand}>Garden Path</Text>
          </View>
          <Ionicons name="sunny-outline" size={31} color="#07833B" />
        </View>

        <View style={styles.weatherCard}>
          <View style={styles.weatherTop}>
            <View style={styles.weatherCopy}>
              <Text style={styles.skyTitle}>Céu Limpo</Text>
              <Text style={styles.location}>
                <Ionicons name="location-outline" size={13} color="#567A82" /> São Paulo, BR
              </Text>
              <Text style={styles.coords}>Lat: -23.5505 / Long: -46.6333</Text>
            </View>
            <Text style={styles.temperature}>24°</Text>
          </View>

          <View style={styles.statsPanel}>
            {weatherStats.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.statItem,
                  index < weatherStats.length - 1 && styles.statDivider,
                ]}>
                <Ionicons name={item.icon} size={24} color="#07833B" />
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionTitleRow}>
          <Ionicons name="sparkles-outline" size={24} color="#07833B" />
          <Text style={styles.sectionTitle}>Dicas de Cultivo</Text>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.iconBox}>
            <Ionicons name="water-outline" size={25} color="#07833B" />
          </View>
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Ideal para Rega</Text>
            <Text style={styles.tipBody}>
              A temperatura moderada e umidade alta são perfeitas para hidratar suas
              suculentas hoje.
            </Text>
          </View>
        </View>

        <View style={[styles.tipCard, styles.warningCard]}>
          <View style={[styles.iconBox, styles.warningIconBox]}>
            <Ionicons name="sunny-outline" size={25} color="#5D514B" />
          </View>
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Proteja do Sol Direto</Text>
            <Text style={styles.tipBody}>
              O índice UV está subindo. Considere mover suas mudas sensíveis para a
              sombra entre 12h e 15h.
            </Text>
          </View>
        </View>

        <View style={styles.quickGrid}>
          <View style={[styles.quickCard, styles.blueCard]}>
            <Ionicons name="leaf-outline" size={33} color="#3D555A" />
            <View>
              <Text style={styles.quickTitle}>FERTILIZAÇÃO</Text>
              <Text style={styles.quickBody}>Bom momento para aplicar NPK líquido.</Text>
            </View>
          </View>

          <View style={[styles.quickCard, styles.grayCard]}>
            <Ionicons name="cut-outline" size={34} color="#3E4642" />
            <View>
              <Text style={styles.quickTitle}>PODA</Text>
              <Text style={styles.quickBody}>Evite podas drásticas com este vento.</Text>
            </View>
          </View>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapGrid}>
            {Array.from({ length: 8 }).map((_, index) => (
              <View key={`h-${index}`} style={[styles.mapLineH, { top: `${index * 13}%` }]} />
            ))}
            {Array.from({ length: 7 }).map((_, index) => (
              <View key={`v-${index}`} style={[styles.mapLineV, { left: `${index * 16}%` }]} />
            ))}
            {Array.from({ length: 52 }).map((_, index) => (
              <View
                key={`cell-${index}`}
                style={[
                  styles.cityCell,
                  {
                    left: `${7 + (index % 8) * 11}%`,
                    top: `${17 + Math.floor(index / 8) * 8}%`,
                    opacity: index % 3 === 0 ? 0.82 : 0.48,
                  },
                ]}
              />
            ))}
            {[18, 34, 48, 63, 76].map((left, index) => (
              <View
                key={`drop-${left}`}
                style={[styles.rainDot, { left: `${left}%`, top: `${27 + index * 9}%` }]}
              />
            ))}
          </View>

          <Pressable style={styles.mapButton}>
            <Ionicons name="map-outline" size={22} color="#07833B" />
            <Text style={styles.mapButtonText}>Ver Mapa de Precipitação</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAF7',
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
    borderBottomColor: '#EEF1ED',
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
    color: '#07833B',
    fontSize: 23,
    fontWeight: '800',
  },
  weatherCard: {
    minHeight: 258,
    borderRadius: 24,
    backgroundColor: '#CDEFFC',
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
    color: '#244D60',
    fontSize: 28,
    fontWeight: '800',
  },
  location: {
    marginTop: 5,
    color: '#567A82',
    fontSize: 14,
    fontWeight: '700',
  },
  coords: {
    marginTop: 5,
    color: '#67828B',
    fontSize: 12,
    fontStyle: 'italic',
  },
  temperature: {
    color: '#07833B',
    fontSize: 61,
    lineHeight: 68,
    fontWeight: '900',
  },
  statsPanel: {
    minHeight: 96,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.62)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(112, 134, 138, 0.18)',
  },
  statLabel: {
    color: '#5B6F72',
    fontSize: 12,
  },
  statValue: {
    color: '#222F2D',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#26332F',
    fontSize: 21,
    fontWeight: '700',
  },
  tipCard: {
    minHeight: 126,
    borderRadius: 14,
    backgroundColor: '#F2F4F1',
    padding: 17,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  warningCard: {
    backgroundColor: '#FFD7CA',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8EEE2',
  },
  warningIconBox: {
    backgroundColor: '#F4CFC4',
  },
  tipText: {
    flex: 1,
    gap: 6,
  },
  tipTitle: {
    color: '#3E4741',
    fontSize: 14,
    fontWeight: '800',
  },
  tipBody: {
    color: '#626861',
    fontSize: 16,
    lineHeight: 24,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 18,
  },
  quickCard: {
    flex: 1,
    minHeight: 160,
    borderRadius: 12,
    padding: 17,
    justifyContent: 'space-between',
  },
  blueCard: {
    backgroundColor: '#B9E8FF',
  },
  grayCard: {
    backgroundColor: '#E1E4E1',
  },
  quickTitle: {
    color: '#3D555A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 4,
  },
  quickBody: {
    color: '#42565B',
    fontSize: 16,
    lineHeight: 21,
  },
  mapCard: {
    height: 192,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#06342F',
    position: 'relative',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#073A35',
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
  cityCell: {
    position: 'absolute',
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C47A27',
  },
  rainDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(161, 229, 221, 0.85)',
    borderWidth: 1,
    borderColor: '#E2FFF7',
  },
  mapButton: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    minHeight: 42,
    borderRadius: 23,
    backgroundColor: '#EEF3F0',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapButtonText: {
    color: '#07833B',
    fontSize: 14,
    fontWeight: '800',
  },
});
