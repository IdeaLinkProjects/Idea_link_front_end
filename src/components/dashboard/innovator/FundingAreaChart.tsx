import { CHART_HEIGHT } from "./chartData";

type FundingAreaChartProps = {
  series: { t: number; v: number }[];
  isDark: boolean;
  className?: string;
};

export function FundingAreaChart({ series, isDark, className }: FundingAreaChartProps) {
  const w = 560;
  const h = CHART_HEIGHT;
  const pad = { top: 16, right: 12, bottom: 28, left: 8 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  if (series.length < 2) {
    return (
      <div
        className={`flex h-[200px] items-center justify-center text-sm ${isDark ? "text-zinc-600" : "text-zinc-400"} ${className ?? ""}`}
      >
        <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full opacity-40" preserveAspectRatio="none" aria-hidden>
          <path
            d={`M ${pad.left} ${h - pad.bottom} L ${w - pad.right} ${pad.top + innerH * 0.5} L ${w - pad.right} ${h - pad.bottom} Z`}
            fill="url(#chartFillEmpty)"
          />
          <defs>
            <linearGradient id="chartFillEmpty" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  const minT = series[0].t;
  const maxT = series[series.length - 1].t || minT + 1;
  const maxV = Math.max(...series.map((p) => p.v), 1);

  const points = series.map((p) => {
    const x = pad.left + ((p.t - minT) / (maxT - minT)) * innerW;
    const y = pad.top + innerH - (p.v / maxV) * innerH;
    return { x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${h - pad.bottom} L ${points[0].x} ${h - pad.bottom} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`h-[200px] w-full ${className ?? ""}`}
      preserveAspectRatio="none"
      role="img"
      aria-hidden
    >
      {[0.25, 0.5, 0.75].map((pct) => {
        const y = pad.top + innerH * (1 - pct);
        return (
          <line
            key={pct}
            x1={pad.left}
            x2={w - pad.right}
            y1={y}
            y2={y}
            stroke={isDark ? "#27272a" : "#e4e4e7"}
            strokeWidth="1"
          />
        );
      })}
      <path d={area} fill="url(#chartFill)" />
      <path d={line} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
        </linearGradient>
      </defs>
    </svg>
  );
}
