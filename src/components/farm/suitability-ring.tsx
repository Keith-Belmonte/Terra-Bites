import { suitabilityLabel } from "@/lib/mock/crops.ts";
import { cn } from "@/lib/utils.ts";

export default function SuitabilityRing({
  score,
  size = 56,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color =
    clampedScore >= 75
      ? "text-primary"
      : clampedScore >= 60
        ? "text-chart-3"
        : "text-destructive";

  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center", color, className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clampedScore}% suitability: ${suitabilityLabel(clampedScore)}`}
    >
      <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(clampedScore / 100) * 97.4} 97.4`}
        />
      </svg>
      <span className="text-sm font-extrabold text-foreground">{clampedScore}</span>
    </span>
  );
}
