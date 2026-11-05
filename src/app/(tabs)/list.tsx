import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deleteWorkout, listWorkouts } from '../../../api/workouts';
import { colors, fontSize, radius, spacing } from '../../../constants/theme';
import type { SavedWorkout } from '../../../types/workout';
import { plural } from '../../../utils/plural';

export default function ListScreen() {
  const db = useSQLiteContext();
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);

  const loadData = useCallback(async () => {
    try {
      const data = await listWorkouts(db);
      setWorkouts(data);
    } catch (e) {
      console.error('Ошибка загрузки тренировок:', e);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleDelete = (id: number) => {
    Alert.alert('Удалить тренировку?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWorkout(db, id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadData();
          } catch (e) {
            Alert.alert('Ошибка', 'Не удалось удалить тренировку.');
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: SavedWorkout }) => {
    const totalExercises = item.exercises.length;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            <Text style={styles.subtitle}>
              {totalExercises}{' '}
              {plural(totalExercises, [
                'упражнение',
                'упражнения',
                'упражнений',
              ])}
            </Text>
          </View>
          <Pressable
            onPress={() => handleDelete(item.id)}
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && { opacity: 0.5 },
            ]}
            hitSlop={12}
          >
            <Ionicons name='trash-outline' size={20} color={colors.textDim} />
          </Pressable>
        </View>

        {totalExercises === 0 ? (
          <Text style={styles.emptyText}>Нет упражнений</Text>
        ) : (
          <View style={styles.exercisesList}>
            {item.exercises.map((ex, index) => (
              <View key={ex.id} style={styles.exerciseRow}>
                <Text style={styles.exerciseIndex}>{index + 1}.</Text>
                <Text style={styles.exerciseName} numberOfLines={1}>
                  {ex.name}
                </Text>
                <Text style={styles.exerciseDetails}>
                  {ex.sets}×{ex.reps} {ex.weight ? `${ex.weight}кг` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>История тренировок</Text>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name='calendar-outline' size={56} color={colors.border} />
            <Text style={styles.emptyTitle}>Пока нет тренировок</Text>
            <Text style={styles.emptyDesc}>
              Сохраните первую тренировку на вкладке «Добавить»
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '700' },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  date: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  exercisesList: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseIndex: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    width: 20,
  },
  exerciseName: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  exerciseDetails: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  emptyDesc: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    maxWidth: 250,
  },
});
