import { describe, it, expect } from 'vitest';
import {
  parseMoney, formatMoney, formatMoneyLive, formatMoneyBlur, countSignificant, caretFor,
} from './money';

describe('formatMoneyLive', () => {
  it.each([
    ['', ''],
    ['5', '5'],
    ['50', '50'],
    ['500', '500'],
    ['3000', '3,000'],
    ['30000', '30,000'],
    ['1234567', '1,234,567'],
    ['3,0000', '30,000'],
    ['0', '0'],
    ['007', '7'],
    ['30.', '30.'],
    ['30.5', '30.5'],
    ['30.567', '30.56'],
    ['.5', '0.5'],
    ['1.2.3', '1.23'],
    ['£3,000.00', '3,000.00'],
    ['abc', ''],
  ])('%j -> %j', (input, expected) => {
    expect(formatMoneyLive(input)).toBe(expected);
  });

  it('expands k and m shorthand', () => {
    expect(formatMoneyLive('3k')).toBe('3,000');
    expect(formatMoneyLive('2.5k')).toBe('2,500');
    expect(formatMoneyLive('1m')).toBe('1,000,000');
    expect(formatMoneyLive('k')).toBe('');
  });

  it('caps the number of integer digits', () => {
    expect(formatMoneyLive('12345678901')).toBe('123,456,789');
  });
});

describe('parseMoney', () => {
  it('reads formatted text back to a number', () => {
    expect(parseMoney('3,000')).toBe(3000);
    expect(parseMoney('3,000.50')).toBe(3000.5);
    expect(parseMoney('£1,234.5')).toBe(1234.5);
    expect(parseMoney('30.')).toBe(30);
  });

  it('handles shorthand and junk', () => {
    expect(parseMoney('2.5k')).toBe(2500);
    expect(parseMoney('')).toBe(0);
    expect(parseMoney('.')).toBe(0);
    expect(parseMoney('abc')).toBe(0);
  });
});

describe('formatMoneyBlur', () => {
  it('pads decimals and clears zero', () => {
    expect(formatMoneyBlur('3,000.5')).toBe('3,000.50');
    expect(formatMoneyBlur('3,000')).toBe('3,000');
    expect(formatMoneyBlur('30.')).toBe('30.00');
    expect(formatMoneyBlur('0')).toBe('');
  });
});

describe('formatMoney', () => {
  it('groups thousands', () => {
    expect(formatMoney(3000)).toBe('3,000');
    expect(formatMoney(1234567.5)).toBe('1,234,567.5');
  });
});

describe('caret helpers', () => {
  it('keeps the caret after the same digit when a comma appears', () => {
    const sig = countSignificant('3000');
    expect(caretFor('3,000', sig)).toBe(5);
  });

  it('keeps the caret mid-number', () => {
    const sig = countSignificant('12');
    expect(caretFor('12,000', sig)).toBe(2);
  });
});
