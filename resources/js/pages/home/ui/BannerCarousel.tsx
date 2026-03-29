import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@entities/banner';

interface BannerCarouselProps {
  banners: Banner[];
}

const AUTOPLAY_INTERVAL = 5000;

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const activeBanners = banners.filter((b) => b.is_active);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  useEffect(() => {
    if (activeBanners.length <= 1 || isHovered) return;
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, activeBanners.length, isHovered]);

  if (activeBanners.length === 0) return null;

  const banner = activeBanners[current];

  const isExternal = banner.link?.startsWith('http');

  const content = (
    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-green-primary to-green-dark">
      {banner.image_url ? (
        <img
          src={banner.image_url}
          alt={banner.title}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
        <h3 className="text-2xl font-bold text-white lg:text-3xl">{banner.title}</h3>
        {banner.subtitle && (
          <p className="mt-2 max-w-xl text-base text-white/80 lg:text-lg">{banner.subtitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {banner.link ? (
        isExternal ? (
          <a href={banner.link} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        ) : (
          <Link to={banner.link}>{content}</Link>
        )
      ) : (
        content
      )}

      {activeBanners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
            aria-label="Предыдущий баннер"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
            aria-label="Следующий баннер"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {activeBanners.map((_, i) => (
              <button
                key={activeBanners[i].id}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Баннер ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
