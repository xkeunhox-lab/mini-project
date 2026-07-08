"use client";

import type { RecordsMap, Routine } from "@/lib/types";
import { calcTotalVolume } from "@/lib/utils";
import { getRoutineColor } from "@/lib/colors";
import { cardBase } from "@/components/shared/buttonStyles";

interface CalendarViewProps {
  visibleMonth: Date;
  routines: Routine[];
  records: RecordsMap;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateStr: string) => void;
  onDeleteRecord: (dateStr: string) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarView({
  visibleMonth,
  routines,
  records,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onDeleteRecord,
}: CalendarViewProps) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
  const trailingCount = totalCells - startingDayOfWeek - daysInMonth;
  const today = new Date();

  return (
    <div className={cardBase}>
      <div className="overflow-hidden rounded-xl border border-neutral-300">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-surface p-4">
          <button
            type="button"
            onClick={onPrevMonth}
            className="rounded-md border border-neutral-300 bg-neutral-200 px-3 py-2 text-neutral-900 transition-colors hover:bg-surface-hover"
          >
            ◀
          </button>
          <div className="font-extrabold tracking-tight text-brand">
            {year}년 {month + 1}월
          </div>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-md border border-neutral-300 bg-neutral-200 px-3 py-2 text-neutral-900 transition-colors hover:bg-surface-hover"
          >
            ▶
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-neutral-300 p-px">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="bg-neutral-100 py-3 text-center text-xs font-semibold text-neutral-600"
            >
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-neutral-300 p-px">
          {Array.from({ length: startingDayOfWeek }, (_, i) => (
            <div
              key={`prev-${i}`}
              className="min-h-[80px] bg-neutral-100 p-2 text-xs text-neutral-500"
            >
              {prevMonthLastDay - startingDayOfWeek + i + 1}
            </div>
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = today.toDateString() === new Date(year, month, day).toDateString();
            const record = records[dateStr];
            const hasRecord = !!record;
            const routineIdx = record?.routineId
              ? routines.findIndex((r) => r.id === record.routineId)
              : -1;
            const routine = routineIdx >= 0 ? routines[routineIdx] : null;
            const color = routineIdx >= 0 ? getRoutineColor(routineIdx) : null;
            const totalVolume = record ? calcTotalVolume(record.exercises) : 0;

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                role="button"
                tabIndex={0}
                className={`flex min-h-[80px] cursor-pointer flex-col overflow-hidden bg-surface p-2 text-[11px] transition-colors hover:bg-surface-hover ${
                  isToday ? "border-2 border-brand bg-brand/10" : ""
                }`}
              >
                <div className="mb-1 font-semibold text-neutral-900">{day}</div>

                {hasRecord && (
                  <div className="mb-0.5 inline-block w-fit rounded-sm bg-brand px-1 py-0.5 text-[8px] font-bold text-neutral-100">
                    ✓
                  </div>
                )}

                {routine && color && (
                  <div
                    className="mt-0.5 flex items-center justify-between gap-1 truncate rounded-sm px-1 py-0.5 text-[9px] font-bold"
                    style={{
                      background: color.from,
                      color: color.darkText ? "#0B0D08" : "#FFFFFF",
                    }}
                  >
                    <span className="truncate">{routine.routineName}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecord(dateStr);
                      }}
                      className="shrink-0 cursor-pointer opacity-80 hover:opacity-100"
                    >
                      ✕
                    </span>
                  </div>
                )}

                {hasRecord && totalVolume > 0 && (
                  <div className="mt-0.5 truncate text-[8px] text-neutral-600">
                    총 {totalVolume.toLocaleString("ko-KR")}kg
                  </div>
                )}
              </div>
            );
          })}

          {Array.from({ length: trailingCount }, (_, i) => (
            <div
              key={`next-${i}`}
              className="min-h-[80px] bg-neutral-100 p-2 text-xs text-neutral-500"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
