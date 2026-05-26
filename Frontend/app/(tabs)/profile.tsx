import { StyleSheet, Text, View } from 'react-native';

export default function Profile() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAF7',
  },
  title: {
    color: '#26332F',
    fontSize: 24,
    fontWeight: '700',
  },
});
