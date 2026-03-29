import { renderHook } from '@testing-library/react';
import { useSeo } from './use-seo';

function getMetaContent(attr: 'name' | 'property', key: string): string | null {
  const el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  return el?.content ?? null;
}

describe('useSeo', () => {
  afterEach(() => {
    document.title = '';
    document.querySelectorAll('meta[property^="og:"], meta[name="description"]').forEach((el) => el.remove());
  });

  it('sets document title with default suffix', () => {
    renderHook(() => useSeo({ title: 'Каталог' }));
    expect(document.title).toBe('Каталог — EcoShop');
  });

  it('sets document title with custom suffix', () => {
    renderHook(() => useSeo({ title: 'Товар', suffix: 'MyShop' }));
    expect(document.title).toBe('Товар — MyShop');
  });

  it('sets document title without suffix when empty', () => {
    renderHook(() => useSeo({ title: 'Полный заголовок', suffix: '' }));
    expect(document.title).toBe('Полный заголовок');
  });

  it('sets meta description', () => {
    renderHook(() => useSeo({ title: 'Тест', description: 'Описание страницы' }));
    expect(getMetaContent('name', 'description')).toBe('Описание страницы');
  });

  it('sets OG tags', () => {
    renderHook(() => useSeo({ title: 'OG тест', description: 'OG описание' }));
    expect(getMetaContent('property', 'og:title')).toBe('OG тест — EcoShop');
    expect(getMetaContent('property', 'og:description')).toBe('OG описание');
    expect(getMetaContent('property', 'og:url')).toBeTruthy();
  });

  it('sets og:image when provided', () => {
    renderHook(() => useSeo({ title: 'С картинкой', ogImage: '/img/test.jpg' }));
    expect(getMetaContent('property', 'og:image')).toBe('/img/test.jpg');
  });

  it('updates meta on re-render with new values', () => {
    const { rerender } = renderHook(
      ({ title, description }) => useSeo({ title, description }),
      { initialProps: { title: 'Первый', description: 'Первое описание' } },
    );

    expect(document.title).toBe('Первый — EcoShop');
    expect(getMetaContent('name', 'description')).toBe('Первое описание');

    rerender({ title: 'Второй', description: 'Второе описание' });

    expect(document.title).toBe('Второй — EcoShop');
    expect(getMetaContent('name', 'description')).toBe('Второе описание');
  });
});
