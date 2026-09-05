/**
 * Lightweight, dependency-free SVG charts with accessible labels.
 * Demo data for Phase 1; values will later come from Supabase.
 */

const fmt = (n: number) => n.toLocaleString("en-US");

interface SeriesPoint {
  year: string;
  value: number;
}

/* ── Bar chart ─────────────────────────────────────── */

export function BarChart({
  data,
  label,
  color = "var(--chart-1)",
}: {
  data: SeriesPoint[];
  label: string;
  color?: string;
}) {
  const W = 560;
  const H = 280;
  const PAD = { top: 24, right: 12, bottom: 36, left: 44 };
  const max = Math.max(...data.map((d) => d.value)) * 1.15;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const step = innerW / data.length;
  const barW = Math.min(step * 0.55, 56);

  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) =>
    Math.round((max / ticks) * i)
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${label}: ${data.map((d) => `${d.year} ${fmt(d.value)}`).join(", ")}`}
      className="h-auto w-full"
    >
      {tickValues.map((t) => {
        const y = PAD.top + innerH - (t / max) * innerH;
        return (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
              {fmt(t)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = PAD.left + step * i + (step - barW) / 2;
        const y = PAD.top + innerH - h;
        return (
          <g key={d.year}>
            <rect x={x} y={y} width={barW} height={h} rx="6" fill={color}>
              <title>{`${d.year}: ${fmt(d.value)}`}</title>
            </rect>
            <text x={x + barW / 2} y={y - 7} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--foreground)">
              {fmt(d.value)}
            </text>
            <text x={x + barW / 2} y={H - 12} textAnchor="middle" fontSize="12" fill="var(--muted-foreground)">
              {d.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Donut chart ───────────────────────────────────── */

interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ data, label }: { data: DonutDatum[]; label: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 80;
  const C = 2 * Math.PI * R;

  const segments = data.reduce<{ list: (DonutDatum & { dash: number; offset: number; frac: number })[]; acc: number }>(
    (state, d) => {
      const frac = d.value / total;
      const seg = { ...d, frac, dash: frac * C, offset: state.acc };
      return { list: [...state.list, seg], acc: state.acc + frac * C };
    },
    { list: [], acc: 0 }
  ).list;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <svg
        viewBox="0 0 220 220"
        role="img"
        aria-label={`${label}: ${data.map((d) => `${d.label} ${fmt(d.value)}`).join(", ")}`}
        className="h-52 w-52 shrink-0"
      >
        <g transform="rotate(-90 110 110)">
          {segments.map((d) => (
            <circle
              key={d.label}
              cx="110"
              cy="110"
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth="30"
              strokeDasharray={`${d.dash} ${C - d.dash}`}
              strokeDashoffset={-d.offset}
            >
              <title>{`${d.label}: ${fmt(d.value)} (${Math.round(d.frac * 100)}%)`}</title>
            </circle>
          ))}
        </g>
        <text x="110" y="104" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--foreground)">
          {fmt(total)}
        </text>
        <text x="110" y="126" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
          total hours
        </text>
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: d.color }} aria-hidden="true" />
            <span className="font-semibold text-foreground">{d.label}</span>
            <span className="text-muted-foreground tabular-nums">
              {fmt(d.value)} · {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Area chart ────────────────────────────────────── */

export function AreaChart({
  data,
  label,
  color = "var(--chart-2)",
}: {
  data: SeriesPoint[];
  label: string;
  color?: string;
}) {
  const W = 560;
  const H = 260;
  const PAD = { top: 20, right: 16, bottom: 34, left: 40 };
  const max = Math.max(...data.map((d) => d.value)) * 1.15;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const pts = data.map((d, i) => ({
    x: PAD.left + (innerW / (data.length - 1)) * i,
    y: PAD.top + innerH - (d.value / max) * innerH,
    ...d,
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${PAD.top + innerH} L${pts[0].x},${PAD.top + innerH} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${label}: ${data.map((d) => `${d.year} ${fmt(d.value)}`).join(", ")}`}
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD.top + innerH - f * innerH;
        return (
          <g key={f}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="var(--border)" />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
              {fmt(Math.round(max * f))}
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#area-fill)" />
      <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {pts.map((p) => (
        <g key={p.year}>
          <circle cx={p.x} cy={p.y} r="4.5" fill="var(--card)" stroke={color} strokeWidth="3">
            <title>{`${p.year}: ${fmt(p.value)}`}</title>
          </circle>
          <text x={p.x} y={H - 10} textAnchor="middle" fontSize="12" fill="var(--muted-foreground)">
            {p.year}
          </text>
        </g>
      ))}
    </svg>
  );
}
