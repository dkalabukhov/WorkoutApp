import type { SQLiteDatabase } from 'expo-sqlite';
import type { DraftExercise } from '../types/exercise';

export async function saveWorkout(
  db: SQLiteDatabase,
  exercises: DraftExercise[],
  date: string,
): Promise<number> {
  if (exercises.length === 0) {
    throw new Error('Нельзя сохранить пустую тренировку');
  }

  const result = await db.runAsync('INSERT INTO workouts (date) VALUES (?)', [
    date,
  ]);
  const workoutId = result.lastInsertRowId;

  await db.withTransactionAsync(async () => {
    for (const ex of exercises) {
      await db.runAsync(
        'INSERT INTO exercises (workout_id, name, sets, reps, weight) VALUES (?, ?, ?, ?, ?)',
        [workoutId, ex.name.trim(), ex.sets, ex.reps, ex.weight],
      );
    }
  });

  return workoutId;
}
