export interface RoutineColor {
  from: string;
  to: string;
  darkText: boolean;
}

// 루틴 생성 순서(index)에 따라 순환 배정되는 6가지 색상.
// index 0(브랜드 그린)만 배경이 밝아서 다크 텍스트를 사용한다.
export const ROUTINE_COLORS: RoutineColor[] = [
  { from: "#18DB4E", to: "#0FA83C", darkText: true },
  { from: "#2F86EB", to: "#1657B0", darkText: false },
  { from: "#E23FA0", to: "#A01B6E", darkText: false },
  { from: "#1FB8A6", to: "#0B7F72", darkText: false },
  { from: "#FF6B35", to: "#C6431A", darkText: false },
  { from: "#8B5CF6", to: "#5B21B6", darkText: false },
];

export function getRoutineColor(index: number): RoutineColor {
  const safeIndex = ((index % ROUTINE_COLORS.length) + ROUTINE_COLORS.length) % ROUTINE_COLORS.length;
  return ROUTINE_COLORS[safeIndex];
}

export function routineGradient(index: number): string {
  const c = getRoutineColor(index);
  return `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`;
}

export function routineSolidColor(index: number): string {
  return getRoutineColor(index).from;
}
