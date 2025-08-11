import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, router } from 'expo-router';

export default function ModalScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <Text style={styles.title}>Captured</Text>
      {uri ? (
        <Image source={{ uri }} style={styles.preview} resizeMode="contain" />
      ) : (
        <Text>No image</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  preview: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  actions: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: {
    color: '#000',
    fontWeight: '600',
  },
});
