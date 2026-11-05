import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

async function initDatabase(db: any) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS workouts (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      date  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      name       TEXT    NOT NULL,
      sets       INTEGER NOT NULL,
      reps       INTEGER NOT NULL,
      weight     REAL,
      order_index INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );
  `);
}

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SQLiteProvider
        databaseName='workout.db'
        onInit={initDatabase}
        useSuspense
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='(tabs)' />
          <Stack.Screen
            name='workout/[id]'
            options={{
              presentation: 'card',
            }}
          />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size='large' color='#C6FF3D' />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0F0F12',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
