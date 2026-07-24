interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 48 }: ScoreRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  const color =
    score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute text-xs font-bold"
        style={{ color, fontSize: size < 44 ? 10 : 12 }}
      >
        {score}
      </span>
    </div>
  );
}
