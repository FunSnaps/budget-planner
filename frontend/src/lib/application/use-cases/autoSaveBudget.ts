import type { IBudgetService } from '$lib/domain/ports/IBudgetService';
import type { BudgetState } from '$lib/domain/entities/Budget';
import { isSaving } from '$lib/application/stores/budgetStore';
import { toasts } from '$lib/application/stores/toastStore';

let timer: ReturnType<typeof setTimeout> | null = null;

export function autoSaveBudget(service: IBudgetService, delayMs = 500) {
  return function schedule(nextState: BudgetState): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      isSaving.set(true);
      try {
        await service.putActive(nextState);
      } catch {
        toasts.show('Auto-save failed. Check your connection.');
      } finally {
        isSaving.set(false);
      }
    }, delayMs);
  };
}

export function cancelAutoSave(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
