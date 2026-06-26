import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  color: string;
  twinkle: number;
  twinkleSpeed: number;
}

export function MovingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const STAR_COUNT = 800;
    const SPEED = 0.85;
    const STAR_MAX_SIZE = 4;
    let width = 0;
    let height = 0;
    let animId: number;

    // 24 ultra-vivid neon colours
    const COLORS = [
      '255, 50,  50',    // neon red
      '255, 0,   120',   // hot pink
      '255, 80,  0',     // neon orange
      '255, 220, 0',     // electric yellow
      '180, 255, 0',     // neon lime
      '0,   255, 80',    // neon green
      '0,   255, 200',   // neon mint
      '0,   220, 255',   // neon cyan
      '0,   140, 255',   // electric blue
      '80,  80,  255',   // neon indigo
      '180, 0,   255',   // neon purple
      '255, 0,   200',   // neon magenta
      '255, 140, 200',   // pastel pink
      '140, 255, 255',   // ice blue
      '255, 255, 180',   // warm white
      '255, 200, 100',   // amber
      '100, 255, 140',   // spring green
      '255, 100, 255',   // orchid
      '0,   255, 255',   // aqua
      '255, 255, 255',   // pure white
      '200, 100, 255',   // lavender
      '255, 160, 0',     // deep gold
      '0,   255, 160',   // seafoam
      '255, 60,  160',   // raspberry
    ];

    const stars: Star[] = [];

    function randomColor() {
      return COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    function randomStar(): Star {
      return {
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        px: 0,
        py: 0,
        color: randomColor(),
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.04 + Math.random() * 0.08,
      };
    }

    function resize() {
      width = canvas!.width = canvas!.offsetWidth;
      height = canvas!.height = canvas!.offsetHeight;
    }

    function init() {
      resize();
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        const s = randomStar();
        s.z = Math.random() * width;
        stars.push(s);
      }
    }

    function project(x: number, y: number, z: number) {
      const fov = width / 2;
      const scale = fov / z;
      return {
        sx: x * scale + width / 2,
        sy: y * scale + height / 2,
      };
    }

    function draw() {
      // Clear fully transparent — preserves the original page background
      ctx!.clearRect(0, 0, width, height);

      for (const star of stars) {
        star.z -= SPEED;
        star.twinkle += star.twinkleSpeed;

        if (star.z <= 0) {
          Object.assign(star, randomStar());
          star.z = width;
          star.px = 0;
          star.py = 0;
          continue;
        }

        const curr = project(star.x, star.y, star.z);

        if (curr.sx < -20 || curr.sx > width + 20 || curr.sy < -20 || curr.sy > height + 20) {
          Object.assign(star, randomStar());
          star.z = width;
          star.px = 0;
          star.py = 0;
          continue;
        }

        const progress = 1 - star.z / width;
        const twinkleFactor = 0.75 + 0.25 * Math.sin(star.twinkle);
        const size = Math.max(0.3, STAR_MAX_SIZE * progress * twinkleFactor);
        const opacity = Math.min(1, progress * 2) * twinkleFactor;

        // Colour trail streak
        if (star.px !== 0 && star.py !== 0) {
          const trailLen = Math.hypot(curr.sx - star.px, curr.sy - star.py);
          if (trailLen > 0.5) {
            const grad = ctx!.createLinearGradient(star.px, star.py, curr.sx, curr.sy);
            grad.addColorStop(0, `rgba(${star.color}, 0)`);
            grad.addColorStop(1, `rgba(${star.color}, ${opacity * 0.9})`);
            ctx!.beginPath();
            ctx!.moveTo(star.px, star.py);
            ctx!.lineTo(curr.sx, curr.sy);
            ctx!.strokeStyle = grad;
            ctx!.lineWidth = size * 0.8;
            ctx!.lineCap = 'round';
            ctx!.stroke();
          }
        }

        // Outer glow (large, soft)
        const outerGlow = ctx!.createRadialGradient(curr.sx, curr.sy, 0, curr.sx, curr.sy, size * 5);
        outerGlow.addColorStop(0, `rgba(${star.color}, ${opacity * 0.4})`);
        outerGlow.addColorStop(1, `rgba(${star.color}, 0)`);
        ctx!.beginPath();
        ctx!.arc(curr.sx, curr.sy, size * 5, 0, Math.PI * 2);
        ctx!.fillStyle = outerGlow;
        ctx!.fill();

        // Inner halo
        const innerGlow = ctx!.createRadialGradient(curr.sx, curr.sy, 0, curr.sx, curr.sy, size * 2);
        innerGlow.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        innerGlow.addColorStop(0.4, `rgba(${star.color}, ${opacity * 0.9})`);
        innerGlow.addColorStop(1, `rgba(${star.color}, 0)`);
        ctx!.beginPath();
        ctx!.arc(curr.sx, curr.sy, size * 2, 0, Math.PI * 2);
        ctx!.fillStyle = innerGlow;
        ctx!.fill();

        // Bright white core
        ctx!.beginPath();
        ctx!.arc(curr.sx, curr.sy, size * 0.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx!.fill();

        star.px = curr.sx;
        star.py = curr.sy;
      }

      animId = requestAnimationFrame(draw);
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvas);

    init();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
