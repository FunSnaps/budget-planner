const MAX_INT_DIGITS = 9;
const MAX_VALUE = 999_999_999.99;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** 3000 -> "3,000", 3000.5 -> "3,000.5" */
export function formatMoney(n: number): string {
  return n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/**
 * Parse what a person typed into a number. Understands thousands separators, a leading £,
 * and k / m shorthand ("2.5k" = 2500, "1m" = 1000000). Anything unparseable is 0.
 */
export function parseMoney(text: string): number {
  const t = text.trim().toLowerCase().replace(/[£,\s]/g, '');
  const m = /^(\d*\.?\d*)([km])?$/.exec(t);
  if (!m || m[1] === '' || m[1] === '.') return 0;
  const mult = m[2] === 'k' ? 1_000 : m[2] === 'm' ? 1_000_000 : 1;
  return Math.min(round2(parseFloat(m[1]) * mult), MAX_VALUE);
}

/**
 * Format as the user types: strips junk, groups thousands, keeps at most 2 decimal places,
 * and keeps a trailing "." so "30." can be typed on the way to "30.5". Expands k / m shorthand.
 */
export function formatMoneyLive(raw: string): string {
  if (/^[\s£]*[\d,]*\.?\d*\s*[km]\s*$/i.test(raw)) {
    const n = parseMoney(raw);
    return n ? formatMoney(n) : '';
  }

  const cleaned = raw.replace(/[^\d.]/g, '');
  const dot = cleaned.indexOf('.');
  const intRaw = dot === -1 ? cleaned : cleaned.slice(0, dot);
  const dec = dot === -1 ? null : cleaned.slice(dot + 1).replace(/\./g, '').slice(0, 2);

  const int = intRaw.replace(/^0+(?=\d)/, '').slice(0, MAX_INT_DIGITS);
  if (int === '' && dec === null) return '';

  const grouped = (int || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec === null ? grouped : `${grouped}.${dec}`;
}

/** Tidy up when the field loses focus: "3000.5" -> "3,000.50", "0" -> "". */
export function formatMoneyBlur(text: string): string {
  const n = parseMoney(text);
  if (n === 0) return '';
  if (text.includes('.')) {
    return n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return formatMoney(n);
}

/** Number of digits and dots in `s`, used to restore the caret after reformatting. */
export function countSignificant(s: string): number {
  return (s.match(/[\d.]/g) ?? []).length;
}

/** Caret position in `formatted` that sits after `significant` digits/dots. */
export function caretFor(formatted: string, significant: number): number {
  if (significant <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/[\d.]/.test(formatted[i])) seen++;
    if (seen === significant) return i + 1;
  }
  return formatted.length;
}
