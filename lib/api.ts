import { supabase } from "./supabaseClient";
import type { ExerciseEntry, RecordEntry, RecordsMap, Routine } from "./types";

interface RoutineRow {
  id: string;
  routine_name: string;
  exercises: ExerciseEntry[];
  created_at: string;
}

interface RecordRow {
  date: string;
  routine_id: string | null;
  exercises: ExerciseEntry[];
  memo: string | null;
}

function rowToRoutine(row: RoutineRow): Routine {
  return {
    id: row.id,
    routineName: row.routine_name,
    exercises: row.exercises ?? [],
    createdAt: row.created_at,
  };
}

function rowToRecord(row: RecordRow): RecordEntry {
  return {
    date: row.date,
    routineId: row.routine_id,
    exercises: row.exercises ?? [],
    memo: row.memo ?? "",
  };
}

export async function fetchRoutines(): Promise<Routine[]> {
  const { data, error } = await supabase
    .from("routines")
    .select("id, routine_name, exercises, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => rowToRoutine(row as RoutineRow));
}

export async function createRoutine(
  routineName: string,
  exercises: ExerciseEntry[]
): Promise<Routine> {
  const { data, error } = await supabase
    .from("routines")
    .insert({ routine_name: routineName, exercises })
    .select("id, routine_name, exercises, created_at")
    .single();

  if (error) throw error;
  return rowToRoutine(data as RoutineRow);
}

export async function updateRoutine(
  id: string,
  routineName: string,
  exercises: ExerciseEntry[]
): Promise<void> {
  const { error } = await supabase
    .from("routines")
    .update({ routine_name: routineName, exercises })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteRoutine(id: string): Promise<void> {
  const { error } = await supabase.from("routines").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchRecords(): Promise<RecordsMap> {
  const { data, error } = await supabase
    .from("records")
    .select("date, routine_id, exercises, memo");

  if (error) throw error;

  const map: RecordsMap = {};
  (data ?? []).forEach((row) => {
    const record = rowToRecord(row as RecordRow);
    map[record.date] = record;
  });
  return map;
}

export async function upsertRecord(record: RecordEntry): Promise<void> {
  const { error } = await supabase.from("records").upsert(
    {
      date: record.date,
      routine_id: record.routineId,
      exercises: record.exercises,
      memo: record.memo,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "date" }
  );

  if (error) throw error;
}

export async function deleteRecord(date: string): Promise<void> {
  const { error } = await supabase.from("records").delete().eq("date", date);
  if (error) throw error;
}

// ---- 누적 기록 횟수(app_stats) ----

export async function fetchTotalCompletions(): Promise<number> {
  const { data, error } = await supabase
    .from("app_stats")
    .select("total_completions")
    .eq("id", 1)
    .single();

  if (error) throw error;
  return (data?.total_completions as number | undefined) ?? 0;
}

// 기록 저장을 완료할 때마다 호출한다. 통계 증가는 저장 자체의 성패에 영향을 주지 않는
// 부가 동작이므로, 호출부에서는 실패를 무시해도 안전하도록 별도로 try/catch를 감싸서 사용한다.
export async function incrementCompletions(): Promise<number> {
  const { data, error } = await supabase.rpc("increment_completions");
  if (error) throw error;
  return data as number;
}
