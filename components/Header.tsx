"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchTotalCompletions } from "@/lib/api";

export default function Header() {
  const [totalCompletions, setTotalCompletions] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchTotalCompletions()
      .then((count) => {
        if (!cancelled) setTotalCompletions(count);
      })
      .catch((e) => console.error("누적 기록 횟수를 불러오지 못했습니다:", e));

    // app_stats 테이블 변경을 실시간 구독해서, 어느 브라우저에서 저장이 일어나든
    // 모든 접속자의 화면에 즉시 반영되도록 한다.
    const channel = supabase
      .channel("app_stats_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "app_stats" },
        (payload) => {
          const next = (payload.new as { total_completions?: number })
            ?.total_completions;
          if (typeof next === "number" && !cancelled) {
            setTotalCompletions(next);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative overflow-hidden border-b border-neutral-200 px-5 pb-7 pt-9 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 170% at 50% -40%, #1C2410 0%, rgba(11,13,8,0) 55%), linear-gradient(180deg, #12150C 0%, #0B0D08 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div className="relative">
        <div
          className="mb-2 font-display text-[34px] font-black tracking-tight text-brand"
          style={{ textShadow: "0 0 30px rgba(24, 219, 78, 0.35)" }}
        >
          GrossRoutine
        </div>
        <p className="mb-1 text-[15px] font-bold text-neutral-900">
          루틴 기반 운동 기록
        </p>
        <p className="mb-3 text-xs text-neutral-600">
          편리하게 기록하고 효율적으로 관리하기
        </p>

        {totalCompletions !== null && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
            누적 기록 {totalCompletions.toLocaleString("ko-KR")}회
          </div>
        )}
      </div>
    </div>
  );
}
