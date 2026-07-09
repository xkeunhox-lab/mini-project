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

// 조회(select)는 RLS(auth.uid() = user_id)가 자동으로 본인 데이터만 걸러주므로
// 여기서 별도로 user_id 필터를 걸지 않아도 된다. 생성(insert)만 user_id를 명시적으로 넣어줘야 한다.

export async function fetchRoutines(): Promise<Routine[]> {
  const { data, error } = await supabase
    .from("routines")
    .select("id, routine_name, exercises, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => rowToRoutine(row as RoutineRow));
}

export async function createRoutine(
  userId: string,
  routineName: string,
  exercises: ExerciseEntry[]
): Promise<Routine> {
  const { data, error } = await supabase
    .from("routines")
    .insert({ user_id: userId, routine_name: routineName, exercises })
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

export async function upsertRecord(userId: string, record: RecordEntry): Promise<void> {
  const { error } = await supabase.from("records").upsert(
    {
      user_id: userId,
      date: record.date,
      routine_id: record.routineId,
      exercises: record.exercises,
      memo: record.memo,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" }
  );

  if (error) throw error;
}

export async function deleteRecord(date: string): Promise<void> {
  const { error } = await supabase.from("records").delete().eq("date", date);
  if (error) throw error;
}

