import type { ExerciseEntry, RecordsMap } from "./types";

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export function formatDateLabel(
  dateStr: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", options);
}

// "총 볼륨" = 그날 기록한 모든 세트의 무게를 단순 합산한 값 (횟수는 곱하지 않음)
export function calcTotalVolume(exercises: ExerciseEntry[]): number {
  return exercises.reduce(
    (sum, ex) =>
      sum + ex.sets.reduce((setSum, set) => setSum + (set.weight || 0), 0),
    0
  );
}

// 같은 루틴으로 과거에 기록한 이력 중 가장 최근 것을 찾는다.
export function findLastRecordForRoutine(
  records: RecordsMap,
  routineId: string,
  excludeDate?: string
) {
  const dates = Object.keys(records)
    .filter((d) => d !== excludeDate)
    .sort()
    .reverse();

  for (const dateStr of dates) {
    const record = records[dateStr];
    if (record.routineId === routineId && record.exercises.length > 0) {
      return record;
    }
  }
  return null;
}

// 루틴/기록 전체에서 등록된 모든 운동명을 모아 자동완성 후보로 사용한다.
export function collectAllExerciseNames(
  routines: { exercises: ExerciseEntry[] }[],
  records: RecordsMap
): string[] {
  const names = new Set<string>();
  routines.forEach((routine) => {
    routine.exercises.forEach((ex) => names.add(ex.exerciseName));
  });
  Object.values(records).forEach((record) => {
    record.exercises.forEach((ex) => names.add(ex.exerciseName));
  });
  return Array.from(names);
}

export function cloneExercises(exercises: ExerciseEntry[]): ExerciseEntry[] {
  return exercises.map((ex) => ({
    exerciseName: ex.exerciseName,
    sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps, completed: !!s.completed })),
  }));
}

// 완료 체크는 "오늘 실제로 했는지"를 나타내므로, 루틴/과거 기록을 불러올 때는 항상 초기화한다.
export function cloneExercisesResetCompleted(
  exercises: ExerciseEntry[]
): ExerciseEntry[] {
  return exercises.map((ex) => ({
    exerciseName: ex.exerciseName,
    sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps, completed: false })),
  }));
}
