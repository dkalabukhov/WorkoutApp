import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { saveWorkout } from '../../../api/workouts';
import WorkoutEditor from '../../../components/WorkoutEditor';
import type { DraftExercise } from '../../../types/exercise';

export default function AddWorkoutScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { repeat } = useLocalSearchParams<{ repeat?: string }>();

  const [resetKey, setResetKey] = useState(0);
  const [initialExercises, setInitialExercises] = useState<DraftExercise[]>([]);

  useEffect(() => {
    if (!repeat) return;

    try {
      const parsed = JSON.parse(repeat) as Array<{
        name: string;
        sets: number;
        reps: number;
        weight: number | null;
      }>;

      const draft: DraftExercise[] = parsed.map((ex) => ({
        ...ex,
        tempId: `${Date.now()}-${Math.random()}`,
      }));

      setInitialExercises(draft);
      setResetKey((prev) => prev + 1);
    } catch (e) {
      console.error('Ошибка парсинга repeat:', e);
    }
  }, [repeat]);

  const handleSubmit = async (draft: DraftExercise[], dateStr: string) => {
    await saveWorkout(db, draft, dateStr);
    setInitialExercises([]);
    setResetKey((prev) => prev + 1);
    router.push('/list');
  };

  return (
    <WorkoutEditor
      title='Тренировка'
      submitLabel='Сохранить тренировку'
      onSubmit={handleSubmit}
      initialExercises={initialExercises}
      resetKey={resetKey}
    />
  );
}
