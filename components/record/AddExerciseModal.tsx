"use client";

import type { SetEntry } from "@/lib/types";
import Modal from "@/components/shared/Modal";
import ExerciseEntryForm from "@/components/shared/ExerciseEntryForm";

interface AddExerciseModalProps {
  open: boolean;
  allExerciseNames: string[];
  onClose: () => void;
  onConfirm: (name: string, sets: SetEntry[]) => void;
}

export default function AddExerciseModal({
  open,
  allExerciseNames,
  onClose,
  onConfirm,
}: AddExerciseModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="운동 정보">
      <ExerciseEntryForm
        key={open ? "open" : "closed"}
        allExerciseNames={allExerciseNames}
        confirmLabel="추가"
        datalistId="record-exercise-name-datalist"
        onCancel={onClose}
        onConfirm={onConfirm}
      />
    </Modal>
  );
}
