export function Sparkline({
  values,
  width = 120,
  height = 40,
  stroke = "currentColor",
  strokeWidth = 1.5,
  fill = "currentColor",
  fillOpacity = 0.1,
  className,
}: {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  className?: string;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const xStep = width / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * xStep;
    const y = height - 4 - ((v - min) / range) * (height - 8);
    return [x, y] as const;
  });

  // Smooth path (catmull-rom-ish via cubic beziers)
  const linePath = pts
    .map((p, i) => {
      if (i === 0) return `M ${p[0]} ${p[1]}`;
      const prev = pts[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      return `Q ${cx} ${prev[1]} ${cx} ${(prev[1] + p[1]) / 2} T ${p[0]} ${p[1]}`;
    })
    .join(" ");

  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1][0]} ${height} L ${pts[0][0]} ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden
    >
      <path d={areaPath} fill={fill} fillOpacity={fillOpacity} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* end dot */}
      <circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r={2.5}
        fill={stroke}
      />
    </svg>
  );
}
