import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.center}>
        <Text style={styles.title}>Список тренировок</Text>
        <Text style={styles.subtitle}>Здесь будет список</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F12' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#8E8E96', fontSize: 14 },
});
