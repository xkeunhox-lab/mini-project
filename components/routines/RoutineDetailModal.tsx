"use client";

import type { Routine } from "@/lib/types";
import Modal from "@/components/shared/Modal";
import { btnDanger, btnSecondary } from "@/components/shared/buttonStyles";

interface RoutineDetailModalProps {
  open: boolean;
  routine: Routine | null;
  onClose: () => void;
  onDelete: () => void;
  onEditExercise: (index: number) => void;
}

export default function RoutineDetailModal({
  open,
  routine,
  onClose,
  onDelete,
  onEditExercise,
}: RoutineDetailModalProps) {
  if (!routine) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={routine.routineName}
      footer={
        <>
          <button
            type="button"
            onClick={onDelete}
            className={`${btnDanger} mr-auto`}
          >
            🗑️ 삭제
          </button>
          <button type="button" onClick={onClose} className={btnSecondary}>
            닫기
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {routine.exercises.map((ex, idx) => (
          <div
            key={idx}
            onClick={() => onEditExercise(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onEditExercise(idx);
            }}
            className="cursor-pointer rounded-lg bg-neutral-100 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-neutral-600">
                {ex.exerciseName}
              </div>
              <div className="text-sm text-neutral-900">
                {ex.sets.length}세트
              </div>
            </div>
            <div className="mt-2 text-[11px] text-neutral-600">
              {ex.sets
                .map((s, i) => `세트${i + 1}: ${s.weight}kg × ${s.reps}회`)
                .join(" | ")}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
