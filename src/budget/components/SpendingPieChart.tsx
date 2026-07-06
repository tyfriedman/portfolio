"use client";

import { formatCurrency } from "@/budget/lib/format";

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

interface SpendingPieChartProps {
  slices: PieSlice[];
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle - Math.PI / 2),
    y: cy + r * Math.sin(angle - Math.PI / 2),
  };
}

/** Lightweight SVG pie chart of spending by category — no chart library. */
export function SpendingPieChart({ slices }: SpendingPieChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total <= 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        No spending yet this month.
      </p>
    );
  }

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  let cumulative = 0;
  const paths = slices
    .filter((s) => s.value > 0)
    .map((slice) => {
      const startAngle = (cumulative / total) * Math.PI * 2;
      cumulative += slice.value;
      const endAngle = (cumulative / total) * Math.PI * 2;

      // A single slice covering everything: draw a full circle instead of an arc
      if (endAngle - startAngle >= Math.PI * 2 - 1e-6) {
        return (
          <circle key={slice.name} cx={cx} cy={cy} r={r} fill={slice.color} />
        );
      }

      const start = polarToCartesian(cx, cy, r, startAngle);
      const end = polarToCartesian(cx, cy, r, endAngle);
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;

      return (
        <path
          key={slice.name}
          d={d}
          fill={slice.color}
          strokeWidth="1"
          className="stroke-white dark:stroke-gray-950"
        />
      );
    });

  return (
    <div className="flex items-start justify-center gap-8 p-3">
      <svg
        className="shrink-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Spending by category"
      >
        {paths}
      </svg>
      <ul className="min-w-0 flex-1 text-xs">
        {slices
          .filter((s) => s.value > 0)
          .sort((a, b) => b.value - a.value)
          .map((slice) => (
            <li key={slice.name} className="flex items-center gap-1.5 py-0.5">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: slice.color }}
              />
              <span>{slice.name}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {((slice.value / total) * 100).toFixed(1)}% ·{" "}
                {formatCurrency(slice.value)}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
