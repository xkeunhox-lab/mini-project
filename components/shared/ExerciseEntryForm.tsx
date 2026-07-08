"use client";

import { useState } from "react";
import type { SetEntry } from "@/lib/types";

interface ExerciseEntryFormProps {
  initialName?: string;
  initialSets?: SetEntry[];
  allExerciseNames: string[];
  confirmLabel: string;
  datalistId: string;
  onCancel: () => void;
  onConfirm: (name: string, sets: SetEntry[]) => void;
}

const DEFAULT_SETS: SetEntry[] = [
  { weight: 0, reps: 8 },
  { weight: 0, reps: 8 },
  { weight: 0, reps: 8 },
];

export default function ExerciseEntryForm({
  initialName = "",
  initialSets,
  allExerciseNames,
  confirmLabel,
  datalistId,
  onCancel,
  onConfirm,
}: ExerciseEntryFormProps) {
  const [name, setName] = useState(initialName);
  const [sets, setSets] = useState<SetEntry[]>(
    initialSets && initialSets.length > 0
      ? initialSets.map((s) => ({ weight: s.weight, reps: s.reps }))
      : DEFAULT_SETS.map((s) => ({ ...s }))
  );

  const [countText, setCountText] = useState(String(sets.length));

  function applyCount(count: number) {
    setSets((prev) => {
      if (count < prev.length) return prev.slice(0, count);
      if (count > prev.length) {
        const last = prev[prev.length - 1] ?? { weight: 0, reps: 8 };
        const additions: SetEntry[] = Array.from(
          { length: count - prev.length },
          () => ({ weight: last.weight, reps: last.reps })
        );
        return [...prev, ...additions];
      }
      return prev;
    });
  }

  function handleCountChange(raw: string) {
    setCountText(raw);
    if (raw === "") return;
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 1) return;
    applyCount(parsed);
  }

  function handleCountBlur() {
    const parsed = parseInt(countText, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      const fallback = Math.max(1, sets.length);
      setCountText(String(fallback));
      applyCount(fallback);
    } else {
      setCountText(String(parsed));
    }
  }

  function handleSetChange(idx: number, field: "weight" | "reps", value: number) {
    setSets((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  }

  function handleConfirm() {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("운동명을 입력해주세요");
      return;
    }
    onConfirm(
      trimmed,
      sets.map((s) => ({ weight: s.weight, reps: s.reps }))
    );
  }

  return (
    <div className="space-y-3 rounded-lg bg-neutral-100 p-4">
      <div className="text-sm font-bold text-neutral-900">운동 정보</div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
          운동 종목
        </label>
        <input
          type="text"
          list={datalistId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 랫 풀 다운"
          className="w-full rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-900"
        />
        <datalist id={datalistId}>
          {allExerciseNames.map((n) => (
            <option value={n} key={n} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
          세트 수
        </label>
        <input
          type="number"
          min={1}
          value={countText}
          onChange={(e) => handleCountChange(e.target.value)}
          onBlur={handleCountBlur}
          className="w-full rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-900"
        />
      </div>

      <div className="space-y-2">
        {sets.map((set, idx) => (
          <SetRow
            key={idx}
            label={`세트${idx + 1}`}
            set={set}
            onWeightChange={(v) => handleSetChange(idx, "weight", v)}
            onRepsChange={(v) => handleSetChange(idx, "reps", v)}
          />
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-neutral-300 py-2.5 text-sm font-semibold text-neutral-900"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-neutral-100"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

function SetRow({
  label,
  set,
  onWeightChange,
  onRepsChange,
}: {
  label: string;
  set: SetEntry;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
}) {
  const [weightText, setWeightText] = useState(String(set.weight));
  const [repsText, setRepsText] = useState(String(set.reps));

  function handleWeightChange(raw: string) {
    setWeightText(raw);
    if (raw === "") return;
    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed)) onWeightChange(parsed);
  }

  function handleWeightBlur() {
    const parsed = parseFloat(weightText);
    if (weightText === "" || Number.isNaN(parsed)) {
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
    const parsed = parseInt(repsText, 10);
    if (repsText === "" || Number.isNaN(parsed)) {
      setRepsText(String(set.reps));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="min-w-[44px] text-xs text-neutral-600">{label}</span>
      <input
        type="number"
        step={1.25}
        min={0}
        value={weightText}
        onChange={(e) => handleWeightChange(e.target.value)}
        onBlur={handleWeightBlur}
        className="w-16 rounded-md border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-sm text-neutral-900"
      />
      <span className="text-xs font-semibold text-neutral-600">kg</span>
      <input
        type="number"
        min={0}
        value={repsText}
        onChange={(e) => handleRepsChange(e.target.value)}
        onBlur={handleRepsBlur}
        className="w-16 rounded-md border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-sm text-neutral-900"
      />
      <span className="text-xs font-semibold text-neutral-600">회</span>
    </div>
  );
}
