"use client";

import type { Routine } from "@/lib/types";
import RoutineCard from "./RoutineCard";
import { cardBase } from "@/components/shared/buttonStyles";

interface RoutineListProps {
  routines: Routine[];
  onAddClick: () => void;
  onSelectRoutine: (routine: Routine) => void;
}

export default function RoutineList({
  routines,
  onAddClick,
  onSelectRoutine,
}: RoutineListProps) {
  return (
    <div className={cardBase}>
      <div className="mb-4 text-base font-bold text-neutral-900">
        🏋️ 나만의 루틴
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        <div
          onClick={onAddClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onAddClick();
          }}
          className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-400 bg-neutral-100 transition-colors hover:border-brand hover:bg-brand/5"
        >
          <div className="text-3xl text-brand">➕</div>
          <div className="mt-2 text-sm font-semibold text-neutral-600">
            루틴 추가
          </div>
        </div>

        {routines.map((routine, idx) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            colorIndex={idx}
            onClick={() => onSelectRoutine(routine)}
          />
        ))}
      </div>
    </div>
  );
}
