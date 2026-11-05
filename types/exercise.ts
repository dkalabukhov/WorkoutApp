export type DraftExercise = {
  tempId: string;
  name: string;
  sets: number;
  reps: number;
  weight: number | null;
};

export type ExerciseFormData = Omit<DraftExercise, 'tempId'>;

export type SavedExercise = {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number | null;
};
