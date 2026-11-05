import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TestScreen() {
  const db = useSQLiteContext();
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const result = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table'",
      );
      setTables(result.map((r) => r.name));
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ SQLite подключён</Text>
      <Text style={styles.text}>Таблицы: {tables.join(', ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F12',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#C6FF3D',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  text: { color: '#FFFFFF', fontSize: 14, textAlign: 'center' },
});
