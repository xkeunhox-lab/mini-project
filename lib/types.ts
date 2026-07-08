export interface SetEntry {
  weight: number;
  reps: number;
  completed?: boolean;
}

export interface ExerciseEntry {
  exerciseName: string;
  sets: SetEntry[];
}

export interface Routine {
  id: string;
  routineName: string;
  exercises: ExerciseEntry[];
  createdAt: string;
}

export interface RecordEntry {
  date: string;
  routineId: string | null;
  exercises: ExerciseEntry[];
  memo: string;
}

export type RecordsMap = Record<string, RecordEntry>;
