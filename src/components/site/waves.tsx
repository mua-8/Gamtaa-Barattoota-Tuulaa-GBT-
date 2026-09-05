/**
 * Abstract flowing teal/orange waves used on dark hero surfaces,
 * matching the GBT brand artwork.
 */
export function Waves({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="gbt-wave-teal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1f9494" stopOpacity="0" />
          <stop offset="0.5" stopColor="#1f9494" stopOpacity="0.9" />
          <stop offset="1" stopColor="#37a8a8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gbt-wave-orange" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ef8113" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ef8113" stopOpacity="0.85" />
          <stop offset="1" stopColor="#f7b56b" stopOpacity="0" />
        </linearGradient>
        <filter id="gbt-wave-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      <g filter="url(#gbt-wave-blur)" fill="none" strokeLinecap="round">
        <path d="M-120 330 C 220 230, 620 430, 1320 280" stroke="url(#gbt-wave-teal)" strokeWidth="70" />
        <path d="M-120 400 C 260 300, 660 500, 1320 350" stroke="url(#gbt-wave-orange)" strokeWidth="46" />
        <path d="M-120 470 C 300 380, 700 560, 1320 420" stroke="url(#gbt-wave-teal)" strokeWidth="30" opacity="0.7" />
        <path d="M-120 260 C 240 180, 640 340, 1320 210" stroke="#0e3d40" strokeWidth="80" opacity="0.8" />
      </g>
    </svg>
  );
}
