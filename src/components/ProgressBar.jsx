import React from 'react';

export function ProgressBar({ 
  progress, 
  height = 8, 
  color = 'var(--color-primary)', 
  backgroundColor = 'var(--color-bg-tertiary)',
  showLabel = false,
  animated = false,
  striped = false 
}) {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease',
            borderRadius: height / 2,
            background: striped
              ? `repeating-linear-gradient(
                  45deg,
                  ${color},
                  ${color} 10px,
                  ${color}dd 10px,
                  ${color}dd 20px
                )`
              : color,
            animation: animated ? 'progress-animation 1s linear infinite' : 'none',
          }}
        />
      </div>
      {showLabel && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            marginTop: 4,
            textAlign: 'right',
          }}
        >
          {percentage.toFixed(0)}%
        </div>
      )}
      <style>
        {`
          @keyframes progress-animation {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 40px 0;
            }
          }
        `}
      </style>
    </div>
  );
}

export function CircularProgress({ 
  progress, 
  size = 100, 
  strokeWidth = 8, 
  color = 'var(--color-primary)',
  backgroundColor = 'var(--color-bg-tertiary)',
  showLabel = true 
}) {
  const percentage = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: size / 4,
            fontWeight: 'bold',
            color: 'var(--color-text-primary)',
          }}
        >
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
}
