import type { IBudgetService } from '$lib/domain/ports/IBudgetService';
import type { BudgetState } from '$lib/domain/entities/Budget';
import { EMPTY_STATE } from '$lib/domain/entities/Budget';
import { state } from '$lib/application/stores/budgetStore';

const LEGACY_KEY = 'budget_planner_v1';
const MIGRATED_KEY = 'budget_planner_migrated';

interface LegacyItem { label: string; amt: number }
interface LegacyState {
  takeHome?: number;
  roleLabel?: string;
  annualSalary?: number;
  annualBonus?: number;
  needs?: LegacyItem[];
  wants?: LegacyItem[];
  savings?: LegacyItem[];
  oneOff?: LegacyItem[];
  bonus?: LegacyItem[];
}

function parseLegacy(raw: string): BudgetState | null {
  try {
    const parsed = JSON.parse(raw) as LegacyState;
    const mapItems = (items?: LegacyItem[]) =>
      (items ?? []).map((it) => ({ label: it.label ?? '', amount: it.amt ?? 0 }));

    return {
      takeHome:    parsed.takeHome    ?? 0,
      roleLabel:   parsed.roleLabel   ?? '',
      annualSalary: parsed.annualSalary ?? 0,
      annualBonus:  parsed.annualBonus  ?? 0,
      needs:   mapItems(parsed.needs),
      wants:   mapItems(parsed.wants),
      savings: mapItems(parsed.savings),
      oneOff:  mapItems(parsed.oneOff),
      bonus:   mapItems(parsed.bonus),
    };
  } catch {
    return null;
  }
}

export async function migrateLegacyData(service: IBudgetService): Promise<boolean> {
  if (typeof localStorage === 'undefined') return false;
  if (localStorage.getItem(MIGRATED_KEY)) return false;

  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) {
    localStorage.setItem(MIGRATED_KEY, '1');
    return false;
  }

  const legacyState = parseLegacy(raw);
  if (!legacyState) {
    localStorage.setItem(MIGRATED_KEY, '1');
    return false;
  }

  // Only migrate if the user has actually entered data
  const hasData = legacyState.takeHome > 0 || legacyState.needs.length > 0;
  if (!hasData) {
    localStorage.setItem(MIGRATED_KEY, '1');
    return false;
  }

  const budget = await service.putActive(legacyState);
  state.set(budget.state);
  localStorage.setItem(MIGRATED_KEY, '1');
  return true;
}

export { EMPTY_STATE };
