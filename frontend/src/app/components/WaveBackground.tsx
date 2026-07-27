/**
 * The green/orange wave background used on the shop page — extracted here
 * so Leadership and Shadow Cabinet sections (and anywhere else) can reuse
 * the exact same design instead of a copy-pasted SVG drifting out of sync.
 *
 * fixed=true: covers the whole viewport, stays put while the page scrolls
 *   (what the shop page uses).
 * fixed=false (default): fills its nearest `position: relative` ancestor,
 *   for a single section rather than the whole page — the caller must
 *   give that ancestor a height and `position: relative`.
 */
export function WaveBackground({ fixed = false }: { fixed?: boolean }) {
  return (
    <svg
      className={fixed ? 'boz-wave-bg' : undefined}
      style={fixed ? undefined : { position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      viewBox="0 0 1536 1024"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bozWaveGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f4d27" />
          <stop offset="100%" stopColor="#08301a" />
        </linearGradient>
        <radialGradient id="bozWaveOrange" cx="70%" cy="70%" r="75%">
          <stop offset="0%" stopColor="#F0A140" />
          <stop offset="55%" stopColor="#DE8A2A" />
          <stop offset="100%" stopColor="#B8681A" />
        </radialGradient>
        <radialGradient id="bozWaveOrangeSmall" cx="30%" cy="90%" r="60%">
          <stop offset="0%" stopColor="#EC9A3C" />
          <stop offset="100%" stopColor="#C4711F" />
        </radialGradient>
      </defs>

      <rect width="1536" height="1024" fill="url(#bozWaveGreen)" />

      {/* faint echo ribbon for layered depth */}
      <path d="M 1536,260 C 1280,210 1120,430 940,560 C 760,690 640,650 500,800 C 400,910 330,960 240,1024 L 1536,1024 Z"
        fill="#0d4322" opacity="0.55" />

      {/* main flowing orange sweep */}
      <path d="M 1536,360 C 1300,300 1160,520 970,650 C 780,780 660,730 520,880 C 420,990 350,1010 260,1024 L 1536,1024 Z"
        fill="url(#bozWaveOrange)" />
      <path d="M 1536,360 C 1300,300 1160,520 970,650 C 780,780 660,730 520,880 C 420,990 350,1010 260,1024"
        fill="none" stroke="#F4C066" strokeWidth="2.5" opacity="0.8" />

      {/* small orange bulge, bottom-left */}
      <path d="M 0,760 C 90,820 190,900 130,1024 L 0,1024 Z" fill="url(#bozWaveOrangeSmall)" />
      <path d="M 0,760 C 90,820 190,900 130,1024" fill="none" stroke="#F4C066" strokeWidth="2" opacity="0.7" />

      {/* thin gold ring accent, top-left */}
      <circle cx="20" cy="20" r="230" fill="none" stroke="#F4C066" strokeWidth="1.2" opacity="0.35" />
      <circle cx="20" cy="20" r="210" fill="none" stroke="#F4C066" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}
