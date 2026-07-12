import React from "react";

export default function ScoreGauge({ score, size = 140, label, sublabel }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score || 0));
  const offset = circumference - (clampedScore / 100) * circumference;

  // Color based on score
  const getColor = (s) => {
    if (s >= 80) return "var(--score-excellent)";
    if (s >= 65) return "var(--score-good)";
    if (s >= 50) return "var(--score-average)";
    if (s >= 35) return "var(--score-poor)";
    return "var(--score-bad)";
  };

  const color = getColor(clampedScore);

  return (
    <div className="score-gauge" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="gauge-svg">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="6"
        />

        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="gauge-progress"
        />

        {/* Score number */}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize={size * 0.22}
          fontWeight="700"
          fontFamily="var(--font-sans)"
        >
          {clampedScore}
        </text>

        {/* Label */}
        {label && (
          <text
            x={size / 2}
            y={size / 2 + size * 0.16}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize={size * 0.085}
            fontWeight="500"
            fontFamily="var(--font-sans)"
          >
            {label}
          </text>
        )}
      </svg>

      {sublabel && <p className="gauge-sublabel">{sublabel}</p>}

      <style>{`
        .score-gauge {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gauge-svg {
          width: 100%;
          height: 100%;
        }

        .gauge-progress {
          animation: dashOffset 1.5s var(--ease-out) forwards;
        }

        .gauge-sublabel {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 0.3rem;
        }
      `}</style>
    </div>
  );
}
