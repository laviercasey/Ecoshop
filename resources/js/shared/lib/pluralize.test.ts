import { pluralize } from './pluralize';

describe('pluralize', () => {
  const one = 'товар';
  const few = 'товара';
  const many = 'товаров';

  it('returns "one" form for 1', () => {
    expect(pluralize(1, one, few, many)).toBe('1 товар');
  });

  it('returns "few" form for 2, 3, 4', () => {
    expect(pluralize(2, one, few, many)).toBe('2 товара');
    expect(pluralize(3, one, few, many)).toBe('3 товара');
    expect(pluralize(4, one, few, many)).toBe('4 товара');
  });

  it('returns "many" form for 5, 6, 11, 12, 14, 20', () => {
    expect(pluralize(5, one, few, many)).toBe('5 товаров');
    expect(pluralize(6, one, few, many)).toBe('6 товаров');
    expect(pluralize(11, one, few, many)).toBe('11 товаров');
    expect(pluralize(12, one, few, many)).toBe('12 товаров');
    expect(pluralize(14, one, few, many)).toBe('14 товаров');
    expect(pluralize(20, one, few, many)).toBe('20 товаров');
  });

  it('handles 21, 22, 25 correctly', () => {
    expect(pluralize(21, one, few, many)).toBe('21 товар');
    expect(pluralize(22, one, few, many)).toBe('22 товара');
    expect(pluralize(25, one, few, many)).toBe('25 товаров');
  });

  it('handles 101 and 111 correctly', () => {
    expect(pluralize(101, one, few, many)).toBe('101 товар');
    expect(pluralize(111, one, few, many)).toBe('111 товаров');
  });
});
