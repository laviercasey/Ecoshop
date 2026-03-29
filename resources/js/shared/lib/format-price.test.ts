import { formatPrice } from './format-price';

describe('formatPrice', () => {
  it('formats integer price', () => {
    const result = formatPrice(1500);
    expect(result).toMatch(/1[\s\u00a0]?500/);
    expect(result).toContain('₽');
  });

  it('formats zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
    expect(result).toContain('₽');
  });

  it('formats large number', () => {
    const result = formatPrice(1500000);
    expect(result).toMatch(/1[\s\u00a0]?500[\s\u00a0]?000/);
    expect(result).toContain('₽');
  });

  it('returns a string', () => {
    expect(typeof formatPrice(100)).toBe('string');
  });
});
