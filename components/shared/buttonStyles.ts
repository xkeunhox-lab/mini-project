// 디자인 시스템 컬러 토큰 기준 공용 버튼 스타일.
// success는 기능명세서 7.2에 따라 primary(브랜드 그린)와 동일한 색을 사용한다.

export const btnPrimary =
  "rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-brand-dark disabled:opacity-50";

export const btnSuccess = btnPrimary;

export const btnSecondary =
  "rounded-lg bg-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-400";

export const btnInfo =
  "rounded-lg bg-info px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#226DC2]";

export const btnDangerSmall =
  "rounded-md bg-danger px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#E13E35]";

export const btnDanger =
  "rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E13E35]";

export const cardBase =
  "rounded-xl border border-neutral-200 bg-surface p-5 shadow-card";
