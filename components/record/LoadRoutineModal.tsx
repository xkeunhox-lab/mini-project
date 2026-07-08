"use client";

import type { Routine } from "@/lib/types";
import { getRoutineColor, routineGradient } from "@/lib/colors";
import Modal from "@/components/shared/Modal";
import { btnSecondary } from "@/components/shared/buttonStyles";

interface LoadRoutineModalProps {
  open: boolean;
  routines: Routine[];
  onClose: () => void;
  onSelect: (routineId: string) => void;
}

export default function LoadRoutineModal({
  open,
  routines,
  onClose,
  onSelect,
}: LoadRoutineModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="📂 루틴 불러오기"
      footer={
        <button type="button" onClick={onClose} className={btnSecondary}>
          취소
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {routines.length === 0 ? (
          <div className="p-3 text-center text-sm text-neutral-600">
            먼저 루틴을 생성해주세요
          </div>
        ) : (
          routines.map((routine, idx) => {
            const color = getRoutineColor(idx);
            return (
              <div
                key={routine.id}
                onClick={() => onSelect(routine.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    onSelect(routine.id);
                }}
                className="cursor-pointer rounded-xl p-4 transition-transform hover:-translate-y-0.5"
                style={{
                  background: routineGradient(idx),
                  color: color.darkText ? "#0B0D08" : "#FFFFFF",
                }}
              >
                <div className="mb-2 text-base font-bold">
                  {routine.routineName}
                </div>
                <div className="text-xs opacity-90">
                  {routine.exercises.map((e) => `• ${e.exerciseName}`).join("  ")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
