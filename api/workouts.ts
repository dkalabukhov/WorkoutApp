import type { SQLiteDatabase } from 'expo-sqlite';
import type { DraftExercise, SavedExercise } from '../types/exercise';
import type { SavedWorkout } from '../types/workout';

export async function saveWorkout(
  db: SQLiteDatabase,
  exercises: DraftExercise[],
  date: string,
): Promise<number> {
  if (exercises.length === 0)
    throw new Error('Нельзя сохранить пустую тренировку');

  const result = await db.runAsync('INSERT INTO workouts (date) VALUES (?)', [
    date,
  ]);
  const workoutId = result.lastInsertRowId;

  await db.withTransactionAsync(async () => {
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await db.runAsync(
        'INSERT INTO exercises (workout_id, name, sets, reps, weight, order_index) VALUES (?, ?, ?, ?, ?, ?)',
        [workoutId, ex.name.trim(), ex.sets, ex.reps, ex.weight, i],
      );
    }
  });

  return workoutId;
}

export async function listWorkouts(
  db: SQLiteDatabase,
): Promise<SavedWorkout[]> {
  const rows = await db.getAllAsync<any>(`
    SELECT
      w.id as workout_id,
      w.date,
      e.id as exercise_id,
      e.name,
      e.sets,
      e.reps,
      e.weight
    FROM workouts w
    LEFT JOIN exercises e ON w.id = e.workout_id
    ORDER BY w.date DESC, w.id DESC, e.order_index ASC
  `);

  const workoutsMap = new Map<number, SavedWorkout>();

  for (const row of rows) {
    if (!workoutsMap.has(row.workout_id)) {
      workoutsMap.set(row.workout_id, {
        id: row.workout_id,
        date: row.date,
        exercises: [],
      });
    }
    if (row.exercise_id !== null) {
      workoutsMap.get(row.workout_id)!.exercises.push({
        id: row.exercise_id,
        name: row.name,
        sets: row.sets,
        reps: row.reps,
        weight: row.weight,
      });
    }
  }

  return Array.from(workoutsMap.values());
}

export async function getWorkoutById(
  db: SQLiteDatabase,
  id: number,
): Promise<SavedWorkout | null> {
  const workout = await db.getFirstAsync<{ id: number; date: string }>(
    'SELECT id, date FROM workouts WHERE id = ?',
    [id],
  );
  if (!workout) return null;

  const exercises = await db.getAllAsync<SavedExercise>(
    'SELECT id, name, sets, reps, weight FROM exercises WHERE workout_id = ? ORDER BY order_index ASC',
    [id],
  );

  return { id: workout.id, date: workout.date, exercises };
}

export async function updateWorkout(
  db: SQLiteDatabase,
  id: number,
  exercises: DraftExercise[],
  date: string,
): Promise<void> {
  if (exercises.length === 0)
    throw new Error('Нельзя сохранить пустую тренировку');

  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE workouts SET date = ? WHERE id = ?', [date, id]);
    await db.runAsync('DELETE FROM exercises WHERE workout_id = ?', [id]);

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await db.runAsync(
        'INSERT INTO exercises (workout_id, name, sets, reps, weight, order_index) VALUES (?, ?, ?, ?, ?, ?)',
        [id, ex.name.trim(), ex.sets, ex.reps, ex.weight, i],
      );
    }
  });
}

export async function deleteWorkout(
  db: SQLiteDatabase,
  id: number,
): Promise<void> {
  await db.runAsync('DELETE FROM workouts WHERE id = ?', [id]);
}
