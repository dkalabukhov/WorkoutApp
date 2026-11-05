import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { saveWorkout } from '../../../api/workouts';
import WorkoutEditor from '../../../components/WorkoutEditor';
import type { DraftExercise } from '../../../types/exercise';

export default function AddWorkoutScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);

  const handleSubmit = async (draft: DraftExercise[], dateStr: string) => {
    await saveWorkout(db, draft, dateStr);
    setResetKey((prev) => prev + 1);
    router.push('/list');
  };

  return (
    <WorkoutEditor
      title='Тренировка'
      submitLabel='Сохранить тренировку'
      onSubmit={handleSubmit}
      resetKey={resetKey}
    />
  );
}
