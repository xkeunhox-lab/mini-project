"use client";

import { useMemo } from "react";
import type { RecordsMap, Routine } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";
import { getRoutineColor } from "@/lib/colors";
import Modal from "@/components/shared/Modal";
import { btnSecondary } from "@/components/shared/buttonStyles";

interface LoadHistoryModalProps {
  open: boolean;
  records: RecordsMap;
  routines: Routine[];
  excludeDate: string;
  onClose: () => void;
  onSelect: (dateStr: string) => void;
}

export default function LoadHistoryModal({
  open,
  records,
  routines,
  excludeDate,
  onClose,
  onSelect,
}: LoadHistoryModalProps) {
  const dates = useMemo(() => {
    return Object.keys(records)
      .filter((d) => d !== excludeDate && records[d].exercises.length > 0)
      .sort()
      .reverse();
  }, [records, excludeDate]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="🕐 이전 기록 불러오기"
      footer={
        <button type="button" onClick={onClose} className={btnSecondary}>
          취소
        </button>
      }
    >
      <div className="flex flex-col">
        {dates.length === 0 ? (
          <div className="p-3 text-center text-sm text-neutral-600">
            불러올 이전 기록이 없습니다
          </div>
        ) : (
          dates.map((dateStr) => {
            const record = records[dateStr];
            const routineIdx = record.routineId
              ? routines.findIndex((r) => r.id === record.routineId)
              : -1;
            const routine = routineIdx >= 0 ? routines[routineIdx] : null;
            const dateLabel = formatDateLabel(dateStr, {
              month: "long",
              day: "numeric",
              weekday: "short",
            });

            return (
              <div
                key={dateStr}
                onClick={() => onSelect(dateStr)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(dateStr);
                }}
                className="mb-2.5 cursor-pointer rounded-lg border border-neutral-200 bg-surface p-3 transition-colors last:mb-0 hover:bg-surface-hover"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-neutral-900">
                    {dateLabel}
                  </span>
                  {routine && (
                    <HistoryRoutineBadge
                      name={routine.routineName}
                      colorIndex={routineIdx}
                    />
                  )}
                </div>
                <div className="text-xs text-neutral-600">
                  {record.exercises.map((e) => e.exerciseName).join(", ")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}

function HistoryRoutineBadge({
  name,
  colorIndex,
}: {
  name: string;
  colorIndex: number;
}) {
  const color = getRoutineColor(colorIndex);
  return (
    <span
      className="shrink-0 whitespace-nowrap rounded px-2 py-1 text-[11px] font-bold"
      style={{
        background: color.from,
        color: color.darkText ? "#0B0D08" : "#FFFFFF",
      }}
    >
      {name}
    </span>
  );
}
