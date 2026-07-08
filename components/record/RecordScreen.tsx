"use client";

import { useState } from "react";
import type { ExerciseEntry, RecordEntry, RecordsMap, Routine, SetEntry } from "@/lib/types";
import { cloneExercisesResetCompleted, findLastRecordForRoutine } from "@/lib/utils";
import ExerciseItem from "./ExerciseItem";
import LoadRoutineModal from "./LoadRoutineModal";
import LoadHistoryModal from "./LoadHistoryModal";
import AddExerciseModal from "./AddExerciseModal";
import { btnInfo, btnPrimary, btnSecondary, btnSuccess, cardBase } from "@/components/shared/buttonStyles";

type ActiveModal = "loadRoutine" | "loadHistory" | "addExercise" | null;

interface RecordScreenProps {
  dateStr: string;
  draft: RecordEntry;
  routines: Routine[];
  records: RecordsMap;
  allExerciseNames: string[];
  onBack: () => void;
  onSave: () => void;
  onUpdateDraft: (updater: (prev: RecordEntry) => RecordEntry) => void;
  onAppendExerciseToRoutine: (routineId: string, exercise: ExerciseEntry) => void;
}

export default function RecordScreen({
  dateStr,
  draft,
  routines,
  records,
  allExerciseNames,
  onBack,
  onSave,
  onUpdateDraft,
  onAppendExerciseToRoutine,
}: RecordScreenProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const dateFormatted = new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  function handleLoadRoutineSelect(routineId: string) {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const lastRecord = findLastRecordForRoutine(records, routineId, dateStr);
    const merged: ExerciseEntry[] = routine.exercises.map((ex) => {
      const lastEx = lastRecord?.exercises.find(
        (e) => e.exerciseName === ex.exerciseName
      );
      const sourceSets = lastEx ? lastEx.sets : ex.sets;
      return {
        exerciseName: ex.exerciseName,
        sets: sourceSets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          completed: false,
        })),
      };
    });

    onUpdateDraft((prev) => ({ ...prev, routineId, exercises: merged }));
    setActiveModal(null);
  }

  function handleLoadHistorySelect(historyDateStr: string) {
    const record = records[historyDateStr];
    if (!record) return;

    onUpdateDraft((prev) => ({
      ...prev,
      routineId: record.routineId,
      exercises: cloneExercisesResetCompleted(record.exercises),
    }));
    setActiveModal(null);
  }

  function handleAddExerciseConfirm(name: string, sets: SetEntry[]) {
    const newExercise: ExerciseEntry = {
      exerciseName: name,
      sets: sets.map((s) => ({ ...s, completed: false })),
    };

    onUpdateDraft((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
    setActiveModal(null);

    if (draft.routineId) {
      const routine = routines.find((r) => r.id === draft.routineId);
      if (routine && confirm("루틴에도 추가할까요?")) {
        onAppendExerciseToRoutine(draft.routineId, { exerciseName: name, sets });
        alert("루틴에 추가되었습니다");
      }
    }
  }

  function handleUpdateSet(
    exIdx: number,
    setIdx: number,
    field: "weight" | "reps" | "completed",
    value: number | boolean
  ) {
    onUpdateDraft((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => {
        if (i !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, j) => {
            if (j !== setIdx) return s;
            const updated: SetEntry = { ...s };
            if (field === "weight") updated.weight = value as number;
            else if (field === "reps") updated.reps = value as number;
            else updated.completed = value as boolean;
            return updated;
          }),
        };
      }),
    }));
  }

  function handleAddSet(exIdx: number) {
    onUpdateDraft((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => {
        if (i !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1] ?? { weight: 0, reps: 8 };
        return {
          ...ex,
          sets: [
            ...ex.sets,
            { weight: last.weight, reps: last.reps, completed: false },
          ],
        };
      }),
    }));
  }

  function handleRemoveSet(exIdx: number, setIdx: number) {
    onUpdateDraft((prev) => {
      const target = prev.exercises[exIdx];
      if (target.sets.length <= 1) {
        alert("최소 1개의 세트가 필요합니다");
        return prev;
      }
      return {
        ...prev,
        exercises: prev.exercises.map((ex, i) =>
          i !== exIdx
            ? ex
            : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) }
        ),
      };
    });
  }

  function handleDeleteExercise(exIdx: number) {
    if (!confirm("운동을 삭제하시겠습니까?")) return;
    onUpdateDraft((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== exIdx),
    }));
  }

  function handleMemoChange(value: string) {
    onUpdateDraft((prev) => ({ ...prev, memo: value }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cardBase}>
        <div className="mb-5 flex items-center justify-between">
          <div className="text-lg font-bold text-neutral-900">
            {dateFormatted}
          </div>
          <button type="button" onClick={onBack} className={btnSecondary}>
            ← 돌아가기
          </button>
        </div>

        <div className="mb-4 text-base font-bold text-neutral-900">
          📝 오늘의 운동
        </div>

        <div>
          {draft.exercises.length === 0 ? (
            <div className="py-5 text-center text-sm text-neutral-600">
              아직 운동을 추가하지 않았습니다.
            </div>
          ) : (
            draft.exercises.map((ex, idx) => (
              <ExerciseItem
                key={idx}
                exercise={ex}
                onUpdateSet={(setIdx, field, value) =>
                  handleUpdateSet(idx, setIdx, field, value)
                }
                onAddSet={() => handleAddSet(idx)}
                onRemoveSet={(setIdx) => handleRemoveSet(idx, setIdx)}
                onDeleteExercise={() => handleDeleteExercise(idx)}
              />
            ))
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveModal("loadRoutine")}
            className={btnSuccess}
          >
            📂 루틴 불러오기
          </button>
          <button
            type="button"
            onClick={() => setActiveModal("loadHistory")}
            className={btnInfo}
          >
            🕐 이전 기록 불러오기
          </button>
          <button
            type="button"
            onClick={() => setActiveModal("addExercise")}
            className={btnSecondary}
          >
            ➕ 운동 추가
          </button>
        </div>
      </div>

      <div className={cardBase}>
        <div className="mb-4 text-base font-bold text-neutral-900">
          📌 메모
        </div>
        <textarea
          value={draft.memo}
          onChange={(e) => handleMemoChange(e.target.value)}
          placeholder="오늘의 운동 컨디션을 메모해주세요."
          className="min-h-[100px] w-full rounded-lg border border-neutral-300 bg-neutral-100 p-3 text-sm text-neutral-900"
        />
      </div>

      <div className={cardBase}>
        <button
          type="button"
          onClick={onSave}
          className={`${btnPrimary} w-full py-3`}
        >
          💾 저장
        </button>
      </div>

      <LoadRoutineModal
        open={activeModal === "loadRoutine"}
        routines={routines}
        onClose={() => setActiveModal(null)}
        onSelect={handleLoadRoutineSelect}
      />
      <LoadHistoryModal
        open={activeModal === "loadHistory"}
        records={records}
        routines={routines}
        excludeDate={dateStr}
        onClose={() => setActiveModal(null)}
        onSelect={handleLoadHistorySelect}
      />
      <AddExerciseModal
        open={activeModal === "addExercise"}
        allExerciseNames={allExerciseNames}
        onClose={() => setActiveModal(null)}
        onConfirm={handleAddExerciseConfirm}
      />
    </div>
  );
}
