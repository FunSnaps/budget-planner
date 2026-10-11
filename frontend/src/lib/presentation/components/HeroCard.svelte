<script lang="ts">
  import { state } from '$lib/application/stores/budgetStore';
  import { fmt, annualFromMonthly, estimateTakeHome, monthlyFromAnnual } from '$lib/domain/planner';
  import { CATS } from '$lib/domain/planner';
  import { totals } from '$lib/application/stores/budgetStore';

  function onTakeHomeInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    state.update((s) => ({ ...s, takeHome: val }));
  }

  function onRoleLabelInput(e: Event) {
    const val = (e.target as HTMLInputElement).value.slice(0, 80);
    state.update((s) => ({ ...s, roleLabel: val }));
  }

  function onSalaryInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    state.update((s) => ({ ...s, annualSalary: val }));
  }

  function onBonusInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    state.update((s) => ({ ...s, annualBonus: val }));
  }

  function fillFromSalary() {
    state.update((s) => ({
      ...s,
      takeHome: Math.round(monthlyFromAnnual(estimateTakeHome(s.annualSalary))),
    }));
  }
</script>

<div class="card hero">
  <input
    class="cap-input"
    placeholder="Role / label (optional)"
    value={$state.roleLabel}
    on:input={onRoleLabelInput}
    maxlength="80"
  />

  <p class="hero-label">Monthly take-home</p>
  <div class="hero-row">
    <div class="hero-input-wrap">
      <span class="cur">£</span>
      <input
        class="hero-take-home"
        type="number"
        min="0"
        step="1"
        value={$state.takeHome || ''}
        on:input={onTakeHomeInput}
        placeholder="0"
      />
    </div>
    {#if $state.annualSalary}
      <span class="hero-annual">
        est. <strong>{fmt(annualFromMonthly($state.takeHome))}</strong> / yr
      </span>
    {/if}
  </div>

  <div class="hero-split">
    {#each CATS as cat}
      <div class="hero-split-cell">
        <div class="k">
          <span class="dot" style="background:{cat.color}"></span>
          {cat.label}
        </div>
        <div class="v num">{fmt($totals[cat.key])}</div>
      </div>
    {/each}
  </div>
</div>
