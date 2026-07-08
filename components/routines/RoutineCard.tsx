"use client";

import type { Routine } from "@/lib/types";
import { getRoutineColor, routineGradient } from "@/lib/colors";

interface RoutineCardProps {
  routine: Routine;
  colorIndex: number;
  onClick: () => void;
}

export default function RoutineCard({
  routine,
  colorIndex,
  onClick,
}: RoutineCardProps) {
  const color = getRoutineColor(colorIndex);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="cursor-pointer rounded-xl p-4 transition-transform hover:-translate-y-1 hover:shadow-lift"
      style={{
        background: routineGradient(colorIndex),
        color: color.darkText ? "#0B0D08" : "#FFFFFF",
      }}
    >
      <div className="mb-3 text-base font-bold">{routine.routineName}</div>
      <div className="max-h-16 space-y-1 overflow-y-auto text-xs opacity-90">
        {routine.exercises.map((ex, idx) => (
          <div key={idx}>• {ex.exerciseName}</div>
        ))}
      </div>
    </div>
  );
}
