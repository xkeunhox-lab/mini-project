"use client";

import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidthClassName = "max-w-lg",
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthClassName} max-h-[90vh] overflow-y-auto rounded-xl border border-neutral-200 bg-surface p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 border-b-2 border-neutral-300 pb-3 text-lg font-bold text-neutral-900">
          {title}
        </div>
        {children}
        {footer && <div className="mt-5 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
