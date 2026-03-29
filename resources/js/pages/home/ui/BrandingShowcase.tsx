import { useEffect, useState } from 'react';

const ITEMS = [
  { type: 'cup', label: 'Стакан', size: '300 мл' },
  { type: 'box', label: 'Контейнер', size: '750 мл' },
  { type: 'bowl', label: 'Салатник', size: '500 мл' },
  { type: 'bag', label: 'Пакет', size: 'S' },
];

function PackageSvg({ type, className }: { type: string; className?: string }) {
  const cn = className ?? 'w-full h-full';
  switch (type) {
    case 'cup':
      return (
        <svg viewBox="0 0 120 160" className={cn} fill="none">
          <path d="M30 20 L25 140 Q25 150 35 150 L85 150 Q95 150 95 140 L90 20 Z" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.08" />
          <path d="M30 20 Q60 10 90 20" stroke="currentColor" strokeWidth="3" fill="none" />
          <ellipse cx="60" cy="20" rx="30" ry="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.04" />
        </svg>
      );
    case 'box':
      return (
        <svg viewBox="0 0 160 120" className={cn} fill="none">
          <rect x="15" y="25" width="130" height="80" rx="8" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.08" />
          <path d="M15 25 Q80 15 145 25" stroke="currentColor" strokeWidth="3" fill="none" />
          <line x1="15" y1="50" x2="145" y2="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
        </svg>
      );
    case 'bowl':
      return (
        <svg viewBox="0 0 160 120" className={cn} fill="none">
          <path d="M20 40 Q20 100 80 105 Q140 100 140 40" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.08" />
          <ellipse cx="80" cy="40" rx="60" ry="15" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.04" />
        </svg>
      );
    case 'bag':
      return (
        <svg viewBox="0 0 120 160" className={cn} fill="none">
          <rect x="20" y="35" width="80" height="110" rx="4" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.08" />
          <path d="M20 35 L25 20 Q30 15 35 15 L85 15 Q90 15 95 20 L100 35" stroke="currentColor" strokeWidth="3" fill="none" />
          <path d="M40 15 Q40 0 60 0 Q80 0 80 15" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>
      );
    default:
      return null;
  }
}

function LogoStamp({ visible, stamped }: { visible: boolean; stamped: boolean }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-green-primary transition-all duration-500 ${
          stamped ? 'scale-100 rotate-[-12deg]' : 'scale-[2] rotate-0'
        }`}
      >
        <div className={`text-center transition-opacity duration-300 ${stamped ? 'opacity-100' : 'opacity-60'}`}>
          <div className="text-[11px] font-black leading-none tracking-[0.15em] text-green-primary">YOUR</div>
          <div className="text-[15px] font-black leading-none tracking-wider text-green-dark">LOGO</div>
        </div>
      </div>
      {stamped && (
        <div className="absolute h-16 w-16 animate-ping rounded-full border-2 border-green-primary/30" style={{ animationIterationCount: 1, animationDuration: '0.6s' }} />
      )}
    </div>
  );
}

export function BrandingShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<'enter' | 'stamp' | 'show'>('enter');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    function cycle() {
      setPhase('enter');
      timers.push(setTimeout(() => setPhase('stamp'), 800));
      timers.push(setTimeout(() => setPhase('show'), 1500));
      timers.push(setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % ITEMS.length);
      }, 3500));
    }

    cycle();
    const interval = setInterval(cycle, 3500);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [activeIndex]);

  const item = ITEMS[activeIndex];

  return (
    <div className="relative flex h-[460px] w-full max-w-[520px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-subtle via-white to-green-subtle">

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #689F38 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />


      <div className="absolute left-6 top-8 h-3 w-3 rounded-full bg-green-primary/20 branding-float" />
      <div className="absolute right-10 top-16 h-2 w-2 rounded-full bg-orange-primary/20 branding-float-delay" />
      <div className="absolute bottom-12 left-12 h-2.5 w-2.5 rounded-full bg-green-primary/15 branding-float" />
      <div className="absolute bottom-20 right-8 h-2 w-2 rounded-full bg-green-dark/20 branding-float-delay" />


      <div className="relative flex flex-col items-center">
        <div
          className={`relative h-[200px] w-[200px] text-green-dark/60 transition-all duration-700 ${
            phase === 'enter' ? 'translate-y-4 opacity-0 scale-90' : 'translate-y-0 opacity-100 scale-100'
          }`}
        >
          <PackageSvg type={item.type} />
          <LogoStamp
            visible={phase === 'stamp' || phase === 'show'}
            stamped={phase === 'show'}
          />
        </div>


        <div
          className={`mt-4 text-center transition-all duration-500 delay-200 ${
            phase === 'enter' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <p className="text-lg font-bold text-text-primary">{item.label}</p>
          <p className="text-sm text-text-tertiary">{item.size}</p>
        </div>


        <div className="mt-6 flex gap-2">
          {ITEMS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-6 bg-green-primary' : 'w-2 bg-green-primary/25'
              }`}
            />
          ))}
        </div>
      </div>


      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-green-primary/5" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-orange-primary/5" />
    </div>
  );
}
