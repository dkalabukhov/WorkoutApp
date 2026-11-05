import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getWorkoutById, updateWorkout } from '../../../api/workouts';
import WorkoutEditor from '../../../components/WorkoutEditor';
import { colors, fontSize, spacing } from '../../../constants/theme';
import type { DraftExercise } from '../../../types/exercise';

export default function EditWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workoutId = Number(id);
  const db = useSQLiteContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [initialExercises, setInitialExercises] = useState<
    DraftExercise[] | null
  >(null);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const workout = await getWorkoutById(db, workoutId);
      if (!workout) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const draft: DraftExercise[] = workout.exercises.map((ex) => ({
        tempId: String(ex.id),
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
      }));

      const [y, m, d] = workout.date.split('-').map(Number);
      const date = new Date(y, m - 1, d);

      setInitialExercises(draft);
      setInitialDate(date);
      setLoading(false);
    })();
  }, [db, workoutId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size='large' />
      </View>
    );
  }

  if (notFound || !initialExercises || !initialDate) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Тренировка не найдена</Text>
      </View>
    );
  }

  const handleSubmit = async (draft: DraftExercise[], dateStr: string) => {
    await updateWorkout(db, workoutId, draft, dateStr);
    router.back();
  };

  return (
    <WorkoutEditor
      initialExercises={initialExercises}
      initialDate={initialDate}
      title='Редактирование'
      submitLabel='Сохранить изменения'
      onSubmit={handleSubmit}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    padding: spacing.xl,
    textAlign: 'center',
  },
});
