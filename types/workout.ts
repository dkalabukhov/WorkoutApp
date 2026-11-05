import { SavedExercise } from './exercise';

export type SavedWorkout = {
  id: number;
  date: string;
  exercises: SavedExercise[];
};
