export default function Header() {
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
        <p className="text-xs text-neutral-600">
          편리하게 기록하고 효율적으로 관리하기
        </p>
      </div>
    </div>
  );
}
