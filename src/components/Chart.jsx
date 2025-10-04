import React from 'react';

export function LineChart({ data, width = 600, height = 300, color = '#007bff' }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - minValue) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding + chartHeight * (1 - ratio);
        const value = minValue + range * ratio;
        return (
          <g key={ratio}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="var(--color-border-light)"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill="var(--color-text-tertiary)"
            >
              {Math.round(value)}
            </text>
          </g>
        );
      })}

      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Area under line */}
      <path
        d={`${pathData} L ${points[points.length - 1].x} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`}
        fill={color}
        fillOpacity="0.1"
      />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r="4"
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
          <title>{`${p.label}: ${p.value}`}</title>
        </g>
      ))}

      {/* X-axis labels */}
      {points.map((p, i) => {
        if (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) {
          return (
            <text
              key={i}
              x={p.x}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="var(--color-text-tertiary)"
            >
              {p.label}
            </text>
          );
        }
        return null;
      })}
    </svg>
  );
}

export function BarChart({ data, width = 600, height = 300, color = '#007bff' }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = chartWidth / data.length * 0.8;
  const barGap = chartWidth / data.length * 0.2;

  return (
    <svg width={width} height={height}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding + chartHeight * (1 - ratio);
        const value = maxValue * ratio;
        return (
          <g key={ratio}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="var(--color-border-light)"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill="var(--color-text-tertiary)"
            >
              {Math.round(value)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = padding + i * (barWidth + barGap) + barGap / 2;
        const barHeight = (d.value / maxValue) * chartHeight;
        const y = padding + chartHeight - barHeight;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx="4"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="var(--color-text-tertiary)"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function PieChart({ data, width = 300, height = 300 }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>No data available</div>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  const colors = [
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
    '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6c757d'
  ];

  let currentAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');

    const labelAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);

    return {
      pathData,
      color: colors[i % colors.length],
      label: d.label,
      value: d.value,
      percentage: ((d.value / total) * 100).toFixed(1),
      labelX,
      labelY,
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={width} height={height}>
        {slices.map((slice, i) => (
          <g key={i}>
            <path
              d={slice.pathData}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
            >
              <title>{`${slice.label}: ${slice.value} (${slice.percentage}%)`}</title>
            </path>
            {parseFloat(slice.percentage) > 5 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="white"
              >
                {slice.percentage}%
              </text>
            )}
          </g>
        ))}
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: slice.color,
                borderRadius: 4,
              }}
            />
            <span style={{ color: 'var(--color-text-primary)' }}>
              {slice.label}: {slice.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCard({ title, value, change, icon, color = '#007bff' }) {
  const isPositive = change >= 0;

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{title}</span>
        {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 32, fontWeight: 'bold', color }}>{value}</div>
      {change !== undefined && (
        <div
          style={{
            fontSize: 14,
            color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(change)}%</span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>vs last period</span>
        </div>
      )}
    </div>
  );
}
