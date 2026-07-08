"use client";

import { useEffect, useState } from "react";
import type { ExerciseEntry, SetEntry } from "@/lib/types";
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
          <SetInputRow
            key={setIdx}
            label={`세트${setIdx + 1}`}
            set={set}
            onWeightChange={(v) => onUpdateSet(setIdx, "weight", v)}
            onRepsChange={(v) => onUpdateSet(setIdx, "reps", v)}
            onCompletedChange={(v) => onUpdateSet(setIdx, "completed", v)}
            onRemove={() => onRemoveSet(setIdx)}
          />
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

function SetInputRow({
  label,
  set,
  onWeightChange,
  onRepsChange,
  onCompletedChange,
  onRemove,
}: {
  label: string;
  set: SetEntry;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onCompletedChange: (value: boolean) => void;
  onRemove: () => void;
}) {
  const [weightText, setWeightText] = useState(String(set.weight));
  const [repsText, setRepsText] = useState(String(set.reps));

  useEffect(() => {
    setWeightText(String(set.weight));
  }, [set.weight]);

  useEffect(() => {
    setRepsText(String(set.reps));
  }, [set.reps]);

  function handleWeightChange(raw: string) {
    setWeightText(raw);
    if (raw === "") return;
    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed)) onWeightChange(parsed);
  }

  function handleWeightBlur() {
    if (weightText === "" || Number.isNaN(parseFloat(weightText))) {
      setWeightText(String(set.weight));
    }
  }

  function handleRepsChange(raw: string) {
    setRepsText(raw);
    if (raw === "") return;
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed)) onRepsChange(parsed);
  }

  function handleRepsBlur() {
    if (repsText === "" || Number.isNaN(parseInt(repsText, 10))) {
      setRepsText(String(set.reps));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        title="세트 완료"
        checked={!!set.completed}
        onChange={(e) => onCompletedChange(e.target.checked)}
        className="h-[18px] w-[18px] shrink-0 accent-brand"
      />
      <span className="min-w-[44px] text-xs text-neutral-600">{label}</span>
      <input
        type="number"
        step={1.25}
        value={weightText}
        onChange={(e) => handleWeightChange(e.target.value)}
        onBlur={handleWeightBlur}
        className="w-16 rounded-md border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-sm text-neutral-900"
      />
      <span className="text-xs font-semibold text-neutral-600">kg</span>
      <input
        type="number"
        value={repsText}
        onChange={(e) => handleRepsChange(e.target.value)}
        onBlur={handleRepsBlur}
        className="w-16 rounded-md border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-sm text-neutral-900"
      />
      <span className="text-xs font-semibold text-neutral-600">회</span>
      <button
        type="button"
        onClick={onRemove}
        className="h-[26px] w-[26px] shrink-0 rounded-md bg-neutral-300 text-base leading-none text-neutral-900 transition-colors hover:bg-danger hover:text-white"
      >
        −
      </button>
    </div>
  );
}
