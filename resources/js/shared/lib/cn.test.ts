import { cn } from './cn';

describe('cn', () => {
  it('returns a single class string unchanged', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('merges multiple classes', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('handles conditionals and filters falsy values', () => {
    const result = cn('base', false, null, undefined, 'visible');
    expect(result).toContain('base');
    expect(result).toContain('visible');
    expect(result).not.toContain('hidden');
  });

  it('merges conflicting Tailwind classes keeping the last one', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});
