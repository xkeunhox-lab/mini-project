"use client";

export type TabKey = "routines" | "record";

interface NavTabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "routines", label: "📋 루틴 관리" },
  { key: "record", label: "📅 기록" },
];

export default function NavTabs({ active, onChange }: NavTabsProps) {
  return (
    <div className="flex border-b border-neutral-200 bg-surface">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex-1 border-b-[3px] px-4 py-4 text-sm font-semibold transition-colors ${
            active === tab.key
              ? "border-brand text-brand"
              : "border-transparent text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
