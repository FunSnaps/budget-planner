import { writable } from 'svelte/store';

export interface Toast {
  id: number;
  message: string;
  undoFn?: () => void;
}

let nextId = 0;

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function show(message: string, undoFn?: () => void, durationMs = 4000): void {
    const id = ++nextId;
    update((toasts) => [...toasts, { id, message, undoFn }]);
    setTimeout(() => dismiss(id), durationMs);
  }

  function dismiss(id: number): void {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  return { subscribe, show, dismiss };
}

export const toasts = createToastStore();
