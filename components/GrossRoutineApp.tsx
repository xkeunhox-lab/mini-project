"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExerciseEntry, RecordEntry, RecordsMap, Routine } from "@/lib/types";
import { cloneExercises, collectAllExerciseNames } from "@/lib/utils";
import {
  createRoutine,
  deleteRecord,
  deleteRoutine,
  fetchRecords,
  fetchRoutines,
  incrementCompletions,
  updateRoutine,
  upsertRecord,
} from "@/lib/api";

import Header from "./Header";
import NavTabs, { type TabKey } from "./NavTabs";
import RoutineList from "./routines/RoutineList";
import RoutineFormModal from "./routines/RoutineFormModal";
import RoutineDetailModal from "./routines/RoutineDetailModal";
import CalendarView from "./record/CalendarView";
import RecordScreen from "./record/RecordScreen";

export default function GrossRoutineApp() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [records, setRecords] = useState<RecordsMap>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("routines");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());

  const [currentRecordDate, setCurrentRecordDate] = useState<string | null>(null);
  const [draft, setDraft] = useState<RecordEntry | null>(null);

  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [routineModalInitialExerciseIdx, setRoutineModalInitialExerciseIdx] =
    useState<number | null>(null);

  const [detailRoutineId, setDetailRoutineId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [routinesData, recordsData] = await Promise.all([
          fetchRoutines(),
          fetchRecords(),
        ]);
        if (cancelled) return;
        setRoutines(routinesData);
        setRecords(recordsData);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          const detail = e instanceof Error ? e.message : String(e);
          setErrorMsg(
            `데이터를 불러오지 못했습니다. Supabase에 routines/records 테이블이 아직 생성되지 않았거나(database/schema.sql 미실행), 연결 설정이 올바르지 않을 수 있습니다.\n(상세: ${detail})`
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const allExerciseNames = useMemo(
    () => collectAllExerciseNames(routines, records),
    [routines, records]
  );

  const detailRoutine = useMemo(
    () => routines.find((r) => r.id === detailRoutineId) ?? null,
    [routines, detailRoutineId]
  );

  function handleAddRoutineClick() {
    setEditingRoutine(null);
    setRoutineModalInitialExerciseIdx(null);
    setRoutineModalOpen(true);
  }

  function handleRoutineCardClick(routine: Routine) {
    setDetailRoutineId(routine.id);
  }

  function handleCloseRoutineModal() {
    setRoutineModalOpen(false);
    setEditingRoutine(null);
    setRoutineModalInitialExerciseIdx(null);
  }

  async function handleSaveRoutine(name: string, exercises: ExerciseEntry[]) {
    try {
      if (editingRoutine) {
        await updateRoutine(editingRoutine.id, name, exercises);
        setRoutines((prev) =>
          prev.map((r) =>
            r.id === editingRoutine.id
              ? { ...r, routineName: name, exercises }
              : r
          )
        );
      } else {
        const created = await createRoutine(name, exercises);
        setRoutines((prev) => [...prev, created]);
      }
      handleCloseRoutineModal();
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  function handleDetailEditExercise(index: number) {
    if (!detailRoutine) return;
    setDetailRoutineId(null);
    setEditingRoutine(detailRoutine);
    setRoutineModalInitialExerciseIdx(index);
    setRoutineModalOpen(true);
  }

  async function handleDeleteRoutine() {
    if (!detailRoutineId) return;
    if (!confirm("이 루틴을 삭제하시겠습니까?")) return;
    try {
      await deleteRoutine(detailRoutineId);
      setRoutines((prev) => prev.filter((r) => r.id !== detailRoutineId));
      setDetailRoutineId(null);
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  function handlePrevMonth() {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function handleSelectDate(dateStr: string) {
    const saved = records[dateStr];
    setCurrentRecordDate(dateStr);
    setDraft(
      saved
        ? { ...saved, date: dateStr, exercises: cloneExercises(saved.exercises) }
        : { date: dateStr, routineId: null, exercises: [], memo: "" }
    );
  }

  function handleBackToCalendar() {
    setDraft(null);
    setCurrentRecordDate(null);
  }

  function handleUpdateDraft(updater: (prev: RecordEntry) => RecordEntry) {
    setDraft((prev) => (prev ? updater(prev) : prev));
  }

  async function handleSaveRecord() {
    if (!draft || !currentRecordDate) return;

    if (draft.exercises.length === 0) {
      alert("오늘의 운동을 1개 이상 추가해주세요");
      return;
    }

    const toSave: RecordEntry = { ...draft, date: currentRecordDate };

    try {
      await upsertRecord(toSave);
      setRecords((prev) => ({ ...prev, [currentRecordDate]: toSave }));

      // 누적 기록 횟수 증가는 부가 기능이므로, 실패하더라도 저장 자체는 이미
      // 성공한 것으로 처리하고 사용자 흐름을 막지 않는다.
      incrementCompletions().catch((e) =>
        console.error("누적 기록 횟수 증가에 실패했습니다:", e)
      );

      alert("저장되었습니다!");
      setDraft(null);
      setCurrentRecordDate(null);
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  async function handleDeleteRecordFromCalendar(dateStr: string) {
    if (!confirm("이 날짜의 운동 기록을 삭제하시겠습니까?")) return;
    try {
      await deleteRecord(dateStr);
      setRecords((prev) => {
        const next = { ...prev };
        delete next[dateStr];
        return next;
      });
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  async function handleAppendExerciseToRoutine(
    routineId: string,
    exercise: ExerciseEntry
  ) {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const updatedExercises = [...routine.exercises, exercise];
    try {
      await updateRoutine(routineId, routine.routineName, updatedExercises);
      setRoutines((prev) =>
        prev.map((r) =>
          r.id === routineId ? { ...r, exercises: updatedExercises } : r
        )
      );
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[900px] flex-col bg-surface">
      <Header />
      <NavTabs active={activeTab} onChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {loading ? (
          <div className="py-20 text-center text-sm text-neutral-600">
            불러오는 중...
          </div>
        ) : errorMsg ? (
          <div className="whitespace-pre-line px-4 py-20 text-center text-sm text-danger">
            {errorMsg}
          </div>
        ) : activeTab === "routines" ? (
          <RoutineList
            routines={routines}
            onAddClick={handleAddRoutineClick}
            onSelectRoutine={handleRoutineCardClick}
          />
        ) : draft && currentRecordDate ? (
          <RecordScreen
            dateStr={currentRecordDate}
            draft={draft}
            routines={routines}
            records={records}
            allExerciseNames={allExerciseNames}
            onBack={handleBackToCalendar}
            onSave={handleSaveRecord}
            onUpdateDraft={handleUpdateDraft}
            onAppendExerciseToRoutine={handleAppendExerciseToRoutine}
          />
        ) : (
          <CalendarView
            visibleMonth={visibleMonth}
            routines={routines}
            records={records}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSelectDate={handleSelectDate}
            onDeleteRecord={handleDeleteRecordFromCalendar}
          />
        )}
      </div>

      <RoutineFormModal
        open={routineModalOpen}
        routine={editingRoutine}
        allExerciseNames={allExerciseNames}
        initialEditExerciseIndex={routineModalInitialExerciseIdx}
        onClose={handleCloseRoutineModal}
        onSave={handleSaveRoutine}
      />

      <RoutineDetailModal
        open={!!detailRoutineId}
        routine={detailRoutine}
        onClose={() => setDetailRoutineId(null)}
        onDelete={handleDeleteRoutine}
        onEditExercise={handleDetailEditExercise}
      />
    </div>
  );
}
