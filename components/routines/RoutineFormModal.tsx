"use client";

import { useEffect, useState } from "react";
import type { ExerciseEntry, Routine, SetEntry } from "@/lib/types";
import { cloneExercises } from "@/lib/utils";
import Modal from "@/components/shared/Modal";
import ExerciseEntryForm from "@/components/shared/ExerciseEntryForm";
import { btnPrimary, btnSecondary } from "@/components/shared/buttonStyles";

interface RoutineFormModalProps {
  open: boolean;
  routine: Routine | null; // null = 신규 생성
  allExerciseNames: string[];
  initialEditExerciseIndex?: number | null;
  onClose: () => void;
  onSave: (routineName: string, exercises: ExerciseEntry[]) => void;
}

export default function RoutineFormModal({
  open,
  routine,
  allExerciseNames,
  initialEditExerciseIndex = null,
  onClose,
  onSave,
}: RoutineFormModalProps) {
  const [routineName, setRoutineName] = useState("");
  const [tempExercises, setTempExercises] = useState<ExerciseEntry[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setRoutineName(routine?.routineName ?? "");
    setTempExercises(routine ? cloneExercises(routine.exercises) : []);

    if (initialEditExerciseIndex !== null && initialEditExerciseIndex !== undefined) {
      setEditingIndex(initialEditExerciseIndex);
      setFormOpen(true);
    } else {
      setEditingIndex(null);
      setFormOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, routine?.id, initialEditExerciseIndex]);

  function handleAddExerciseClick() {
    setEditingIndex(null);
    setFormOpen(true);
  }

  function handleEditExercise(idx: number) {
    setEditingIndex(idx);
    setFormOpen(true);
  }

  function handleRemoveExercise(idx: number) {
    if (!confirm("이 운동을 삭제하시겠습니까?")) return;
    setTempExercises((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleExerciseFormCancel() {
    setFormOpen(false);
    setEditingIndex(null);
  }

  function handleExerciseFormConfirm(name: string, sets: SetEntry[]) {
    setTempExercises((prev) => {
      if (editingIndex !== null) {
        return prev.map((ex, i) =>
          i === editingIndex ? { exerciseName: name, sets } : ex
        );
      }
      return [...prev, { exerciseName: name, sets }];
    });
    setFormOpen(false);
    setEditingIndex(null);
  }

  function handleSave() {
    const trimmed = routineName.trim();
    if (!trimmed) {
      alert("루틴명을 입력해주세요");
      return;
    }
    if (tempExercises.length === 0) {
      alert("최소 1개 이상의 운동을 추가해주세요");
      return;
    }
    onSave(trimmed, tempExercises);
  }

  const editingExercise =
    editingIndex !== null ? tempExercises[editingIndex] : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={routine ? "루틴 수정" : "루틴 생성"}
      footer={
        <>
          <button type="button" onClick={onClose} className={btnSecondary}>
            취소
          </button>
          <button type="button" onClick={handleSave} className={btnPrimary}>
            저장
          </button>
        </>
      }
    >
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
          루틴명
        </label>
        <input
          type="text"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder="예: 3분할 - 등운동"
          className="w-full rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-900"
        />
      </div>

      <div className="mb-4">
        <div className="mb-2 text-xs font-semibold text-neutral-700">
          📝 운동 종목
        </div>
        <div className="mb-3 max-h-52 space-y-2 overflow-y-auto rounded-lg bg-neutral-100 p-3">
          {tempExercises.length === 0 ? (
            <div className="p-3 text-center text-xs text-neutral-600">
              운동을 추가해주세요
            </div>
          ) : (
            tempExercises.map((ex, idx) => (
              <div
                key={idx}
                onClick={() => handleEditExercise(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleEditExercise(idx);
                }}
                className="flex cursor-pointer items-center justify-between rounded-md border border-neutral-200 bg-surface p-3"
              >
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-neutral-900">
                    {ex.exerciseName}
                  </div>
                  <div className="mt-0.5 text-[11px] text-neutral-600">
                    {ex.sets
                      .map((s, i) => `세트${i + 1}: ${s.weight}kg × ${s.reps}회`)
                      .join(" | ")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveExercise(idx);
                  }}
                  className="ml-2 shrink-0 rounded-md bg-danger px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#E13E35]"
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={handleAddExerciseClick}
            className={`${btnSecondary} w-full`}
          >
            ➕ 운동 추가
          </button>
        )}
      </div>

      {formOpen && (
        <ExerciseEntryForm
          key={editingIndex ?? "new"}
          initialName={editingExercise?.exerciseName}
          initialSets={editingExercise?.sets}
          allExerciseNames={allExerciseNames}
          confirmLabel={editingIndex !== null ? "수정" : "추가"}
          datalistId="exercise-name-datalist"
          onCancel={handleExerciseFormCancel}
          onConfirm={handleExerciseFormConfirm}
        />
      )}
    </Modal>
  );
}
