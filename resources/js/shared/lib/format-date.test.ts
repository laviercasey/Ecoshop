import { formatDate } from './format-date';

describe('formatDate', () => {
  it('formats a string date', () => {
    const result = formatDate('2024-03-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2024, 2, 15));
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns a string', () => {
    expect(typeof formatDate('2024-01-01')).toBe('string');
  });
});
