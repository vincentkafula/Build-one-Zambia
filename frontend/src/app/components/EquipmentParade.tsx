import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const EQUIPMENT = [
  {
    label: 'TRACTOR',
    caption: 'Modern tractors powering Zambian farms',
    url: 'https://images.unsplash.com/photo-1717702576954-c07131c54169?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600',
  },
  {
    label: 'GRADER',
    caption: 'Road graders levelling the path for Zambia\'s future',
    url: 'https://images.unsplash.com/photo-1584846952183-3a125b13a235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600',
  },
  {
    label: 'TOWER CRANE',
    caption: 'Tower cranes building a stronger Zambia',
    url: 'https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600',
  },
  {
    label: 'HARVESTER',
    caption: 'Combine harvesters bringing in the national harvest',
    url: 'https://images.unsplash.com/photo-1635174815612-fd9636f70146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600',
  },
  {
    label: 'LARGE STONE CRUSHER',
    caption: 'Heavy quarry machinery processing Zambia\'s rich minerals',
    url: 'https://images.unsplash.com/photo-1680463990599-9d318aaecf71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600',
  },
  {
    label: 'PLANTER',
    caption: 'Precision planters seeding Zambia\'s food security',
    url: 'https://images.unsplash.com/photo-1655048410161-a5a908bb54a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600',
  },
  {
    label: 'PLOW',
    caption: 'Plows preparing fertile Zambian soil for abundance',
    url: 'https://images.unsplash.com/photo-1533062618053-d51e617307ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600',
  },
];

const SLIDE_DURATION = 4500; // ms per slide

export function EquipmentParade() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const total = EQUIPMENT.length;

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent((idx + total) % total);
      setFading(false);
    }, 420);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(t);
  }, [next]);

  const slide = EQUIPMENT[current];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '380px',
        overflow: 'hidden',
        backgroundColor: '#0a1a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Image — contain so full picture is always visible */}
      <img
        key={current}
        src={slide.url}
        alt={slide.label}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.42s ease',
          display: 'block',
        }}
      />

      {/* Bottom gradient for label legibility only */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Equipment label — bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '28px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {/* Green accent bar */}
        <div style={{ width: '48px', height: '4px', backgroundColor: '#4ade80', borderRadius: '2px', marginBottom: '6px' }} />
        <span
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.08em',
            lineHeight: 1,
            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
          }}
        >
          {slide.label}
        </span>
        <span
          style={{
            fontFamily: 'Open Sans, sans-serif',
            fontSize: '14px',
            color: '#d1fae5',
            opacity: 0.9,
            textShadow: '0 1px 6px rgba(0,0,0,0.5)',
          }}
        >
          {slide.caption}
        </span>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          {EQUIPMENT.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={EQUIPMENT[i].label}
              style={{
                width: i === current ? '32px' : '10px',
                height: '10px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                transition: 'width 0.3s ease, background 0.3s ease',
                backgroundColor: i === current ? '#4ade80' : 'rgba(255,255,255,0.4)',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Slide counter — top right */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          fontFamily: 'Oswald, sans-serif',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.12em',
        }}
      >
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous"
        style={{
          position: 'absolute',
          top: '50%',
          left: '16px',
          transform: 'translateY(-50%)',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.35)',
          backgroundColor: 'rgba(0,0,0,0.35)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(22,163,74,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.35)')}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        style={{
          position: 'absolute',
          top: '50%',
          right: '16px',
          transform: 'translateY(-50%)',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.35)',
          backgroundColor: 'rgba(0,0,0,0.35)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(22,163,74,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.35)')}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
