import type { IBudgetService } from '$lib/domain/ports/IBudgetService';
import type { Permission } from '$lib/domain/entities/Share';
import { toasts } from '$lib/application/stores/toastStore';

export async function shareBudget(
  service: IBudgetService,
  budgetId: string,
  permission: Permission
): Promise<string | null> {
  try {
    const share = await service.createShare(budgetId, permission);
    const url = `${window.location.origin}/share/${share.token}`;

    await navigator.clipboard.writeText(url);
    toasts.show('Share link copied to clipboard!');
    return url;
  } catch {
    toasts.show('Failed to create share link. Please try again.');
    return null;
  }
}
