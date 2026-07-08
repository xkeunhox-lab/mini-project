"use client";

import type { ExerciseEntry } from "@/lib/types";
import { btnDangerSmall } from "@/components/shared/buttonStyles";

interface ExerciseItemProps {
  exercise: ExerciseEntry;
  onUpdateSet: (
    setIdx: number,
    field: "weight" | "reps" | "completed",
    value: number | boolean
  ) => void;
  onAddSet: () => void;
  onRemoveSet: (setIdx: number) => void;
  onDeleteExercise: () => void;
}

export default function ExerciseItem({
  exercise,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onDeleteExercise,
}: ExerciseItemProps) {
  return (
    <div className="mb-3 rounded-lg border-l-4 border-brand bg-neutral-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-semibold text-neutral-900">
          {exercise.exerciseName}
        </div>
        <button
          type="button"
          onClick={onDeleteExercise}
          className={btnDangerSmall}
        >
          삭제
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {exercise.sets.map((set, setIdx) => (
          <div key={setIdx} className="flex items-center gap-2">
            <input
              type="checkbox"
              title="세트 완료"
              checked={!!set.completed}
              onChange={(e) =>
                onUpdateSet(setIdx, "completed", e.target.checked)
              }
              className="h-[18px] w-[18px] shrink-0 accent-brand"
            />
            <span className="min-w-[44px] text-xs text-neutral-600">
              세트{setIdx + 1}
            </span>
            <input
              type="number"
              step={1.25}
              value={set.weight}
              onChange={(e) =>
                onUpdateSet(setIdx, "weight", parseFloat(e.target.value) || 0)
              }
              className="w-16 rounded-md border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-sm text-neutral-900"
            />
            <span className="text-xs font-semibold text-neutral-600">kg</span>
            <input
              type="number"
              value={set.reps}
              onChange={(e) =>
                onUpdateSet(setIdx, "reps", parseInt(e.target.value, 10) || 0)
              }
              className="w-16 rounded-md border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-sm text-neutral-900"
            />
            <span className="text-xs font-semibold text-neutral-600">회</span>
            <button
              type="button"
              onClick={() => onRemoveSet(setIdx)}
              className="h-[26px] w-[26px] shrink-0 rounded-md bg-neutral-300 text-base leading-none text-neutral-900 transition-colors hover:bg-danger hover:text-white"
            >
              −
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSet}
        className="mt-2 inline-block rounded-lg border border-dashed border-neutral-400 bg-neutral-200 px-3.5 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-surface-hover"
      >
        + 세트 추가
      </button>
    </div>
  );
}
