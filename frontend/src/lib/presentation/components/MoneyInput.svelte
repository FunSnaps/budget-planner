<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    parseMoney, formatMoney, formatMoneyLive, formatMoneyBlur, countSignificant, caretFor,
  } from '$lib/domain/money';

  export let value = 0;
  export let inputClass = '';
  export let placeholder = '0';
  export let ariaLabel: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ change: number }>();

  let input: HTMLInputElement;
  let text = value ? formatMoney(value) : '';

  // Follow outside changes (loading a saved budget, "use estimate") without clobbering
  // what is being typed: "30." and "30" are the same number, so the text is left alone.
  function syncFromValue(v: number) {
    if (parseMoney(text) !== (v || 0)) text = v ? formatMoney(v) : '';
  }
  $: syncFromValue(value);

  function onInput() {
    const typed = input.value;
    const caret = input.selectionStart ?? typed.length;
    const significant = countSignificant(typed.slice(0, caret));
    const expanded = /[km]\s*$/i.test(typed);

    const formatted = formatMoneyLive(typed);
    text = formatted;
    input.value = formatted;
    const pos = expanded ? formatted.length : caretFor(formatted, significant);
    input.setSelectionRange(pos, pos);

    dispatch('change', parseMoney(formatted));
  }

  function onBlur() {
    text = formatMoneyBlur(text);
  }

  // Up/Down nudge by £10, Shift by £100
  function onKeydown(e: KeyboardEvent) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const step = (e.shiftKey ? 100 : 10) * (e.key === 'ArrowUp' ? 1 : -1);
    const next = Math.max(0, Math.round((parseMoney(text) + step) * 100) / 100);
    text = next ? formatMoney(next) : '';
    dispatch('change', next);
  }
</script>

<input
  bind:this={input}
  class={inputClass}
  type="text"
  inputmode="decimal"
  autocomplete="off"
  spellcheck="false"
  {placeholder}
  aria-label={ariaLabel}
  value={text}
  on:input={onInput}
  on:blur={onBlur}
  on:keydown={onKeydown}
/>
